'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Make phone_number optional (This is the only change we need now)
    await queryInterface.changeColumn('Users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    // NOTE: We removed the code to add 'permissions' because your database already has it.
  },

  async down(queryInterface, Sequelize) {
    // Ideally, we would revert phone_number to NOT NULL here, 
    // but that causes issues if there are existing users without phones.
    // So we will leave the down method empty or just log a message.
  }
};