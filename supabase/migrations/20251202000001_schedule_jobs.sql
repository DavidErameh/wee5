-- Schedule the cron jobs
-- Note: Times are in UTC

-- 1. Poll Activities (Every 30 minutes)
-- Runs at minute 0 and 30 of every hour
select cron.schedule(
  'poll-activities',
  '*/30 * * * *',
  $$select invoke_cron_endpoint('/api/cron/poll-activities')$$
);

-- 2. Welcome Emails (Every hour)
-- Runs at minute 0 of every hour
select cron.schedule(
  'welcome-emails',
  '0 * * * *',
  $$select invoke_cron_endpoint('/api/cron/welcome-emails')$$
);

-- 3. Daily Analytics (Every day at midnight)
-- Runs at 00:00 UTC
select cron.schedule(
  'daily-analytics',
  '0 0 * * *',
  $$select invoke_cron_endpoint('/api/analytics/cron')$$
);
