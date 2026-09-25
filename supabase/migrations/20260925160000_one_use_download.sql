-- The installer bucket must remain private; there are no anonymous object policies.
insert into storage.buckets (id, name, public, file_size_limit)
values ('installer-downloads', 'installer-downloads', false, 50000000)
on conflict (id) do nothing;

create table if not exists public.installer_grants (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  object_path text not null check (object_path ~ '^installers/[a-zA-Z0-9_.-]+$'),
  filename text not null check (filename ~ '^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  state text not null default 'issued' check (state in ('issued', 'consumed', 'revoked')),
  consumed_at timestamptz,
  constraint bounded_expiry check (expires_at <= created_at + interval '7 days')
);
alter table public.installer_grants enable row level security;
revoke all on public.installer_grants from public, anon, authenticated;
grant select, insert, update on public.installer_grants to service_role;

-- UPDATE locks the matching row; only one concurrent request returns it.
create or replace function public.consume_installer_grant(p_hash text)
returns table (object_path text, filename text)
language sql security definer set search_path = ''
as $$
  update public.installer_grants g
  set state = 'consumed', consumed_at = now()
  where g.token_hash = p_hash
    and g.state = 'issued'
    and g.expires_at > now()
  returning g.object_path, g.filename;
$$;
revoke all on function public.consume_installer_grant(text) from public, anon, authenticated;
grant execute on function public.consume_installer_grant(text) to service_role;
