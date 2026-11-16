const transporter = require('./transporter');
const { appName, appUrl } = require('./constants');

/**
 * Sends a Monthly Statistical Report to Admin.
 */
exports.sendAdminMonthlyReport = async (adminEmail, stats) => {
  const subject = `[RLYFE] Monthly Statistical Report - ${new Date().toLocaleString('default', { month: 'long' })}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #059669;">Monthly Overview</h1>
      <p>Here is the activity report for this month across the entire college.</p>
      
      <table style="width: 100%; max-width: 600px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background: #e6fffa; border: 1px solid #b2f5ea;"><strong>Total Donations:</strong></td>
          <td style="padding: 10px; border: 1px solid #eee;">${stats.totalDonations}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #fff5f5; border: 1px solid #fed7d7;"><strong>Requests Fulfilled:</strong></td>
          <td style="padding: 10px; border: 1px solid #eee;">${stats.fulfilledRequests}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #ebf8ff; border: 1px solid #bee3f8;"><strong>Active Batches:</strong></td>
          <td style="padding: 10px; border: 1px solid #eee;">${stats.activeBatches}</td>
        </tr>
      </table>

      <h3>Top Performing Batches</h3>
      <ul>
        ${stats.topBatches.map(b => `<li><strong>${b.name}:</strong> ${b.count} donations</li>`).join('')}
      </ul>
      
      <p style="font-size: 0.9em; color: #777;">This is an automated system report.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: subject,
    html: htmlBody,
  });
};