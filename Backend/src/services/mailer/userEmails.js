const { dispatchEmail } = require('./emailSystem');
const { appName } = require('./constants');

exports.sendAppreciationEmail = async (user, donation) => {
  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Thank You for Being a Hero! 🩸',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Impressive Work!</h1>
        </div>
        <div style="padding: 20px;">
            <h2 style="color: #d32f2f;">Hello ${user.name},</h2>
            <p style="font-size: 16px; line-height: 1.5;">Your blood donation on <strong>${donation.donation_date}</strong> has been successfully recorded.</p>
            <p style="font-size: 16px; line-height: 1.5;">
                You are a lifesaver. Your contribution makes a real difference in the world and brings hope to those in need.
                We are incredibly proud to have you as part of the RLYFE community.
            </p>
            <p style="font-size: 16px; line-height: 1.5;">Keep up the great spirit!</p>
            <br/>
            <p style="font-size: 14px; color: #777;">Warm regards,</p>
            <p style="font-size: 16px; font-weight: bold; color: #333;">RLYFE Team</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} RLYFE. All rights reserved.
        </div>
      </div>
    `
  };
  return dispatchEmail({
    to: user.email,
    subject: 'Thank You for Being a Hero! 🩸',
    html: mailOptions.html
  });
};


exports.sendEligibilityReminder = async (user) => {
  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'You are Eligible to Donate Again! 🩸',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${user.name},</h2>
        <p>It has been 3 months since your last donation.</p>
        <p>You are now eligible to donate blood again and save more lives!</p>
        <p>Check the RLYFE app for upcoming camps or blood requests.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>RLYFE Team</strong></p>
      </div>
    `
  };
  return dispatchEmail({
    to: user.email,
    subject: 'You are Eligible to Donate Again! 🩸',
    html: mailOptions.html
  });
};

exports.sendVolunteerResponseEmail = async (user, request) => {
  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Volunteer Confirmation - RLYFE',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Thank you for Volunteering, ${user.name}!</h2>
        <p>You have successfully volunteered to donate blood for <strong>${request.patient_name}</strong>.</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c00000; margin: 15px 0;">
          <strong>Request Details:</strong><br/>
          Patient: ${request.patient_name} (Age: ${request.patient_age || 'N/A'})<br/>
          Hospital: ${request.hospital_name}<br/>
          Blood Group: ${request.required_blood_group}
        </div>
        <p>A coordinator or the requestor will contact you shortly at <strong>${user.phone_number}</strong>.</p>
        <p>Thank you for being a hero!</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>RLYFE Team</strong></p>
      </div>
    `
  };
  return dispatchEmail({
    to: user.email,
    subject: 'Volunteer Confirmation - RLYFE',
    html: mailOptions.html
  });
};

exports.sendCampApprovalEmail = async (user, camp) => {
  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Camp Registration Approved - ${camp.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${user.name},</h2>
        <p>Your registration for the upcoming blood donation camp has been <strong>approved</strong>!</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0;">
          <strong>Camp Details:</strong><br/>
          Camp: ${camp.title}<br/>
          Date: ${new Date(camp.camp_date).toLocaleDateString()}<br/>
          Location: ${camp.location}<br/>
          Address: ${camp.address || 'N/A'}<br/>
          ${camp.google_maps_link ? `<a href="${camp.google_maps_link}" style="color: #d32f2f; font-weight: bold;">View on Google Maps</a>` : ''}
        </div>
        <p>Please be present at the venue on time. Drink plenty of water and have a good meal before donating.</p>
        <p>Thank you for being a hero!</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>RLYFE Team</strong></p>
      </div>
    `
  };
  return dispatchEmail({
    to: user.email,
    subject: `Camp Registration Approved - ${camp.title}`,
    html: mailOptions.html
  });
};

exports.sendNewCampEmail = async (camp) => {
  return dispatchEmail({
    to: 'CATEGORY:all',
    subject: `📢 New Blood Donation Camp: ${camp.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d32f2f;">New Blood Donation Camp!</h2>
        <p>A new blood donation camp has been scheduled.</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d32f2f; margin: 15px 0;">
          <strong>Camp:</strong> ${camp.title}<br/>
          <strong>Date:</strong> ${new Date(camp.camp_date).toLocaleDateString()}<br/>
          <strong>Location:</strong> ${camp.location}<br/>
          <strong>Address:</strong> ${camp.address || 'N/A'}<br/>
          ${camp.google_maps_link ? `<a href="${camp.google_maps_link}" style="color: #d32f2f; font-weight: bold;">View on Google Maps</a>` : ''}
        </div>
        <p>Please register for the camp through the RLYFE app if you are available.</p>
        <p>Thank you for your support!</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>RLYFE Team</strong></p>
      </div>
    `
  });
};

exports.sendPasswordResetEmail = async (user, resetLink) => {
  return dispatchEmail({
    to: user.email,
    subject: 'Reset Your RLyfe Password 🔒',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 1.6rem;">🔒 Password Reset</h1>
          <p style="color: #a7f3d0; margin: 8px 0 0; font-size: 0.95rem;">RLyfe · NSS Unit</p>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="color: #111827; margin-top: 0;">Hello, ${user.name}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
            We received a request to reset the password for your RLyfe account.
            Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}"
               style="background: #059669; color: #fff; text-decoration: none; padding: 14px 32px;
                      border-radius: 8px; font-size: 1rem; font-weight: 600; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 13px; color: #9ca3af; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #059669; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 13px; color: #6b7280;">
            If you did not request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} RLyfe · Rajagiri College of Social Sciences NSS Unit
        </div>
      </div>
    `
  });
};
