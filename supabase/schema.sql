-- 3D Cafe Management Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database tables and seed data.

-- 1. CLEANUP (Optional: Uncomment to reset tables)
-- drop table if exists orders;
-- drop table if exists inventory;
-- drop table if exists transactions;
-- drop table if exists customers;
-- drop table if exists employees;

-- 2. CREATE TABLES

-- Orders Table
create table if not exists orders (
    id text primary key,
    customer text not null,
    items jsonb not null, -- Array of items: [{ name, qty, price }]
    status text not null check (status in ('Received', 'Preparing', 'Ready', 'Served')),
    type text not null check (type in ('Dine-in', 'Takeaway', 'Online')),
    time text not null,
    total integer not null,
    timestamp bigint not null
);

-- Inventory Table
create table if not exists inventory (
    id text primary key,
    item text not null,
    category text not null,
    stock numeric not null,
    unit text not null,
    min_stock numeric not null,
    status text not null check (status in ('Good', 'Low', 'Critical')),
    trend text not null check (trend in ('up', 'down', 'stable'))
);

-- Transactions Table
create table if not exists transactions (
    id text primary key,
    amount numeric not null,
    method text not null check (method in ('UPI', 'Card', 'Cash')),
    status text not null check (status in ('Paid', 'Pending')),
    time text not null,
    timestamp bigint not null,
    customer text not null,
    items_summary text not null
);

-- Customers Table
create table if not exists customers (
    name text primary key,
    visits integer not null default 0,
    spent numeric not null default 0,
    tier text not null check (tier in ('Gold', 'Silver', 'Bronze')),
    last_visit text not null
);

-- Employees Table
create table if not exists employees (
    name text primary key,
    role text not null,
    shift text not null,
    status text not null check (status in ('On shift', 'Upcoming', 'Off shift')),
    score numeric not null default 100
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table orders enable row level security;
alter table inventory enable row level security;
alter table transactions enable row level security;
alter table customers enable row level security;
alter table employees enable row level security;

-- 4. CREATE POLICIES (Allow all public access for demo purposes)
-- Note: In a production environment, restrict writes or use authentication policies.

create policy "Allow public read access on orders" on orders for select using (true);
create policy "Allow public insert access on orders" on orders for insert with check (true);
create policy "Allow public update access on orders" on orders for update using (true);
create policy "Allow public delete access on orders" on orders for delete using (true);

create policy "Allow public read access on inventory" on inventory for select using (true);
create policy "Allow public update access on inventory" on inventory for update using (true);
create policy "Allow public insert access on inventory" on inventory for insert with check (true);

create policy "Allow public read access on transactions" on transactions for select using (true);
create policy "Allow public insert access on transactions" on transactions for insert with check (true);

create policy "Allow public read access on customers" on customers for select using (true);
create policy "Allow public insert access on customers" on customers for insert with check (true);
create policy "Allow public update access on customers" on customers for update using (true);
create policy "Allow public delete access on customers" on customers for delete using (true);

create policy "Allow public read access on employees" on employees for select using (true);
create policy "Allow public update access on employees" on employees for update using (true);
create policy "Allow public insert access on employees" on employees for insert with check (true);

-- 5. ENABLE REALTIME SYNCHRONIZATION
-- This is critical for the client app to receive instant changes via Supabase channel subscriptions.
do $$
begin
  -- Check if the publication exists
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Drop tables if they are in the publication
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
      execute 'alter publication supabase_realtime drop table orders';
    end if;
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inventory') then
      execute 'alter publication supabase_realtime drop table inventory';
    end if;
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions') then
      execute 'alter publication supabase_realtime drop table transactions';
    end if;
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'customers') then
      execute 'alter publication supabase_realtime drop table customers';
    end if;
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'employees') then
      execute 'alter publication supabase_realtime drop table employees';
    end if;

    -- Add all tables to the publication
    execute 'alter publication supabase_realtime add table orders, inventory, transactions, customers, employees';
  end if;
end $$;

-- 6. INSERT INITIAL SEED DATA

insert into inventory (id, item, category, stock, unit, min_stock, status, trend) values
('INV-001', 'Espresso beans (house blend)', 'Raw material', 11.45, 'kg', 3.0, 'Good', 'down'),
('INV-002', 'Whole milk', 'Dairy', 3.8, 'L', 2.0, 'Good', 'down'),
('INV-003', 'Almond milk', 'Dairy', 1.5, 'L', 3.0, 'Critical', 'down'),
('INV-004', 'Butter croissants', 'Pastry', 23, 'pcs', 10, 'Good', 'up'),
('INV-005', 'Cinnamon rolls', 'Pastry', 14, 'pcs', 5, 'Good', 'stable'),
('INV-006', 'Blueberry muffins', 'Pastry', 15, 'pcs', 6, 'Good', 'stable'),
('INV-007', 'Vanilla syrup', 'Syrup', 4.88, 'bottles', 2.0, 'Good', 'stable'),
('INV-008', 'Takeaway cups (M)', 'Packaging', 148, 'pcs', 50, 'Good', 'down')
on conflict (id) do nothing;

insert into customers (name, visits, spent, tier, last_visit) values
('Emma Thompson', 42, 18450, 'Gold', '2 days ago'),
('Michael Chen', 38, 15380, 'Gold', 'Today'),
('Sarah Jenkins', 25, 8210, 'Silver', '1 week ago')
on conflict (name) do nothing;

insert into employees (name, role, shift, status, score) values
('Alex Mercer', 'Head barista', '08:00 – 16:00', 'On shift', 98),
('Jordan Lee', 'Cashier', '08:00 – 14:00', 'On shift', 92),
('Casey Smith', 'Server', '10:00 – 18:00', 'On shift', 89),
('Sam Wilson', 'Barista', '14:00 – 22:00', 'Upcoming', 95)
on conflict (name) do nothing;

-- For timestamped data (orders and transactions), we generate them relative to current server time
insert into orders (id, customer, items, status, type, time, total, timestamp) values
('1042', 'Alice M.', '[{"name": "Caramel Macchiato", "qty": 2, "price": 360}, {"name": "Butter Croissant", "qty": 1, "price": 220}]'::jsonb, 'Received', 'Dine-in', '2m', 940, (extract(epoch from now()) * 1000)::bigint - 120000),
('1043', 'Swiggy Rider', '[{"name": "Dark Espresso", "qty": 1, "price": 180}, {"name": "Blueberry Muffin", "qty": 1, "price": 240}]'::jsonb, 'Received', 'Online', '1m', 420, (extract(epoch from now()) * 1000)::bigint - 60000),
('1040', 'John D.', '[{"name": "Iced Latte", "qty": 1, "price": 230}]'::jsonb, 'Preparing', 'Takeaway', '5m', 230, (extract(epoch from now()) * 1000)::bigint - 300000),
('1039', 'Table 4', '[{"name": "Flat White", "qty": 2, "price": 210}, {"name": "Blueberry Muffin", "qty": 2, "price": 240}]'::jsonb, 'Preparing', 'Dine-in', '8m', 900, (extract(epoch from now()) * 1000)::bigint - 480000),
('1038', 'Sarah K.', '[{"name": "Iced Cold Brew", "qty": 1, "price": 320}]'::jsonb, 'Ready', 'Takeaway', '12m', 320, (extract(epoch from now()) * 1000)::bigint - 720000)
on conflict (id) do nothing;

insert into transactions (id, amount, method, status, time, timestamp, customer, items_summary) values
('INV-2406-118', 540, 'UPI', 'Paid', '10 min ago', (extract(epoch from now()) * 1000)::bigint - 600000, 'Emma Thompson', '2x Cappuccino'),
('INV-2406-117', 220, 'Card', 'Paid', '45 min ago', (extract(epoch from now()) * 1000)::bigint - 2700000, 'Sarah Jenkins', '1x Butter Croissant'),
('INV-2406-116', 760, 'Cash', 'Paid', '1 hr ago', (extract(epoch from now()) * 1000)::bigint - 3600000, 'Michael Chen', '2x Flat White, 1x Muffin'),
('INV-2406-115', 1125, 'Card', 'Pending', '2 hr ago', (extract(epoch from now()) * 1000)::bigint - 7200000, 'Table 2', '3x Latte, 2x Cinnamon Roll')
on conflict (id) do nothing;
