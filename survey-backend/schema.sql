create table public.survey_feedback (
  id uuid primary key,
  version text not null check (version = 'signup-feedback-v1'),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 12000),
  received_at timestamptz not null default now()
);
alter table public.survey_feedback enable row level security;
revoke all on public.survey_feedback from public, anon, authenticated;
grant select, insert on public.survey_feedback to service_role;
create index survey_feedback_received_at_idx on public.survey_feedback (received_at);
comment on table public.survey_feedback is 'Private FirstLane signup survey responses. Public submissions pass through the survey-feedback Edge Function. No client read/write grants.';
