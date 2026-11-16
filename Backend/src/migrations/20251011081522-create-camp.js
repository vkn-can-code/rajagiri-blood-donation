// src/migrations/...-create-camp.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Camps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true // Address can be optional
      },
      camp_date: {
        type: Sequelize.DATE, // Using DATE for timestamp with time zone
        allowNull: false
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
    await queryInterface.dropTable('Camps');
  }
};