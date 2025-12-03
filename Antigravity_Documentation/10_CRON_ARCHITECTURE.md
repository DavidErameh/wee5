# Cron Job Architecture

## Overview
WEE5 uses a **Supabase-native cron architecture**. Instead of relying on external services like cron-job.org, we use PostgreSQL's built-in extensions to schedule and execute background tasks.

This approach ensures:
1.  **Zero External Dependencies**: The database is the single source of truth for time and scheduling.
2.  **Low Latency**: The database triggers the API directly via internal networking (or public internet if needed).
3.  **Security**: Secrets are stored securely in PostgreSQL configuration, not in code.

## Components

### 1. Database Extensions
*   **`pg_cron`**: A PostgreSQL extension that runs SQL commands on a schedule (like standard unix cron).
*   **`pg_net`**: An extension that allows PostgreSQL to make asynchronous HTTP/HTTPS requests.

### 2. Secure Invocation Function
We use a PL/pgSQL function `invoke_cron_endpoint(endpoint_path)` to wrap the complexity of making a secure request.
*   It reads the API URL from `app.settings.api_url`.
*   It reads the secret token from `app.settings.cron_secret`.
*   It constructs a request with the `Authorization: Bearer <SECRET>` header.

### 3. Scheduled Jobs
The jobs are defined in the `cron.job` table.

| Job Name | Schedule | Endpoint | Purpose |
| :--- | :--- | :--- | :--- |
| `poll-activities` | `*/30 * * * *` | `/api/cron/poll-activities` | Fetches missed activities from Whop API. |
| `welcome-emails` | `0 * * * *` | `/api/cron/welcome-emails` | Sends onboarding emails to new users. |
| `daily-analytics` | `0 0 * * *` | `/api/analytics/cron` | Aggregates daily stats into `engagement_analytics`. |

## Configuration

### Environment Variables
The system relies on two key settings stored in the database configuration:
1.  `app.settings.api_url`: The base URL of your Next.js app (e.g., `https://wee5-app.vercel.app`).
2.  `app.settings.cron_secret`: The secure token used to authenticate requests.

### How to Update Configuration
To update these values (e.g., after rotating secrets), run the helper script:

```bash
npx tsx scripts/generate-cron-config.ts
```
Then run the output SQL in your Supabase SQL Editor.

## Monitoring & Debugging

### View Active Jobs
```sql
select * from cron.job;
```

### View Job History
```sql
select * from cron.job_run_details order by start_time desc limit 10;
```

### View Network Requests
```sql
select * from net.http_request_queue order by id desc limit 10;
```

## Troubleshooting

### "Job failed with connection refused"
*   Check if `app.settings.api_url` is correct.
*   Ensure your Vercel deployment is active and not sleeping (cold starts > 5s might timeout).

### "Job not running"
*   Check if `pg_cron` extension is enabled.
*   Verify the schedule syntax.
