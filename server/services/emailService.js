const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
    }
  });
};

/**
 * Send bookmark reminder email
 * @param {Object} user - User object with email and name
 * @param {Array} bookmarks - Array of bookmarked schemes
 * @returns {Promise}
 */
async function sendBookmarkReminder(user, bookmarks) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();

    // Create email HTML content
    const emailHTML = createBookmarkReminderHTML(user, bookmarks);

    // Email options
    const mailOptions = {
      from: `"Scheme Recommender" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `📚 Your Bookmarked Schemes - Monthly Reminder`,
      html: emailHTML,
      text: createBookmarkReminderText(user, bookmarks) // Plain text version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Bookmark reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending bookmark reminder email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create HTML email template for bookmark reminder
 */
function createBookmarkReminderHTML(user, bookmarks) {
  const totalBookmarks = bookmarks.length;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let bookmarksHTML = '';
  
  if (bookmarks.length === 0) {
    bookmarksHTML = `
      <div style="text-align: center; padding: 40px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 16px;">You don't have any bookmarked schemes yet.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/recommendations" 
           style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Browse Schemes
        </a>
      </div>
    `;
  } else {
    bookmarksHTML = bookmarks.map((bookmark, index) => {
      const schemeName = bookmark.scheme_name || 'Unnamed Scheme';
      const level = bookmark.level || 'N/A';
      const category = bookmark.schemeCategory || 'General';
      const details = bookmark.details ? (bookmark.details.length > 150 ? bookmark.details.substring(0, 150) + '...' : bookmark.details) : 'No description available';
      const bookmarkedDate = bookmark.bookmarkedAt ? new Date(bookmark.bookmarkedAt).toLocaleDateString() : 'Recently';
      
      return `
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 8px; font-size: 18px;">
            ${index + 1}. ${schemeName}
          </h3>
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 8px;">
              ${level}
            </span>
            <span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
              ${category}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
            ${details}
          </p>
          <div style="margin-top: 12px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/bookmarks" 
               style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; margin-right: 8px;">
              View Details
            </a>
            <span style="color: #9ca3af; font-size: 12px;">Bookmarked: ${bookmarkedDate}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Bookmarked Schemes</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">
            📚 Your Bookmarked Schemes
          </h1>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Monthly Reminder - ${currentDate}
          </p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 30px;">
          <p style="color: #1f2937; font-size: 16px; margin-bottom: 8px;">
            Hello ${user.name || 'there'},
          </p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
            This is your monthly reminder of the government schemes you've bookmarked. 
            You have <strong style="color: #3b82f6;">${totalBookmarks}</strong> bookmarked scheme${totalBookmarks !== 1 ? 's' : ''}.
          </p>
        </div>

        <!-- Bookmarks List -->
        <div style="margin-bottom: 30px;">
          ${bookmarksHTML}
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/bookmarks" 
             style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 8px;">
            View All Bookmarks
          </a>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/recommendations" 
             style="display: inline-block; padding: 12px 32px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 8px;">
            Browse More Schemes
          </a>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0;">
            This is an automated monthly reminder from Scheme Recommender.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0;">
            You can manage your email preferences in your account settings.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of bookmark reminder
 */
function createBookmarkReminderText(user, bookmarks) {
  const totalBookmarks = bookmarks.length;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let text = `Your Bookmarked Schemes - Monthly Reminder\n`;
  text += `${currentDate}\n\n`;
  text += `Hello ${user.name || 'there'},\n\n`;
  text += `This is your monthly reminder of the government schemes you've bookmarked.\n`;
  text += `You have ${totalBookmarks} bookmarked scheme${totalBookmarks !== 1 ? 's' : ''}.\n\n`;

  if (bookmarks.length === 0) {
    text += `You don't have any bookmarked schemes yet.\n`;
    text += `Visit ${process.env.CLIENT_URL || 'http://localhost:3000'}/recommendations to browse schemes.\n\n`;
  } else {
    bookmarks.forEach((bookmark, index) => {
      text += `${index + 1}. ${bookmark.scheme_name || 'Unnamed Scheme'}\n`;
      text += `   Level: ${bookmark.level || 'N/A'}\n`;
      text += `   Category: ${bookmark.schemeCategory || 'General'}\n`;
      if (bookmark.details) {
        const details = bookmark.details.length > 100 ? bookmark.details.substring(0, 100) + '...' : bookmark.details;
        text += `   ${details}\n`;
      }
      text += `   View: ${process.env.CLIENT_URL || 'http://localhost:3000'}/bookmarks\n\n`;
    });
  }

  text += `View all bookmarks: ${process.env.CLIENT_URL || 'http://localhost:3000'}/bookmarks\n`;
  text += `Browse more schemes: ${process.env.CLIENT_URL || 'http://localhost:3000'}/recommendations\n\n`;
  text += `This is an automated monthly reminder from Scheme Recommender.\n`;

  return text;
}

/**
 * Test email sending (for development)
 */
async function testEmail(userEmail) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Scheme Recommender" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: 'Test Email - Scheme Recommender',
      html: '<h1>Test Email</h1><p>If you received this, email service is working!</p>',
      text: 'Test Email - If you received this, email service is working!'
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBookmarkReminder,
  testEmail
};

