'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('BloodRequests', 'google_maps_link', {
      type: Sequelize.STRING,
      allowNull: true
    });
    // Remove old columns
    await queryInterface.removeColumn('BloodRequests', 'latitude');
    await queryInterface.removeColumn('BloodRequests', 'longitude');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('BloodRequests', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.removeColumn('BloodRequests', 'google_maps_link');
  }
};
