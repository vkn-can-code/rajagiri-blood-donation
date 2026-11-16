const cron = require('node-cron');
const { User, Batch, EmailLog } = require('../models');
const reportService = require('../services/reportService');
const mailer = require('../services/emailerService'); // For reports
const transporter = require('../services/mailer/transporter');
const { resolveEmailTarget } = require('../services/mailer/emailSystem');
const { appName } = require('../services/mailer/constants');
const { Op } = require('sequelize');

const initCronJobs = () => {
  console.log('⏰ Scheduler initialized: Monthly Reports active.');

  // Schedule: 1st of every month at 00:00
  cron.schedule('0 0 1 * *', async () => {
    console.log('running monthly report job...');

    try {
      // 1. ADMIN REPORT
      const adminStats = await reportService.getAdminMonthlyStats();
      // Fetch all admins
      const admins = await User.findAll({ where: { role: 'admin' } });
      for (const admin of admins) {
        await mailer.sendAdminMonthlyReport(admin.email, adminStats);
      }
      console.log(`Admin reports sent to ${admins.length} admins.`);

      // 2. FACULTY REPORTS
      const batches = await Batch.findAll({
        include: [{ model: User, as: 'ClassTutor' }]
      });

      for (const batch of batches) {
        if (batch.ClassTutor) {
          const stats = await reportService.getBatchMonthlyStats(batch.id);
          if (stats.total > 0) { // Only send if there was activity
            await mailer.sendFacultyMonthlyReport(batch.ClassTutor, stats);
          }
        }
      }
      console.log(`Faculty reports processed for ${batches.length} batches.`);

    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });

  // Schedule: Daily at 9:00 AM - Check for Donation Eligibility (3 months rule)
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily eligibility check...');
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // We want to match users whose donation was ROUGHLY 3 months ago. 
      // To avoid spamming, we can check for an exact date match OR add a flag "eligibility_notified".
      // For this implementation, we'll check for the exact date match (yesterday/today).

      // Using a range for safety (e.g. donated between 90 and 91 days ago)
      const startOfDay = new Date(threeMonthsAgo);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(threeMonthsAgo);
      endOfDay.setHours(23, 59, 59, 999);

      const { Op } = require('sequelize');
      const eligibleUsers = await User.findAll({
        where: {
          last_donation_date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });

      console.log(`Found ${eligibleUsers.length} users eligible for reminder.`);

      for (const user of eligibleUsers) {
        await mailer.sendEligibilityReminder(user);
        console.log(`Eligibility email sent to ${user.email}`);
      }

    } catch (error) {
      console.error('Eligibility Cron Error:', error);
    }
  });

  // Schedule: Yearly on Dec 31st at 23:59 - Award "Hero of the Year"
  cron.schedule('59 23 31 12 *', async () => {
    console.log('🏆 Running Hero of the Year award job...');
    try {
      const { sequelize } = require('../models');
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      // Find top donor count
      // This query might vary based on SQL dialect, standard Sequelize approach:
      const topDonors = await Donation.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'donationCount']
        ],
        where: {
          status: 'approved',
          donation_date: {
            [require('sequelize').Op.between]: [startOfYear, endOfYear]
          }
        },
        group: ['user_id'],
        order: [[sequelize.literal('"donationCount"'), 'DESC']],
        limit: 1
      });

      if (topDonors.length > 0) {
        const topDonorId = topDonors[0].user_id;
        const count = topDonors[0].get('donationCount'); // .get() for aggregated field

        if (count > 0) {
          const user = await User.findByPk(topDonorId);
          if (user) {
            const badgeName = `Hero of the Year ${currentYear}`;
            // Avoid duplicate
            let currentBadges = user.badges || [];
            if (!currentBadges.includes(badgeName)) {
              currentBadges.push(badgeName);
              user.badges = currentBadges;
              await user.save();

              // Send Email to Top Donor
              // (Optional)
              console.log(`🏆 Awarded ${badgeName} to ${user.name} with ${count} donations.`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Badge Cron Error:', error);
    }
  });

  // Schedule: Every Minute - Process Scheduled Emails
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find emails scheduled to run NOW or in the PAST that haven't been sent yet
      const dueEmails = await EmailLog.findAll({
        where: {
          status: 'scheduled',
          scheduled_at: {
            [Op.lte]: now
          }
        }
      });

      if (dueEmails.length > 0) {
        console.log(`📧 Processing ${dueEmails.length} scheduled email(s)...`);
      }

      for (const email of dueEmails) {
        try {
          // Resolve emails in case this is a broadcast category
          const resolvedEmails = await resolveEmailTarget(email.recipient_email);
          
          if (resolvedEmails.length === 0) {
            email.status = 'failed';
            email.error_message = 'No matching users found for category.';
            await email.save();
            continue;
          }

          const isBroadcast = email.recipient_email.startsWith('CATEGORY:');

          const mailOptions = {
            from: `"${appName}" <${process.env.EMAIL_USER}>`,
            subject: email.subject,
            html: email.body_html
          };

          if (isBroadcast) {
            mailOptions.bcc = resolvedEmails;
          } else {
            mailOptions.to = resolvedEmails[0];
          }

          await transporter.sendMail(mailOptions);
          
          email.status = 'sent';
          email.sent_at = new Date();
          await email.save();
          console.log(`✅ Scheduled email sent to ${email.recipient_email} (${resolvedEmails.length} recipients)`);
        } catch (sendError) {
          console.error(`❌ Failed to send scheduled email to ${email.recipient_email}:`, sendError);
          email.status = 'failed';
          email.error_message = sendError.message;
          await email.save();
        }
      }
    } catch (error) {
      console.error('Scheduled Email Cron Error:', error);
    }
  });
};

module.exports = initCronJobs;