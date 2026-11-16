const { appUrl, primaryColor } = require('./constants');

const baseStyle = `font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6;`;
const btnStyle = `display: inline-block; background-color: ${primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;`;
const headerStyle = `background-color: #f9fafb; padding: 20px; text-align: center; border-bottom: 4px solid ${primaryColor};`;
const footerStyle = `margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.85em; color: #777; text-align: center;`;

exports.tutorNewDonationTemplate = (tutorName, studentName, studentEmail, donationDate) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h2 style="margin:0; color:${primaryColor};">Action Required: Donation Approval</h2>
    </div>
    <div style="padding: 20px;">
      <p>Hello ${tutorName},</p>
      <p>Your student, <strong>${studentName}</strong>, has submitted a new donation certificate for approval.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li><strong>Student:</strong> ${studentName} (${studentEmail})</li>
          <li><strong>Date of Donation:</strong> ${donationDate}</li>
        </ul>
      </div>

      <p>Please review the certificate and approve it to grant attendance.</p>
      <a href="${appUrl}/faculty_admin/pending-donations" style="${btnStyle}">Review Donation</a>
    </div>
    <div style="${footerStyle}">RLYFE Blood Donation System</div>
  </div>
`;

exports.tutorMatchTemplate = (tutorName, request, studentCount, studentRows) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h2 style="margin:0; color:#dc2626;">Urgent Match Found</h2>
    </div>
    <div style="padding: 20px;">
      <p>Dear ${tutorName},</p>
      <p>A new request for <strong>${request.required_blood_group}</strong> matches <strong>${studentCount}</strong> students in your batch.</p>
      
      <div style="border-left: 4px solid #dc2626; padding: 10px 15px; background: #fef2f2; margin: 15px 0;">
        <strong>Patient:</strong> ${request.patient_name}<br/>
        <strong>Hospital:</strong> ${request.hospital_name}<br/>
        <strong>Units:</strong> ${request.units_required}
      </div>

      <h3>Eligible Students:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background:#f3f4f6; text-align:left;"><th style="padding:8px;">Name</th><th style="padding:8px;">Phone</th></tr>
        ${studentRows}
      </table>
      
      <p>Please inform them immediately.</p>
    </div>
  </div>
`;

exports.urgentBroadcastTemplate = (request) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0; color:#dc2626;">URGENT: ${request.required_blood_group} Blood Needed</h1>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 1.1em;">A critical blood request has been posted near you.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 3em; font-weight: 800; color: #dc2626;">${request.required_blood_group}</div>
        <div style="color: #666;">${request.units_required} Units Required</div>
      </div>

      <table style="width: 100%; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Patient:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${request.patient_name}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Hospital:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${request.hospital_name}</td></tr>
        <tr><td style="padding: 10px;"><strong>Reason:</strong></td><td style="padding: 10px;">${request.reason || 'Emergency'}</td></tr>
      </table>

      <div style="text-align: center;">
        <a href="${appUrl}/requests" style="${btnStyle} background-color: #dc2626;">I Can Help</a>
      </div>
    </div>
    <div style="${footerStyle}">To unsubscribe, please update your profile settings.</div>
  </div>
`;

exports.volunteerSuccessTemplate = (userName, request) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h2 style="margin:0; color:${primaryColor};">Thank You for Volunteering!</h2>
    </div>
    <div style="padding: 20px;">
      <p>Hi ${userName},</p>
      <p>We have received your response to help <strong>${request.patient_name}</strong>.</p>
      <p>A coordinator or the bystander will contact you shortly at your registered number.</p>
      <p><strong>Next Steps:</strong> Please keep your phone nearby and stay hydrated.</p>
    </div>
  </div>
`;