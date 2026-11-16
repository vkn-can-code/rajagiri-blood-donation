'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CampRegistrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      camp_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Camps',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'auto_rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      weight_over_45: {
        type: Sequelize.BOOLEAN
      },
      already_donated: {
        type: Sequelize.BOOLEAN
      },
      major_surgery: {
        type: Sequelize.BOOLEAN
      },
      on_medication: {
        type: Sequelize.BOOLEAN
      },
      tattoo_piercing: {
        type: Sequelize.BOOLEAN
      },
      consumed_alcohol: {
        type: Sequelize.BOOLEAN
      },
      dental_work: {
        type: Sequelize.BOOLEAN
      },
      pregnant_breastfeeding: {
        type: Sequelize.BOOLEAN
      },
      history_disease: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('CampRegistrations');
  }
};