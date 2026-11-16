// resetAdmin.js
require('dotenv').config();
const { User, sequelize } = require('./src/models');

const reset = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rlyfe.com';
    console.log(`🗑️  Deleting user: ${adminEmail}...`);
    
    await User.destroy({ where: { email: adminEmail } });
    
    console.log('✅ Admin deleted. Restart the server to re-seed.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

reset();