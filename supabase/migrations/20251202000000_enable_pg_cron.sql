-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Create a secure function to invoke our API endpoints
-- This function reads the API URL and Secret from database settings
-- which we will set via a script or SQL command
create or replace function invoke_cron_endpoint(endpoint_path text)
returns void as $$
declare
  -- Get the base URL (e.g., https://wee5-app.vercel.app)
  -- Default to localhost if not set (for safety)
  base_url text := current_setting('app.settings.api_url', true);
  
  -- Get the cron secret
  secret text := current_setting('app.settings.cron_secret', true);
  
  -- Construct full URL
  full_url text;
begin
  -- Validation
  if base_url is null then
    raise warning 'app.settings.api_url is not set';
    return;
  end if;
  
  if secret is null then
    raise warning 'app.settings.cron_secret is not set';
    return;
  end if;

  full_url := base_url || endpoint_path;

  -- Make the HTTP request using pg_net
  -- We don't wait for the response (fire and forget)
  perform net.http_get(
    url := full_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || secret,
      'Content-Type', 'application/json'
    )
  );
end;
$$ language plpgsql;
