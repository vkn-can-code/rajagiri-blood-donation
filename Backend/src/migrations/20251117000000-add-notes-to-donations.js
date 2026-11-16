'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Donations', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Donations', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Donations', 'description');
    await queryInterface.removeColumn('Donations', 'rejection_reason');
  }
};