'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // The model expects a 'super_admin' role but no prior migration ever added it to the enum.
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'super_admin';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Cannot easily remove enum values. "down" migration skipped.');
  }
};
