-- Full database setup. Run once on a fresh Supabase project (SQL editor),
-- then run the seed: node --env-file=.env db/seed.js

create extension if not exists pg_cron;

-- Products

create table public.products (
  id integer generated always as identity primary key,
  title text not null unique,
  description text,
  category text,
  price numeric(10, 2) not null,
  stock numeric,
  -- Stock level it goes back to on every restock (set by the seed).
  full_stock integer,
  images text[],
  thumbnail text
);

alter table public.products enable row level security;
create policy "Allow public read access" on public.products
  for select to anon using (true);

-- Carts

create table public.cart_items (
  id bigint generated always as identity primary key,
  cart_id uuid not null,
  product_id integer not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

alter table public.cart_items enable row level security;

-- Orders

create table public.orders (
  id bigint generated always as identity primary key,
  cart_id uuid not null,
  total numeric(10, 2) not null,
  status text not null check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

-- Title and price are copied at purchase time.
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id integer not null references public.products(id),
  title text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Restock timer (one row)

create table public.restock_settings (
  id boolean primary key default true check (id),
  interval_minutes integer not null check (interval_minutes > 0),
  last_restocked_at timestamptz
);
insert into public.restock_settings (interval_minutes) values (5);

alter table public.restock_settings enable row level security;

-- Adds to a cart line. Fails if the cart would exceed stock.
create function public.add_to_cart(p_cart_id uuid, p_product_id integer, p_quantity integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_stock integer;
  v_quantity integer;
begin
  select coalesce(stock, 0) into v_stock
  from public.products
  where id = p_product_id;

  if not found then
    raise exception 'Product not found' using errcode = 'P0002';
  end if;

  insert into public.cart_items (cart_id, product_id, quantity)
  values (p_cart_id, p_product_id, p_quantity)
  on conflict (cart_id, product_id)
  do update set quantity = public.cart_items.quantity + excluded.quantity
  returning quantity into v_quantity;

  if v_quantity > v_stock then
    raise exception 'Only % left in stock', v_stock using errcode = 'P0001';
  end if;

  return v_quantity;
end;
$$;

-- Sets a cart line's quantity. Only checks stock when the quantity goes up.
create function public.set_cart_quantity(p_cart_id uuid, p_product_id integer, p_quantity integer)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_stock integer;
  v_old_quantity integer;
begin
  select quantity into v_old_quantity
  from public.cart_items
  where cart_id = p_cart_id and product_id = p_product_id;

  if not found then
    raise exception 'Item not in cart' using errcode = 'P0002';
  end if;

  -- Lowering a quantity is always allowed; only increases need stock.
  if p_quantity > v_old_quantity then
    select coalesce(stock, 0) into v_stock
    from public.products
    where id = p_product_id;

    if p_quantity > v_stock then
      raise exception 'Only % left in stock', v_stock using errcode = 'P0001';
    end if;
  end if;

  update public.cart_items
  set quantity = p_quantity
  where cart_id = p_cart_id and product_id = p_product_id;
end;
$$;

-- Turns a cart into a paid order: checks stock, lowers it, saves the order,
-- empties the cart. Any failure leaves everything unchanged.
create function public.checkout(p_cart_id uuid)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_item_ids bigint[];
  v_short record;
  v_order_id bigint;
begin
  -- Lock this cart's lines so their quantities can't change mid-checkout.
  select array_agg(id) into v_item_ids
  from (
    select id from public.cart_items
    where cart_id = p_cart_id
    for update
  ) locked;

  if v_item_ids is null then
    raise exception 'Cart is empty' using errcode = '22023';
  end if;

  -- Lock the products (in id order, to avoid deadlocks between buyers).
  perform 1 from public.products
  where id in (select product_id from public.cart_items where id = any(v_item_ids))
  order by id
  for update;

  select p.title, coalesce(p.stock, 0) as stock into v_short
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids) and ci.quantity > coalesce(p.stock, 0)
  limit 1;

  if found then
    raise exception 'Only % left of "%"', v_short.stock, v_short.title using errcode = 'P0001';
  end if;

  update public.products p
  set stock = p.stock - ci.quantity
  from public.cart_items ci
  where ci.id = any(v_item_ids) and p.id = ci.product_id;

  insert into public.orders (cart_id, total, status)
  select p_cart_id, round(sum(p.price * ci.quantity), 2), 'paid'
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, title, unit_price, quantity)
  select v_order_id, p.id, p.title, p.price, ci.quantity
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids);

  delete from public.cart_items where id = any(v_item_ids);

  return v_order_id;
end;
$$;

-- When the next restock happens (clock-aligned, e.g. :00, :05, :10).
create function public.next_restock_at()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select date_bin(make_interval(mins => interval_minutes), now(), timestamptz '2000-01-01')
       + make_interval(mins => interval_minutes)
  from public.restock_settings;
$$;

-- Runs every minute; restocks once per slot.
create function public.restock_if_due()
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_slot timestamptz;
begin
  select date_bin(make_interval(mins => interval_minutes), now(), timestamptz '2000-01-01')
  into v_slot
  from public.restock_settings
  for update;

  if exists (
    select 1 from public.restock_settings
    where last_restocked_at is null or last_restocked_at < v_slot
  ) then
    update public.products set stock = full_stock where full_stock is not null;
    update public.restock_settings set last_restocked_at = now();
  end if;
end;
$$;

select cron.schedule('restock-products', '* * * * *', 'select public.restock_if_due()');

-- Permissions: the public (anon) key can only read products.
-- Everything else goes through the server's service-role key.

grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to service_role;
grant select, insert, update, delete on table public.cart_items to service_role;
grant select, insert on table public.orders, public.order_items to service_role;
grant select on table public.restock_settings to service_role;

revoke execute on function
  public.add_to_cart(uuid, integer, integer),
  public.set_cart_quantity(uuid, integer, integer),
  public.checkout(uuid),
  public.next_restock_at(),
  public.restock_if_due()
from public, anon, authenticated;

grant execute on function
  public.add_to_cart(uuid, integer, integer),
  public.set_cart_quantity(uuid, integer, integer),
  public.checkout(uuid),
  public.next_restock_at()
to service_role;
