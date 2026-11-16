'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 'role' column with the corrected 'volunteer' role
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('user', 'faculty', 'volunteer', 'admin'), // <-- THE FIX IS HERE
      allowNull: false,
      defaultValue: 'user'
    });

    // Add the 'faculty_id' column for linking students to faculty
    await queryInterface.addColumn('Users', 'faculty_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'faculty_id');
    await queryInterface.removeColumn('Users', 'role');
  }
};