'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Donations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // --- THIS IS THE CRITICAL FIX ---
      // This block correctly defines the user_id column and links it to the Users table.
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Links to the 'Users' table
          key: 'id'
        },
        onDelete: 'CASCADE' // If the user is deleted, their donation records are also deleted
      },
      // ---------------------------------
      camp_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Camps',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      donation_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      certificate_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
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
    await queryInterface.dropTable('Donations');
  }
};