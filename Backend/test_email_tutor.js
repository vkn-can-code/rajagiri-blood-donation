// test_email_tutor.js
const tutorEmails = require('./src/services/mailer/tutorEmails');

// Mock transporter to avoid actual network calls and just log output
const transporter = require('./src/services/mailer/transporter');
transporter.sendMail = async (options) => {
    console.log('--- MOCK EMAIL SENT ---');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body Preview:', options.html.substring(0, 100) + '...');
    return { messageId: 'mock-id' };
};

// Mock Data
const mockTutor = { name: 'Prof. Smith', email: 'tutor@example.com' };
const mockStudent = { name: 'John Doe', phone_number: '1234567890' };
const mockRequest = {
    patient_name: 'Jane Doe',
    hospital_name: 'General Hospital',
    required_blood_group: 'O+'
};

async function runTest() {
    console.log('Testing sendVolunteerNotificationToTutor...');
    try {
        if (typeof tutorEmails.sendVolunteerNotificationToTutor !== 'function') {
            throw new Error('Function sendVolunteerNotificationToTutor is MISSING!');
        }
        await tutorEmails.sendVolunteerNotificationToTutor(mockTutor, mockStudent, mockRequest);
        console.log('Test PASSED: Email function called successfully.');
    } catch (error) {
        console.error('Test FAILED:', error);
    }
}

runTest();
