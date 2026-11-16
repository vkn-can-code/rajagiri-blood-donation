const transporter = require('./transporter');

/**
 * Sends an email with retry logic and detailed error handling.
 * @param {Object} mailOptions - Nodemailer mail options (from, to, subject, html, etc.)
 * @param {number} retries - Number of retries available (default: 2)
 * @returns {Promise<Object>} - The info object from nodemailer
 */
const sendMailSafe = async (mailOptions, retries = 2) => {
    try {
        console.log(`📧 Attempting to send email to: ${mailOptions.to} (BCC: ${mailOptions.bcc ? mailOptions.bcc.length : 0})`);

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email Sent Successfully! Message ID: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error(`❌ Email Send Failed. Error Code: ${error.code}, Response: ${error.response}`);

        // Retry Logic for specific errors (e.g. Connection timeouts, Greylisting 4xx)
        const isTransient = error.code === 'ETIMEDOUT' || (error.responseCode && error.responseCode >= 400 && error.responseCode < 500);

        if (isTransient && retries > 0) {
            console.log(`🔄 Retrying email send... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, 2000)); // Wait 2s before retry
            return sendMailSafe(mailOptions, retries - 1);
        }

        // If fatal or out of retries, throw custom error object
        const errorReport = {
            message: 'Email Delivery Failed',
            recipient: mailOptions.to,
            reason: error.message,
            code: error.code,
            command: error.command
        };

        // Log structured error for admins
        console.error("🚨 CRITICAL EMAIL FAILURE:", JSON.stringify(errorReport, null, 2));

        // We re-throw so the caller knows it failed (unless we want to swallow it)
        throw error;
    }
};

module.exports = sendMailSafe;
