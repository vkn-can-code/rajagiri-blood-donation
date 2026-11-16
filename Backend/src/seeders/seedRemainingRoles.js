// This file is src/seeders/seedRemainingRoles.js
// Seeds one test account per role not covered by seedAdmin.js / seedData.js:
// admin, faculty, volunteer, non_teaching.

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { User, sequelize } = require('../models');

const accounts = [
  {
    name: 'Regular Admin',
    email: 'admin@rlyfe.com',
    role: 'admin',
    phone_number: '9111111101',
    password_hash: 'admin123',
    permissions: {
      manage_users: true,
      manage_departments: true,
      manage_batches: true,
      manage_requests: true,
      manage_camps: true,
      manage_emails: true,
      view_history: true
    }
  },
  {
    name: 'Dr. Regular Faculty',
    email: 'faculty@rlyfe.com',
    role: 'faculty',
    phone_number: '9111111102',
    password_hash: 'faculty123'
  },
  {
    name: 'Victor Volunteer',
    email: 'volunteer@rlyfe.com',
    role: 'volunteer',
    phone_number: '9111111103',
    password_hash: 'volunteer123'
  },
  {
    name: 'Nina NonTeaching',
    email: 'nonteaching@rlyfe.com',
    role: 'non_teaching',
    phone_number: '9111111104',
    password_hash: 'nonteaching123'
  }
];

const run = async () => {
  console.log('🚀 Seeding remaining role accounts...');
  try {
    for (const acc of accounts) {
      const [user, created] = await User.findOrCreate({
        where: { email: acc.email },
        defaults: acc
      });
      console.log(created ? `✅ Created ${acc.role}: ${acc.email}` : `⚠️  Already exists: ${acc.email}`);
    }
    console.log('🌟 Done.');
  } catch (error) {
    console.error('❌ Error seeding remaining roles:', error);
  } finally {
    await sequelize.close();
  }
};

run();
