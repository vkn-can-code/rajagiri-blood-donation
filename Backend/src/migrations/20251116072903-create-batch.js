'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Batches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batch_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      department: {
        type: Sequelize.STRING
      },
      current_semester: {
        type: Sequelize.INTEGER
      },
      class_tutor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // Assumes 'Users' table already exists
          key: 'id'
        },
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Batches');
  }
};