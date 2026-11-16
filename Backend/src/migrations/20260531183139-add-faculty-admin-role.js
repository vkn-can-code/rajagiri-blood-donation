'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add 'faculty_admin' to the enum
    // PostgreSQL requires raw query to add to ENUM type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'faculty_admin';
    `);

    // 2. Update existing 'faculty' users to 'faculty_admin'
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET role = 'faculty_admin' WHERE role = 'faculty';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert 'faculty_admin' back to 'faculty'
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET role = 'faculty' WHERE role = 'faculty_admin';
    `);
    
    // Note: Removing a value from a PostgreSQL ENUM is complex and typically requires 
    // creating a new type, migrating data, dropping the old type, and renaming.
    // For simplicity, we just leave the value in the ENUM in the down migration.
  }
};
