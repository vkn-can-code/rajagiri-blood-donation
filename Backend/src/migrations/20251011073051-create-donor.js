// src/migrations/...-create-donor.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Donors', {
      // This column is the Primary Key AND the Foreign Key
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Users', // This links to the 'Users' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If a User is deleted, their Donor profile is also deleted
      },
      blood_group: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      last_donation_date: {
        type: Sequelize.DATEONLY,
        allowNull: true // Can be null for a new donor
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('Donors');
  }
};