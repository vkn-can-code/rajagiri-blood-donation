const sendMailSafe = require('./emailSender');
const { appName, appUrl } = require('./constants');

/**
 * Notifies ALL users that a new urgent blood request
 * has been posted by an admin.
 */
exports.sendNewRequestEmailToAll = async (newRequest, allUsers) => {
  const subject = `[URGENT] New Blood Request: ${newRequest.required_blood_group} at ${newRequest.hospital_name}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Urgent Blood Request</h2>
      <p>A new urgent request for blood has been posted. Your help could save a life.</p>
      <hr>
      <h3>Request Details:</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li><strong>Patient:</strong> ${newRequest.patient_name} (Age: ${newRequest.patient_age || 'N/A'})</li>
        <li><strong>Hospital:</strong> ${newRequest.hospital_name}</li>
        <li><strong>Blood Group:</strong> <strong style="color: #C00000; font-size: 1.2em;">${newRequest.required_blood_group}</strong></li>
        <li><strong>Units Required:</strong> ${newRequest.units_required}</li>
      </ul>
      <p>If you are eligible and available to donate, please log in to the RLYFE portal to respond.</p>
      <a href="${appUrl}/requests" style="background-color: #C00000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        View Request & Respond
      </a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        Thank you,<br/>The ${appName} Team
      </p>
    </div>
  `;

  // Get a list of all user emails
  const recipients = allUsers.map(user => user.email);

  // Use BCC to send a single email to all recipients without exposing their addresses
  await sendMailSafe({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to self
    bcc: recipients, // Put all users in Blind Carbon Copy
    subject: subject,
    html: htmlBody,
  });
};

/**
 * NEW: Notify Admin about a new volunteer
 */
exports.sendVolunteerNotificationToAdmin = async (adminEmails, student, request) => {
  const subject = `[ACTION REQUIRED] New Volunteer for ${request.patient_name}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Volunteer Response</h2>
      <p>A student has volunteered for the urgent blood request.</p>
      <hr>
      <h3>Volunteer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${student.name}</li>
        <li><strong>Phone:</strong> ${student.phone_number}</li>
        <li><strong>Email:</strong> ${student.email}</li>
        <li><strong>Batch:</strong> ${student.StudentBatch ? student.StudentBatch.batch_name : 'Unknown'}</li>
      </ul>
      <h3>Request:</h3>
      <ul>
        <li><strong>Patient:</strong> ${request.patient_name}</li>
        <li><strong>Hospital:</strong> ${request.hospital_name}</li>
      </ul>
      <p>Please review and coordinate via the dashboard.</p>
      <a href="${appUrl}/admin/requests" style="background-color: #059669; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Go to Admin Dashboard
      </a>
    </div>
  `;

  await sendMailSafe({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: adminEmails,
    subject: subject,
    html: htmlBody,
  });
};

/**
 * NEW: Notify Department Head (HOD) about a new volunteer
 */
exports.sendVolunteerNotificationToDeptHead = async (hodEmail, student, request) => {
  const subject = `[NOTICE] Student Volunteer: ${student.name}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Student Volunteer Alert</h2>
      <p>A student from your department has volunteered for a blood donation request.</p>
      <hr>
      <h3>Student Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${student.name}</li>
        <li><strong>Batch:</strong> ${student.StudentBatch ? student.StudentBatch.batch_name : 'Unknown'}</li>
      </ul>
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Patient:</strong> ${request.patient_name}</li>
        <li><strong>Hospital:</strong> ${request.hospital_name}</li>
      </ul>
      <p>This is for your information. The admin team will coordinate.</p>
    </div>
  `;

  await sendMailSafe({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: hodEmail,
    subject: subject,
    html: htmlBody,
  });
};
