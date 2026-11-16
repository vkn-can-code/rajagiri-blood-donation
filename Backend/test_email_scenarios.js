
require('dotenv').config();
const transporter = require('./src/services/mailer/transporter');
const requestEmails = require('./src/services/mailer/requestEmails');
const userEmails = require('./src/services/mailer/userEmails');
const tutorEmails = require('./src/services/mailer/tutorEmails');

// CONFIGURATION
// By default, we send all test emails to the sender address (self-test)
// to avoid spamming real users during this debug session.
// You can change 'TEST_RECIPIENT' to a specific email if needed.
const TEST_RECIPIENT = process.env.EMAIL_USER;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ CRTICAL ERROR: EMAIL_USER or EMAIL_PASS is missing in .env file.");
    process.exit(1);
}

console.log(`📧 Starting Email System Diagnostics...`);
console.log(`Target Recipient for tests: ${TEST_RECIPIENT}`);

const mockUser = {
    name: 'Test User',
    email: TEST_RECIPIENT,
    phone_number: '123-456-7890'
};

const mockTutor = {
    name: 'Test Tutor',
    email: TEST_RECIPIENT
};

const mockStudent = {
    name: 'Test Student',
    email: TEST_RECIPIENT,
    phone_number: '987-654-3210'
};

const mockRequest = {
    patient_name: 'John Doe',
    patient_age: 45,
    hospital_name: 'General Hospital',
    required_blood_group: 'O+',
    units_required: 2
};

const mockDonation = {
    donation_date: new Date()
};

async function runTests() {
    // 1. Verify SMTP Connection
    try {
        console.log('\n--- 1. Testing SMTP Connection ---');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
        console.log('   Hint: Check your EMAIL_USER and EMAIL_PASS. If using Gmail, use an App Password.');
        return; // Stop if connection fails
    }

    // 2. Test Blood Request Email (Admin -> All Users)
    try {
        console.log('\n--- 2. Testing "New Blood Request" Email ---');
        // We pass an array with just our mock user to simulate "All Users"
        await requestEmails.sendNewRequestEmailToAll(mockRequest, [mockUser]);
        console.log('✅ "New Blood Request" email sent successfully.');
    } catch (error) {
        console.error('❌ "New Blood Request" email failed:', error.message);
    }

    // 3. Test Volunteer Response Email (System -> Volunteer)
    try {
        console.log('\n--- 3. Testing "Volunteer Confirmation" Email ---');
        await userEmails.sendVolunteerResponseEmail(mockUser, mockRequest);
        console.log('✅ "Volunteer Confirmation" email sent successfully.');
    } catch (error) {
        console.error('❌ "Volunteer Confirmation" email failed:', error.message);
    }

    // 4. Test Tutor Notification (System -> Tutor)
    try {
        console.log('\n--- 4. Testing "Tutor Notification" Email ---');
        await tutorEmails.sendVolunteerNotificationToTutor(mockTutor, mockStudent, mockRequest);
        console.log('✅ "Tutor Notification" email sent successfully.');
    } catch (error) {
        console.error('❌ "Tutor Notification" email failed:', error.message);
    }

    // 5. Test Appreciation Email (System -> User)
    try {
        console.log('\n--- 5. Testing "Donation Appreciation" Email ---');
        await userEmails.sendAppreciationEmail(mockUser, mockDonation);
        console.log('✅ "Donation Appreciation" email sent successfully.');
    } catch (error) {
        console.error('❌ "Donation Appreciation" email failed:', error.message);
    }

    // 6. Test Eligibility Reminder (Cron -> User)
    try {
        console.log('\n--- 6. Testing "Eligibility Reminder" Email ---');
        await userEmails.sendEligibilityReminder(mockUser);
        console.log('✅ "Eligibility Reminder" email sent successfully.');
    } catch (error) {
        console.error('❌ "Eligibility Reminder" email failed:', error.message);
    }

    console.log('\n🏁 Diagnostics Complete.');
}

runTests();
