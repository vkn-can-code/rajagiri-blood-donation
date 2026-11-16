// src/migrations/...-create-blood-request.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BloodRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // This links the request to a user account
      requester_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null in case the user account is deleted
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL' // Keep the request record even if the user is deleted
      },
      patient_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      hospital_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      required_blood_group: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      units_required: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'open' // Default status for a new request
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BloodRequests');
  }
};