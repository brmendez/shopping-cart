-- Checkout session flow: pending orders paid via Stripe. Run once in the Supabase SQL editor.
-- Assumes the status check constraint has Postgres's default name, orders_status_check.

alter table public.orders add column if not exists stripe_payment_intent_id text unique;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'refunded'));

-- Saves a pending order from the cart at current prices. Checks stock but
-- doesn't lower it or empty the cart (finalize_order does that after payment).
create or replace function public.create_pending_order(p_cart_id uuid)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_item_ids bigint[];
  v_short record;
  v_order_id bigint;
begin
  -- Lock this cart's lines so the total and the snapshot match.
  select array_agg(id) into v_item_ids
  from (
    select id from public.cart_items
    where cart_id = p_cart_id
    for update
  ) locked;

  if v_item_ids is null then
    raise exception 'Cart is empty' using errcode = '22023';
  end if;

  select p.title, coalesce(p.stock, 0) as stock into v_short
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids) and ci.quantity > coalesce(p.stock, 0)
  limit 1;

  if found then
    if v_short.stock = 0 then
      raise exception '% is sold out', v_short.title using errcode = 'P0001';
    end if;

    raise exception 'Only % left of %', v_short.stock, v_short.title using errcode = 'P0001';
  end if;

  insert into public.orders (cart_id, total, status)
  select p_cart_id, round(sum(p.price * ci.quantity), 2), 'pending'
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, title, unit_price, quantity)
  select v_order_id, p.id, p.title, p.price, ci.quantity
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.id = any(v_item_ids);

  return v_order_id;
end;
$$;

-- Marks a pending order paid: lowers stock and removes its lines from the cart.
-- Safe to call twice. Returns 'paid', 'out_of_stock', or the order's other status.
create or replace function public.finalize_order(p_order_id bigint)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
  v_cart_id uuid;
begin
  select status, cart_id into v_status, v_cart_id
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  if v_status <> 'pending' then
    return v_status;
  end if;

  -- Lock the products (in id order, to avoid deadlocks between buyers).
  perform 1 from public.products
  where id in (select product_id from public.order_items where order_id = p_order_id)
  order by id
  for update;

  if exists (
    select 1
    from public.order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = p_order_id and oi.quantity > coalesce(p.stock, 0)
  ) then
    return 'out_of_stock';
  end if;

  update public.products p
  set stock = p.stock - oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id and p.id = oi.product_id;

  update public.orders set status = 'paid' where id = p_order_id;

  delete from public.cart_items
  where cart_id = v_cart_id
    and product_id in (select product_id from public.order_items where order_id = p_order_id);

  return 'paid';
end;
$$;

grant update on table public.orders to service_role;

revoke execute on function
  public.create_pending_order(uuid),
  public.finalize_order(bigint)
from public, anon, authenticated;

grant execute on function
  public.create_pending_order(uuid),
  public.finalize_order(bigint)
to service_role;
