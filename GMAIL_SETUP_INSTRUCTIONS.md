# Gmail Setup Instructions for Bookmark Reminders

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification (if not already enabled)

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "Scheme Recommender App"
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important:** You won't be able to see this password again, so copy it now!

## Step 3: Add to Environment Variables

1. Open your `.env` file in the root directory
2. Add the following lines:

```env
# Gmail Configuration for Email Notifications
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Optional: Customize reminder schedule
# Format: minute hour day month day-of-week
# Default: 1st of every month at 9:00 AM
BOOKMARK_REMINDER_CRON=0 9 1 * *

# Optional: Enable/disable bookmark reminders (default: enabled)
ENABLE_BOOKMARK_REMINDERS=true

# Client URL for email links
CLIENT_URL=http://localhost:3000
```

3. Replace:
   - `your-email@gmail.com` with your Gmail address
   - `abcdefghijklmnop` with the 16-character app password (remove spaces)
   - Update `CLIENT_URL` to your production URL when deploying

## Step 4: Test the Email Service

### Option A: Test via API Endpoint

1. Start your server
2. Login to your account
3. Make sure you have at least one bookmark
4. Send a POST request to: `http://localhost:5000/api/bookmarks/test-reminder`
   - Include your auth token in headers
   - Or use the frontend to trigger it

### Option B: Test via Code

You can also test directly in Node.js:

```javascript
const emailService = require('./server/services/emailService');

emailService.testEmail('your-email@gmail.com')
  .then(result => {
    console.log('Test result:', result);
  });
```

## Schedule Options

The reminder runs monthly by default. You can customize the schedule:

```env
# 1st of every month at 9:00 AM (default)
BOOKMARK_REMINDER_CRON=0 9 1 * *

# 15th of every month at 10:00 AM
BOOKMARK_REMINDER_CRON=0 10 15 * *

# Every Monday at 9:00 AM
BOOKMARK_REMINDER_CRON=0 9 * * 1

# Every day at 9:00 AM (for testing)
BOOKMARK_REMINDER_CRON=0 9 * * *
```

## Troubleshooting

### Error: "Invalid login"
- Make sure you're using the **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the app password doesn't have spaces

### Error: "Less secure app access"
- App Passwords don't require "Less secure app access"
- If you see this error, you might be using the wrong password type

### Emails not sending
- Check server logs for error messages
- Verify Gmail credentials in `.env` file
- Make sure the cron job is running (check server startup logs)
- Test with the test endpoint first

### Rate Limiting
- Gmail has rate limits (about 500 emails per day for free accounts)
- The job includes a 1-second delay between emails to avoid rate limiting
- For production, consider using a dedicated email service (SendGrid, Mailgun, etc.)

## Security Notes

- ⚠️ **Never commit your `.env` file to Git**
- ⚠️ **Keep your App Password secure**
- ⚠️ **Use environment variables in production**
- ✅ The App Password is specific to this application
- ✅ You can revoke it anytime from Google Account settings

## Production Deployment

For production, consider:
1. Using a dedicated email service (SendGrid, Mailgun, AWS SES)
2. Setting up proper error monitoring
3. Adding email delivery tracking
4. Implementing retry logic for failed emails
5. Adding user preferences to opt-in/opt-out

