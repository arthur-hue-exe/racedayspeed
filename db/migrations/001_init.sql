-- RACE DAY SPEED & GLORY — schema inicial
create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  short_description text not null default '',
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  status text not null default 'active' check (status in ('active', 'draft')),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  has_sizes boolean not null default false,
  stock integer check (stock is null or stock >= 0),
  sku text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_status_idx on products(status);

create table if not exists product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  stock integer check (stock is null or stock >= 0),
  position integer not null default 0,
  unique (product_id, label)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on product_images(product_id);

create sequence if not exists order_code_seq start 1;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique default nextval('order_code_seq'),
  code text not null generated always as ('RD-' || lpad(number::text, 6, '0')) stored unique,
  status text not null default 'awaiting_whatsapp'
    check (status in ('awaiting_whatsapp', 'awaiting_confirmation', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  cep text not null,
  state text not null,
  city text not null,
  neighborhood text not null,
  street text not null,
  address_number text not null,
  complement text not null default '',
  reference text not null default '',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer check (shipping_cents is null or shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  stock_committed boolean not null default false,
  whatsapp_opened_at timestamptz,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text not null default '',
  size_label text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  image_url text not null default ''
);

create index if not exists order_items_order_idx on order_items(order_id);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default 'Administrador',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  token_hash text primary key,
  user_id uuid not null references admin_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_user_idx on admin_sessions(user_id);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
