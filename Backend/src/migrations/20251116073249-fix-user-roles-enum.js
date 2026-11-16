'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Raw SQL to add new values to an existing ENUM type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE 'student';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE 'non_teaching';
    `);
  },

  async down(queryInterface, Sequelize) {
    // "down" is complex for enums and not needed for this fix.
    // We can leave it blank.
    console.log('Cannot easily remove enum values. "down" migration skipped.');
  }
};