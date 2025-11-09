# Application Deadline Alerts - Implementation Explanation

## Current Situation

### What We Have:
- ✅ Bookmarked schemes stored in user's database
- ✅ Scheme data includes: name, details, benefits, eligibility, application process, documents
- ❌ **No structured deadline field** in the current scheme data

### The Challenge:
Deadline information might be mentioned in text fields (like `application` or `details`), but it's not in a structured format that we can easily parse and track.

---

## How It Would Work (If Deadlines Were Available)

### Step-by-Step Process:

1. **Data Collection**
   - Each scheme would have deadline fields:
     - `application_deadline` (Date)
     - `last_date_to_apply` (Date)
     - `deadline_type` (e.g., "rolling", "fixed", "ongoing")

2. **Storage in Bookmarks**
   - When a user bookmarks a scheme, we store the deadline information
   - Update User model to include deadline in bookmarks:
   ```javascript
   bookmarks: [{
     scheme_name: String,
     application_deadline: Date,  // NEW
     deadline_reminder_sent: Boolean,  // NEW
     // ... other fields
   }]
   ```

3. **Scheduled Job/Background Process**
   - Run daily (or hourly) to check all users' bookmarks
   - Find schemes with deadlines approaching (e.g., 7 days, 3 days, 1 day before)
   - Send email notification

4. **Email Notification**
   - Subject: "⏰ Application Deadline Approaching: [Scheme Name]"
   - Content:
     - Scheme name
     - Deadline date
     - Days remaining
     - Link to application page
     - Link to view bookmark

---

## Implementation Options

### Option 1: Extract Deadlines from Text (NLP Approach)
**Pros:**
- Works with existing data
- No need to update CSV/database structure

**Cons:**
- Complex and error-prone
- May miss deadlines or extract wrong dates
- Different date formats in text

**How it works:**
```javascript
// Pseudo-code
function extractDeadline(scheme) {
  // Look for patterns like:
  // - "Last date: 31/12/2024"
  // - "Apply before: December 31, 2024"
  // - "Deadline: 31-12-2024"
  // - "Applications close on..."
  
  const text = scheme.application + " " + scheme.details;
  const datePatterns = [
    /last date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /deadline[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /apply before[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    // ... more patterns
  ];
  
  // Extract and parse dates
  // Return earliest valid date found
}
```

### Option 2: Add Deadline Fields to Database (Recommended)
**Pros:**
- Accurate and reliable
- Easy to query and filter
- Better user experience

**Cons:**
- Requires updating CSV/data source
- Need to manually/automatically populate deadlines
- Ongoing maintenance

**Implementation:**
1. Update CSV to include deadline columns
2. Update User model to store deadlines in bookmarks
3. Create scheduled job to check deadlines
4. Send email notifications

### Option 3: Hybrid Approach
**Pros:**
- Best of both worlds
- Can extract from text if structured data missing

**Cons:**
- More complex implementation
- Need fallback logic

---

## Technical Implementation Flow

### 1. Data Structure Update
```javascript
// User Model - bookmarks array
bookmarks: [{
  scheme_name: String,
  application_deadline: Date,        // NEW
  deadline_reminder_sent: [Date],    // NEW - track when reminders sent
  deadline_type: String,              // NEW - "fixed", "rolling", "ongoing"
  // ... existing fields
}]
```

### 2. Scheduled Job (Node.js Cron Job)
```javascript
// server/jobs/deadlineChecker.js
const cron = require('node-cron');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Checking for approaching deadlines...');
  
  // Get all users with bookmarks
  const users = await User.find({ 
    'bookmarks.0': { $exists: true } 
  });
  
  for (const user of users) {
    for (const bookmark of user.bookmarks) {
      if (!bookmark.application_deadline) continue;
      
      const deadline = new Date(bookmark.application_deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      // Check if reminder already sent for this deadline
      const reminderSent = bookmark.deadline_reminder_sent?.some(
        date => Math.abs(new Date(date) - today) < 24 * 60 * 60 * 1000
      );
      
      // Send reminders at 7 days, 3 days, and 1 day before
      if (daysUntil === 7 && !reminderSent) {
        await emailService.sendDeadlineReminder(user, bookmark, 7);
        // Mark reminder as sent
      } else if (daysUntil === 3 && !reminderSent) {
        await emailService.sendDeadlineReminder(user, bookmark, 3);
      } else if (daysUntil === 1 && !reminderSent) {
        await emailService.sendDeadlineReminder(user, bookmark, 1);
      }
    }
  }
});
```

### 3. Email Service
```javascript
// server/services/emailService.js
async function sendDeadlineReminder(user, bookmark, daysRemaining) {
  const emailContent = {
    to: user.email,
    subject: `⏰ Application Deadline in ${daysRemaining} Days: ${bookmark.scheme_name}`,
    html: `
      <h2>Application Deadline Approaching!</h2>
      <p>Dear ${user.name},</p>
      <p>The application deadline for <strong>${bookmark.scheme_name}</strong> is approaching.</p>
      <p><strong>Deadline:</strong> ${bookmark.application_deadline.toLocaleDateString()}</p>
      <p><strong>Days Remaining:</strong> ${daysRemaining} day(s)</p>
      <a href="${process.env.CLIENT_URL}/bookmarks">View Bookmarked Schemes</a>
      <a href="${process.env.CLIENT_URL}/recommendations">Apply Now</a>
    `
  };
  
  // Send via Gmail API or email service
  await sendEmail(emailContent);
}
```

---

## Challenges & Solutions

### Challenge 1: No Deadline Data
**Solution:** 
- Option A: Extract from text using NLP/regex
- Option B: Add deadline field to CSV and retrain
- Option C: Manual entry for popular schemes

### Challenge 2: Different Deadline Types
- **Fixed Deadline:** Specific date (e.g., "Apply by Dec 31, 2024")
- **Rolling Deadline:** Ongoing, no fixed date
- **Seasonal:** Repeats annually (e.g., "Apply in January")

**Solution:** Add `deadline_type` field and handle each type differently

### Challenge 3: Timezone Issues
**Solution:** Store deadlines in UTC, convert to user's timezone for display

### Challenge 4: Multiple Reminders
**Solution:** Track sent reminders in `deadline_reminder_sent` array

---

## Recommended Approach

1. **Phase 1: Add Deadline Field to Data**
   - Update CSV with `application_deadline` column
   - Update User model to store deadlines in bookmarks
   - Update bookmark API to save deadline when bookmarking

2. **Phase 2: Deadline Extraction (Optional)**
   - Create utility to extract dates from text fields
   - Use as fallback if structured deadline missing

3. **Phase 3: Scheduled Job**
   - Set up cron job to check deadlines daily
   - Implement reminder logic (7 days, 3 days, 1 day)

4. **Phase 4: Email Integration**
   - Set up Gmail API or email service
   - Create email templates
   - Send notifications

---

## Example Email Template

```
Subject: ⏰ Application Deadline in 7 Days: PM Kisan Scheme

Dear [User Name],

This is a reminder that the application deadline for one of your bookmarked schemes is approaching:

📋 Scheme: PM Kisan Scheme
📅 Deadline: December 31, 2024
⏰ Days Remaining: 7 days

Don't miss out! Apply now to take advantage of this opportunity.

[View Bookmarked Schemes] [Apply Now]

Best regards,
Scheme Recommender Team
```

---

## Next Steps

1. **Check your CSV/data source:** Do you have deadline information?
2. **Decide on approach:** Extract from text or add structured fields?
3. **Update data model:** Add deadline fields to User bookmarks
4. **Implement scheduled job:** Set up cron job for deadline checking
5. **Set up email service:** Configure Gmail API or email service
6. **Test:** Test with sample bookmarks and deadlines

Would you like me to help implement any of these steps?

