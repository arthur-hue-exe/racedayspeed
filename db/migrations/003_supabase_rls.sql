-- Supabase expõe o schema public via PostgREST. A loja acessa o banco
-- exclusivamente pelo servidor (role postgres, que ignora RLS), então
-- habilitar RLS sem policies bloqueia qualquer acesso com a chave publicável.
alter table categories enable row level security;
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
alter table settings enable row level security;
