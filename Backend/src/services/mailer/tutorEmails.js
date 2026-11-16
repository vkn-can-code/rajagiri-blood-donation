const transporter = require('./transporter');
const { appName, appUrl } = require('./constants');

/**
 * Notifies a Class Tutor that one of their students
 * has submitted a donation certificate for approval.
 */
exports.sendTutorNewDonationEmail = async (tutor, student, donation) => {
  const subject = `[RLYFE] New Donation Approval Required: ${student.name}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${tutor.name},</h2>
      <p>A new donation certificate has been submitted by a student in your class, <strong>${student.name}</strong>, and requires your approval.</p>
      <hr>
      <h3>Donation Details:</h3>
      <ul>
        <li><strong>Student:</strong> ${student.name} (${student.email})</li>
        <li><strong>Donation Date:</strong> ${new Date(donation.donation_date).toLocaleDateString()}</li>
      </ul>
      <p>Please log in to your Faculty Dashboard to approve or reject this submission for attendance purposes.</p>
      <a href="${appUrl}/dashboard" style="background-color: #C00000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Go to Dashboard
      </a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        Thank you,<br/>The ${appName} Team
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: tutor.email,
    subject: subject,
    html: htmlBody,
  });
};

/**
 * Sends a list of eligible students to a specific Tutor
 * when a new Blood Request matches their batch.
 */
exports.sendMatchingStudentsToTutor = async (tutor, students, request) => {
  if (!students || students.length === 0) return;

  const subject = `[ACTION REQUIRED] Eligible Donors in Your Batch for ${request.patient_name}`;

  // Build a HTML Table of students
  const studentRows = students.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.phone_number}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.email}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Urgent Request Match</h2>
      <p>Dear ${tutor.name},</p>
      <p>A new blood request for <strong>${request.required_blood_group}</strong> matches <strong>${students.length}</strong> students in your batch.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c00000; margin: 15px 0;">
        <strong>Request:</strong> ${request.units_required} Units for ${request.patient_name} (Age: ${request.patient_age || 'N/A'}) at ${request.hospital_name}.
      </div>

      <h3>Eligible Students:</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px;">Name</th>
            <th style="padding: 8px;">Phone</th>
            <th style="padding: 8px;">Email</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>

      <p>Please encourage these students to volunteer via the RLYFE portal.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: tutor.email,
    subject: subject,
    html: htmlBody,
  });
};

/**
 * Sends a Batch-Specific Monthly Report to Faculty.
 */
exports.sendFacultyMonthlyReport = async (tutor, stats) => {
  const subject = `[RLYFE] Monthly Batch Report: ${stats.batchName}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Monthly Report: ${stats.batchName}</h2>
      <p>Dear ${tutor.name}, here is how your class performed this month.</p>
      
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.approvedCount}</div>
          <div style="font-size: 12px; color: #666;">Approved Donations</div>
        </div>
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #d97706;">${stats.pendingCount}</div>
          <div style="font-size: 12px; color: #666;">Pending Approval</div>
        </div>
      </div>

      <p>Please log in to approve pending requests.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: tutor.email,
    subject: subject,
    html: htmlBody,
  });
};

/**
 * Notifies a Tutor that a student from their batch has volunteered.
 */
exports.sendVolunteerNotificationToTutor = async (tutor, student, request) => {
  const subject = `[FYI] Student Volunteered: ${student.name}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Student Volunteer Alert</h2>
      <p>Dear ${tutor.name},</p>
      <p>One of your students, <strong>${student.name}</strong>, has volunteered for a blood request.</p>
      
      <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0;">
        <strong>Request Details:</strong><br/>
        Patient: ${request.patient_name} (Age: ${request.patient_age || 'N/A'})<br/>
        Hospital: ${request.hospital_name}<br/>
        Blood Group: ${request.required_blood_group}
      </div>

      <p>No action is required from you at this time. This is for your information.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: tutor.email,
    subject: subject,
    html: htmlBody,
  });
};

/**
 * Sends a reminder email to Faculty Admins for pending donation approvals.
 */
exports.sendPendingDonationsReminderEmail = async (tutor, pendingCount, studentsList) => {
  const subject = `[ACTION REQUIRED] ${pendingCount} Pending Donation Approvals`;

  const studentRows = studentsList.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(s.date).toLocaleDateString()}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Pending Approvals Reminder</h2>
      <p>Dear ${tutor.name},</p>
      <p>You have <strong>${pendingCount}</strong> student donation certificates pending your approval.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c00000; margin: 15px 0;">
        <p>Please log in to your dashboard to review and approve these certificates so that students can receive their attendance benefits.</p>
      </div>

      <h3>Pending Students:</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px;">Name</th>
            <th style="padding: 8px;">Date Submitted</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>

      <br>
      <a href="${appUrl}/dashboard" style="background-color: #C00000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Go to Dashboard
      </a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        Thank you,<br/>The ${appName} Team
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: tutor.email,
    subject: subject,
    html: htmlBody,
  });
};