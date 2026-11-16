'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'blood_group', {
      type: Sequelize.STRING(5), // e.g., "AB+"
      allowNull: true, // Optional initially
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'blood_group');
  }
};