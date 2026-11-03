-- Token público do pedido: o código sequencial (#RD-000001) é exibido ao cliente,
-- mas a consulta pública exige este token para impedir enumeração de pedidos.
alter table orders
  add column if not exists access_token uuid not null default gen_random_uuid();

create unique index if not exists orders_access_token_idx on orders(access_token);
