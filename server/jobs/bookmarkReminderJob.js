const cron = require('node-cron');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * Monthly Bookmark Reminder Job
 * Sends email reminders to users about their bookmarked schemes
 * 
 * Schedule: Runs on the 1st day of every month at 9:00 AM
 * To change schedule, modify the cron expression:
 * - '0 9 1 * *' = 1st of every month at 9 AM
 * - '0 9 15 * *' = 15th of every month at 9 AM
 * - '0 9 * * 1' = Every Monday at 9 AM
 */
const scheduleBookmarkReminders = () => {
  // Run on the 1st day of every month at 9:00 AM
  // Format: minute hour day month day-of-week
  const cronExpression = process.env.BOOKMARK_REMINDER_CRON || '0 9 1 * *';
  
  console.log(`📧 Bookmark reminder job scheduled: ${cronExpression}`);
  console.log('   This will run on the 1st of every month at 9:00 AM');

  cron.schedule(cronExpression, async () => {
    console.log('📧 Starting monthly bookmark reminder job...');
    const startTime = Date.now();

    try {
      // Find all users who have bookmarks
      const users = await User.find({
        'bookmarks.0': { $exists: true },
        isActive: true
      }).select('name email bookmarks');

      console.log(`Found ${users.length} users with bookmarks`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Skip if user has no bookmarks
          if (!user.bookmarks || user.bookmarks.length === 0) {
            continue;
          }

          // Send bookmark reminder email
          const result = await emailService.sendBookmarkReminder(user, user.bookmarks);

          if (result.success) {
            successCount++;
            console.log(`✅ Sent reminder to ${user.email} (${user.bookmarks.length} bookmarks)`);
          } else {
            errorCount++;
            console.error(`❌ Failed to send to ${user.email}: ${result.error}`);
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing user ${user.email}:`, error.message);
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`📧 Bookmark reminder job completed in ${duration}s`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
    } catch (error) {
      console.error('❌ Fatal error in bookmark reminder job:', error);
    }
  });
};

/**
 * Send bookmark reminder to a specific user (for testing)
 */
const sendReminderToUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('name email bookmarks');
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.bookmarks || user.bookmarks.length === 0) {
      return { success: false, error: 'User has no bookmarks' };
    }

    const result = await emailService.sendBookmarkReminder(user, user.bookmarks);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  scheduleBookmarkReminders,
  sendReminderToUser
};

