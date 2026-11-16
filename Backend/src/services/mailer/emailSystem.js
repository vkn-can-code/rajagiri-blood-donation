const transporter = require('./transporter');
const { EmailLog, User } = require('../../models');

/**
 * Helper to resolve the final email addresses if a category is provided.
 * @param {string} target 'test@example.com' or 'CATEGORY:student'
 * @returns {Promise<string[]>} Array of email strings
 */
const resolveEmailTarget = async (target) => {
  if (!target.startsWith('CATEGORY:')) {
    return [target]; // Single email fallback
  }

  const category = target.split(':')[1];
  let whereClause = {}; // Removed status check 

  if (category !== 'all') {
    whereClause.role = category === 'admin' ? ['admin', 'super_admin'] : category;
  }

  try {
    const users = await User.findAll({ where: whereClause, attributes: ['email'] });
    return users.map(u => u.email);
  } catch (error) {
    console.error('Failed to resolve email category:', error);
    return [];
  }
};

/**
 * Enhanced Email Sender that logs to database
 * @param {Object} options Options for nodemailer and logging
 * @param {string} options.to Recipient email address
 * @param {string} options.subject Email subject
 * @param {string} options.html HTML body of the email
 * @param {string} [options.status='sent'] Status ('sent', 'scheduled')
 * @param {Date} [options.scheduled_at=null] When this should be sent
 */
exports.dispatchEmail = async ({ to, subject, html, status = 'sent', scheduled_at = null }) => {
  let logEntry;
  
  try {
    // 0. Check global mailing setting
    const { SystemSetting } = require('../../models');
    let mailingSetting = null;
    try {
      mailingSetting = await SystemSetting.findOne({ where: { key: 'mailing_enabled' } });
    } catch (err) {
      console.warn("Could not fetch mailing setting, defaulting to enabled.");
    }
    const isMailingEnabled = mailingSetting ? mailingSetting.value !== 'false' : true;

    // 1. Create the database record first
    logEntry = await EmailLog.create({
      recipient_email: to,
      subject: subject,
      body_html: html,
      status: isMailingEnabled ? (status === 'scheduled' ? 'scheduled' : 'pending') : 'stopped',
      scheduled_at: scheduled_at
    });

    if (!isMailingEnabled) {
      console.log(`[MAILER DISABLED] Email stopped: ${to}, Subject: ${subject}`);
      return { success: true, message: 'Email sending stopped by system settings', logId: logEntry.id };
    }

    // 2. If it's scheduled for the future, don't send it now.
    if (status === 'scheduled') {
      return { success: true, message: 'Email scheduled', logId: logEntry.id };
    }

    // 3. Resolve target emails
    const resolvedEmails = await resolveEmailTarget(to);
    
    if (resolvedEmails.length === 0) {
      logEntry.status = 'failed';
      logEntry.error_message = 'No matching users found for category.';
      await logEntry.save();
      throw new Error('No matching users found for category.');
    }

    // 4. Send email immediately
    // If it's a category broadcast, we use BCC to hide emails from each other
    const isBroadcast = to.startsWith('CATEGORY:');
    
    const mailOptions = {
        from: `"${require('./constants').appName}" <${process.env.EMAIL_USER}>`,
        subject,
        html,
    };

    if (isBroadcast) {
      mailOptions.bcc = resolvedEmails;
    } else {
      mailOptions.to = resolvedEmails[0];
    }

    const info = await transporter.sendMail(mailOptions);

    // 5. Update log entry to success
    logEntry.status = 'sent';
    logEntry.sent_at = new Date();
    await logEntry.save();

    return { success: true, message: 'Email dispatched successfully', infoId: info.messageId, logId: logEntry.id, recipientsCount: resolvedEmails.length };
  } catch (error) {
    console.error('Email Dispatch Error:', error);

    // Update log entry to failed if it exists
    if (logEntry) {
      logEntry.status = 'failed';
      logEntry.error_message = error.message;
      await logEntry.save();
    }

    // Rethrow or handle based on app's needs
    throw error;
  }
};

exports.resolveEmailTarget = resolveEmailTarget;
