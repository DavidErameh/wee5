# External Cron Job Setup Guide

This guide explains how to set up cron jobs using [cron-job.org](https://cron-job.org) for the WEE5 application, specifically tailored to the cron-job.org interface.

## 1. Generate a Cron Secret

First, generate a secure random string to use as your `CRON_SECRET`.
You can use a password generator or run this command in your terminal:
```bash
openssl rand -hex 32
```
(Or just mash your keyboard to create a long random string)

## 2. Configure Vercel Environment Variables

1. Go to your Vercel Project Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - **Key**: `CRON_SECRET`
   - **Value**: (The random string you generated)
   - **Environments**: Production, Preview, Development
4. Click **Save**
5. **Redeploy** your application for changes to take effect (Go to Deployments > Redeploy)

## 3. Set Up Cron Jobs on cron-job.org

1. Create a free account at [cron-job.org](https://cron-job.org)
2. Go to **Cronjobs** (top menu) > **Create Cronjob** (button)

### Job 1: Welcome Emails (Hourly)
**Required for: Sending welcome emails to new users**

*   **Title**: `WEE5 Welcome Emails`
*   **URL**: `https://your-app-domain.vercel.app/api/cron/welcome-emails`
*   **Execution schedule**:
    *   Select **"Every 60 minutes"** (or "Every 1 hour" if available in dropdown)
    *   *Alternatively, choose "User-defined" and set to run at minute 0 of every hour.*
*   **Notifications** (Recommended):
    *   Enable **"execution of the cronjob fails"**
    *   Enable **"the cronjob will be disabled because of too many failures"**
*   **Advanced settings** (Expand this section):
    *   **HTTP Method**: `GET`
    *   **Headers**:
        *   Key: `Authorization`
        *   Value: `Bearer YOUR_CRON_SECRET_HERE`
        *   *(Replace `YOUR_CRON_SECRET_HERE` with the secret you generated in Step 1)*

### Job 2: Poll Activities (Every 30 Minutes)
**Required for: Fetching new activities from Whop**

*   **Title**: `WEE5 Poll Activities`
*   **URL**: `https://your-app-domain.vercel.app/api/cron/poll-activities`
*   **Execution schedule**:
    *   Select **"Every 30 minutes"**
*   **Notifications**: Enable failure notifications.
*   **Advanced settings**:
    *   **HTTP Method**: `GET`
    *   **Headers**:
        *   Key: `Authorization`
        *   Value: `Bearer YOUR_CRON_SECRET_HERE`

### Job 3: Analytics (Daily)
**Required for: Aggregating daily stats**

*   **Title**: `WEE5 Analytics`
*   **URL**: `https://your-app-domain.vercel.app/api/analytics/cron`
*   **Execution schedule**:
    *   Select **"Every day at"**
    *   Set time to **00 : 00** (Midnight)
*   **Notifications**: Enable failure notifications.
*   **Advanced settings**:
    *   **HTTP Method**: `GET`
    *   **Headers**:
        *   Key: `Authorization`
        *   Value: `Bearer YOUR_CRON_SECRET_HERE`

## Testing

After creating the jobs, you can test them immediately:
1.  Go to the **Cronjobs** list.
2.  Click the **Edit** button (pencil icon) or **Run now** icon next to a job.
3.  Check the **History** tab to see the response.
    *   **Success**: Status `200 OK`, Response body `{"success":true...}`
    *   **Failure**: Status `401 Unauthorized` (Check your secret), or `500 Error` (Check Vercel logs).
