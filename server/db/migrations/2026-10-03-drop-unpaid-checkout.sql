-- Removes the old checkout that marked orders paid without any payment.
-- Paid orders now go through create_pending_order + Stripe + finalize_order.
drop function if exists public.checkout(uuid);
