'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BloodRequests', 'patient_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'bystander_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'bystander_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('BloodRequests', 'required_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BloodRequests', 'patient_id');
    await queryInterface.removeColumn('BloodRequests', 'reason');
    await queryInterface.removeColumn('BloodRequests', 'bystander_name');
    await queryInterface.removeColumn('BloodRequests', 'bystander_number');
    await queryInterface.removeColumn('BloodRequests', 'required_date');
  }
};