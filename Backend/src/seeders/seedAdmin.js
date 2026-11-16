// This file is src/seeders/seedAdmin.js
// --- UPDATED ---

// We need to specify the path to the .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { User, sequelize } = require('../models');

// --- DEFINE YOUR ADMIN ---
// Get credentials from .env file or use defaults
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rlyfe.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0000000000';
// -------------------------

const createAdmin = async () => {
  console.log('Attempting to create super admin...');
  
  try {
    // --- THIS LINE WAS REMOVED ---
    // await sequelize.sync(); 
    // --- We don't need this because our migrations already built the database ---

    // User.findOrCreate prevents creating duplicate admins
    const [user, created] = await User.findOrCreate({
      where: { email: ADMIN_EMAIL },
      defaults: {
        name: 'Super Admin',
        email: ADMIN_EMAIL,
        phone_number: ADMIN_PHONE,
        password_hash: ADMIN_PASS, // The 'beforeCreate' hook will hash this
        role: 'super_admin'
      }
    });

    if (created) {
      console.log('✅ Super Admin account created successfully!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: (The one in your .env file)`);
      console.log('\nYou can now log in at the frontend.');
    } else {
      console.log('⚠️ Admin user with this email already exists.');
      console.log(`   Email: ${ADMIN_EMAIL}`);
    }

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

createAdmin();