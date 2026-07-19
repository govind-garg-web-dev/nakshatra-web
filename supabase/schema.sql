-- Nakshatra database schema. Run this once in your Supabase project's
-- SQL Editor (Supabase Dashboard > SQL Editor > New query > paste > Run).
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE).
--
-- RLS is intentionally left disabled for MVP simplicity — all writes go
-- through server routes using the service role key. Revisit before public
-- launch if you ever query these tables directly from the browser.

-- USERS (linked to Supabase auth.users via id)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text,
  created_at    timestamp default now(),
  last_active   timestamp default now(),
  tags          text[] default '{}'  -- life-context tags Tara has picked up (job_seeker, marriage_planning, ...)
);

-- Adds the tags column if you already ran an earlier version of this schema.
alter table profiles add column if not exists tags text[] default '{}';

-- SAVED CHARTS (a user can save many)
create table if not exists charts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  label         text,               -- "Me", "Partner", "Mom"
  dob           date not null,
  tob           text,               -- "06:22" or "sunrise"
  pob           text,
  latitude      float,
  longitude     float,
  chart_json    jsonb,              -- full computed chart
  created_at    timestamp default now()
);

-- CONVERSATIONS (Tara chat history)
create table if not exists conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  role          text check (role in ('user','assistant')),
  content       text,
  created_at    timestamp default now()
);

-- CREDITS (AI question balance)
create table if not exists credits (
  user_id       uuid primary key references profiles(id) on delete cascade,
  balance       integer default 3,   -- 3 free questions to start
  updated_at    timestamp default now()
);

-- ORDERS (Razorpay)
create table if not exists orders (
  id            text primary key,    -- razorpay payment link id (see lib/payments/razorpay.ts)
  user_id       uuid references profiles(id),
  product       text,                -- 'yearly_report','guna_report','questions_20', etc.
  amount        integer,             -- paise
  status        text default 'created' check (status in ('created','paid','failed')),
  created_at    timestamp default now(),
  paid_at       timestamp
);

-- REPORTS (generated, unlocked after payment)
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id),
  order_id      text references orders(id),
  type          text,
  content_md    text,                -- generated markdown/HTML
  created_at    timestamp default now()
);

create index if not exists idx_charts_user on charts(user_id);
create index if not exists idx_conv_user_time on conversations(user_id, created_at desc);
create index if not exists idx_orders_user on orders(user_id);
