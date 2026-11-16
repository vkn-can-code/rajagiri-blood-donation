'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmailLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipient_email: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      body_html: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      scheduled_at: {
        type: Sequelize.DATE
      },
      sent_at: {
        type: Sequelize.DATE
      },
      error_message: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('EmailLogs');
  }
};