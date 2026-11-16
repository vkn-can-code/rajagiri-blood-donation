const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { execSync } = require('child_process');
require('dotenv').config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001/api';
const STUDENT1_EMAIL = process.env.TEST_STUDENT1_EMAIL || 'student1@rlyfe.com';
const STUDENT2_EMAIL = process.env.TEST_STUDENT2_EMAIL || 'student2@rlyfe.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rlyfe.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

async function runTests() {
  console.log("Starting API Tests...");
  let donationId, requestId, campId;
  try {
    // 1. Login Student 1
    let res = await axios.post(`${BASE_URL}/auth/login`, { email: STUDENT1_EMAIL, password: TEST_PASSWORD });
    const student1Token = res.data.token;
    console.log("✅ Logged in as Student 1");

    // 2. Upload Certificate
    fs.writeFileSync('./dummy_cert.pdf', 'dummy pdf content');
    const form = new FormData();
    form.append('certificate', fs.createReadStream('./dummy_cert.pdf'));
    form.append('donation_date', '2026-09-01');

    res = await axios.post(`${BASE_URL}/donations`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${student1Token}` }
    });
    donationId = res.data.donation.id;
    console.log("✅ Certificate Uploaded. Donation ID:", donationId);

    // 3. Login Super Admin
    res = await axios.post(`${BASE_URL}/auth/login`, { email: ADMIN_EMAIL, password: TEST_PASSWORD });
    const adminToken = res.data.token;
    console.log("✅ Logged in as Super Admin");

    // 4. Create Blood Request
    res = await axios.post(`${BASE_URL}/requests`, {
      patient_name: 'Test Patient',
      required_blood_group: 'A-',
      units_required: 2,
      hospital_name: 'Test Hospital',
      required_date: '2026-10-01',
      urgency_level: 'High',
      contact_person: 'Admin',
      contact_number: '1234567890'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    requestId = res.data.request.id;
    console.log("✅ Blood Request Created. Request ID:", requestId);

    // 5. Login Student 2
    res = await axios.post(`${BASE_URL}/auth/login`, { email: STUDENT2_EMAIL, password: TEST_PASSWORD });
    const student2Token = res.data.token;
    console.log("✅ Logged in as Student 2");

    // 6. Respond to Blood Request
    res = await axios.post(`${BASE_URL}/requests/${requestId}/respond`, {}, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });
    console.log("✅ Responded to Blood Request.");

    // 7. Create Camp (Super Admin)
    res = await axios.post(`${BASE_URL}/camps`, {
      title: 'Test Blood Camp',
      camp_date: '2026-10-15',
      location: 'College Auditorium',
      organized_by: 'NSS',
      start_time: '10:00',
      end_time: '14:00'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    campId = res.data.camp.id;
    console.log("✅ Camp Created. Camp ID:", campId);

    // 8. Register for Camp (Student 2)
    res = await axios.post(`${BASE_URL}/camps/${campId}/register`, {
      answers: { test: 'yes' }
    }, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });
    console.log("✅ Registered for Camp.");

    console.log("\nAll tests passed successfully! Cleaning up data...");

  } catch (error) {
    console.error("❌ Error during testing:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error);
    }
  } finally {
    if (fs.existsSync('./dummy_cert.pdf')) fs.unlinkSync('./dummy_cert.pdf');
    console.log("Cleaning up DB...");
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_DATABASE || 'rajagiri_blood_db';
    const dbPass = process.env.DB_PASSWORD || '';
    const psqlEnv = dbPass ? `PGPASSWORD="${dbPass}" ` : '';
    try { if (donationId) execSync(`${psqlEnv}psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -c "DELETE FROM \\"Donations\\" WHERE id=${donationId};"`); } catch(e){}
    try { if (requestId) execSync(`${psqlEnv}psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -c "DELETE FROM \\"BloodRequests\\" WHERE id=${requestId};"`); } catch(e){}
    try { if (campId) execSync(`${psqlEnv}psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -c "DELETE FROM \\"Camps\\" WHERE id=${campId};"`); } catch(e){}
    
    console.log("✅ Test cleanup complete.");
  }
}

runTests();
