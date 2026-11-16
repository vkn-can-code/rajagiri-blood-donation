exports.getUrgentRequestEmailHTML = (request, requester, volunteer) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f6f7fb;
        color: #333;
      }
      .container {
        max-width: 620px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 18px rgba(0,0,0,0.06);
        border: 1px solid #eee;
      }
      .header {
        background: linear-gradient(135deg, #b11d24, #8e191e);
        color: #fff;
        text-align: center;
        padding: 30px 20px;
      }
      .logo {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: 1px;
      }
      .title {
        margin-top: 10px;
        font-size: 1.5rem;
        font-weight: 500;
      }

      .content {
        padding: 35px 30px;
        line-height: 1.7;
      }
      .intro-text {
        font-size: 16px;
        color: #555;
        margin-bottom: 20px;
      }

      /* Blood info block */
      .blood-group-hero {
        background-color: #fff5f5;
        border: 2px dashed #b11d24;
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        margin: 25px 0;
      }
      .blood-group-hero .label {
        font-size: 14px;
        color: #777;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .blood-group-hero .blood-group {
        font-size: 56px;
        font-weight: 900;
        color: #b11d24;
        margin: 8px 0 0;
      }

      /* Tables */
      .details-section {
        margin: 30px 0;
      }
      .details-section h3 {
        color: #b11d24;
        margin-bottom: 12px;
        font-size: 18px;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
      }
      .details-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
      }
      .details-table .label {
        font-weight: 600;
        color: #555;
        width: 45%;
      }
      .details-table a {
        color: #b11d24;
        text-decoration: none;
      }

      /* CTA Button */
      .cta-button {
        display: inline-block;
        background-color: #b11d24;
        color: #fff !important;
        padding: 15px 36px;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 700;
        font-size: 17px;
        margin-top: 35px;
        transition: background-color 0.3s ease;
      }
      .cta-button:hover {
        background-color: #8e191e;
      }

      /* Footer */
      .footer {
        background-color: #f9fafc;
        color: #999;
        padding: 25px;
        text-align: center;
        font-size: 13px;
        border-top: 1px solid #eee;
      }

      @media (max-width: 600px) {
        .content { padding: 25px 20px; }
        .blood-group-hero .blood-group { font-size: 44px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">RLYFE</div>
        <div class="title">Urgent Blood Request Alert</div>
      </div>
      <div class="content">
        <p class="intro-text">Dear <strong>${volunteer.name}</strong>,</p>
        <p class="intro-text">An <strong>urgent blood donation request</strong> has been raised near your area. Your immediate help can save a life today.</p>

        <div class="blood-group-hero">
          <p class="label">Required Blood Group</p>
          <p class="blood-group">${request.required_blood_group}</p>
        </div>

        <div class="details-section">
          <h3>Request Details</h3>
          <table class="details-table">
            <tr><td class="label">Patient Name:</td><td>${request.patient_name}</td></tr>
            <tr><td class="label">Hospital:</td><td>${request.hospital_name}</td></tr>
            <tr><td class="label">Units Required:</td><td>${request.units_required}</td></tr>
          </table>
        </div>

        <div class="details-section">
          <h3>Requester Contact</h3>
          <table class="details-table">
            <tr><td class="label">Name:</td><td>${requester.name}</td></tr>
            <tr><td class="label">Email:</td><td><a href="mailto:${requester.email}">${requester.email}</a></td></tr>
            <tr><td class="label">Phone:</td><td><a href="tel:${requester.phone_number}">${requester.phone_number}</a></td></tr>
          </table>
        </div>

        <p style="text-align: center;">
          <a href="${frontendUrl}/requests" class="cta-button">View All Requests</a>
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <strong>RLYFE</strong> | Rajagiri College of Social Sciences<br>
        This is an automated alert — please respond only through the RLYFE platform.</p>
      </div>
    </div>
  </body>
  </html>`;
};
