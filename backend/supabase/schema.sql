-- Gita Gyan App – Supabase PostgreSQL schema
-- Run this in the Supabase SQL Editor or via `supabase db push`.

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp" with schema extensions;

-- ── Helper: auto-update updated_at ────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. users ──────────────────────────────────────────────────────────────────
create table public.users (
  id                      uuid primary key default extensions.uuid_generate_v4(),
  email                   text unique,
  phone                   text unique,
  password_hash           text,
  display_name            text,
  avatar_url              text,
  language                text default 'en',
  is_premium              boolean default false,
  premium_expires_at      timestamptz,
  razorpay_customer_id    text,
  razorpay_subscription_id text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- ── 2. otp_tokens ─────────────────────────────────────────────────────────────
create table public.otp_tokens (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token       text not null,
  purpose     text default 'login',
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

create index idx_otp_tokens_user_id on public.otp_tokens(user_id);

-- ── 3. profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  user_id           uuid primary key references public.users(id) on delete cascade,
  goals             text[],
  favorite_verses   text[],
  reading_history   jsonb default '[]'::jsonb,
  chapter_progress  jsonb default '{}'::jsonb,
  total_verses_read int default 0,
  total_sessions    int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ── 4. streaks ────────────────────────────────────────────────────────────────
create table public.streaks (
  user_id         uuid primary key references public.users(id) on delete cascade,
  last_read_date  date,
  current_streak  int default 0,
  longest_streak  int default 0,
  updated_at      timestamptz default now()
);

create trigger set_streaks_updated_at
  before update on public.streaks
  for each row execute function public.update_updated_at();

-- ── 5. journal_entries ────────────────────────────────────────────────────────
create table public.journal_entries (
  id              uuid primary key default extensions.uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  happy           text,
  stressed        text,
  learned         text,
  date            date not null default current_date,
  gita_connection jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);

create index idx_journal_entries_user_date
  on public.journal_entries(user_id, date desc);

-- ── 6. mood_entries ───────────────────────────────────────────────────────────
create table public.mood_entries (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  mood        text not null,
  note        text,
  created_at  timestamptz default now()
);

create index idx_mood_entries_user_created
  on public.mood_entries(user_id, created_at desc);

-- ── 7. bookmarks ──────────────────────────────────────────────────────────────
create table public.bookmarks (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  verse_key   text not null,
  note        text,
  created_at  timestamptz default now(),
  unique (user_id, verse_key)
);

create index idx_bookmarks_user_id on public.bookmarks(user_id);

-- ── 8. reflections ────────────────────────────────────────────────────────────
create table public.reflections (
  id            uuid primary key default extensions.uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  verse_key     text not null,
  text          text not null,
  is_anonymous  boolean default false,
  mood          text,
  date          date not null default current_date,
  likes         int default 0,
  created_at    timestamptz default now()
);

create index idx_reflections_date_created
  on public.reflections(date desc, created_at desc);

-- ── 9. reflection_replies ─────────────────────────────────────────────────────
create table public.reflection_replies (
  id            uuid primary key default extensions.uuid_generate_v4(),
  reflection_id uuid not null references public.reflections(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  text          text not null,
  is_anonymous  boolean default false,
  created_at    timestamptz default now()
);

create index idx_reflection_replies_reflection_id
  on public.reflection_replies(reflection_id);

-- ── 10. today_stats ───────────────────────────────────────────────────────────
create table public.today_stats (
  user_id       uuid not null references public.users(id) on delete cascade,
  date          date not null default current_date,
  activities    jsonb default '{}'::jsonb,
  total_reward  int default 0,
  primary key (user_id, date)
);

-- ── 11. user_achievements ─────────────────────────────────────────────────────
create table public.user_achievements (
  user_id         uuid not null references public.users(id) on delete cascade,
  achievement_id  text not null,
  unlocked_at     timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- ── 12. chat_sessions ─────────────────────────────────────────────────────────
create table public.chat_sessions (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  ip_address  text,
  history     jsonb default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index idx_chat_sessions_updated_at on public.chat_sessions(updated_at);

create trigger set_chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.update_updated_at();

-- ── 13. payments ──────────────────────────────────────────────────────────────
create table public.payments (
  id                        uuid primary key default extensions.uuid_generate_v4(),
  user_id                   uuid not null references public.users(id) on delete cascade,
  razorpay_order_id         text,
  razorpay_payment_id       text,
  razorpay_subscription_id  text,
  amount                    int not null,
  currency                  text default 'INR',
  status                    text not null,
  plan                      text,
  created_at                timestamptz default now()
);

create index idx_payments_user_id on public.payments(user_id);

-- ── 14. push_subscriptions ────────────────────────────────────────────────────
create table public.push_subscriptions (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now(),
  unique (user_id, endpoint)
);

-- ── 15. usage_logs ────────────────────────────────────────────────────────────
create table public.usage_logs (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  ip_address  text,
  endpoint    text,
  created_at  timestamptz default now()
);

create index idx_usage_logs_user_created
  on public.usage_logs(user_id, created_at);

create index idx_usage_logs_ip_created
  on public.usage_logs(ip_address, created_at);

-- ── Cleanup: delete usage_logs older than 30 days ─────────────────────────────
create or replace function public.cleanup_usage_logs()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.usage_logs
  where created_at < now() - interval '30 days';
end;
$$;
