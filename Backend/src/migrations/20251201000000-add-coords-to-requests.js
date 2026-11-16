'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BloodRequests', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BloodRequests', 'latitude');
    await queryInterface.removeColumn('BloodRequests', 'longitude');
  }
};