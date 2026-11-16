const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const originalSendMail = transporter.sendMail.bind(transporter);

transporter.sendMail = async (mailOptions) => {
  try {
    const { SystemSetting } = require('../../models');
    let mailingSetting = null;
    try {
      // Check if SystemSetting exists to avoid crashing before DB sync
      if (SystemSetting) {
        mailingSetting = await SystemSetting.findOne({ where: { key: 'mailing_enabled' } });
      }
    } catch (err) {
      console.warn("Could not fetch mailing setting in transporter, defaulting to enabled.");
    }
    const isMailingEnabled = mailingSetting ? mailingSetting.value !== 'false' : true;

    if (!isMailingEnabled) {
      console.log(`[TRANSPORTER BLOCKED] Email sending is globally disabled. Blocked email to: ${mailOptions.to || mailOptions.bcc}`);
      // Return a fake success object to keep the rest of the code running
      return { messageId: 'blocked-by-settings', response: '250 OK: Blocked by System Setting' };
    }

    return await originalSendMail(mailOptions);
  } catch (error) {
    console.error('Error in intercepted sendMail:', error);
    throw error;
  }
};

module.exports = transporter;