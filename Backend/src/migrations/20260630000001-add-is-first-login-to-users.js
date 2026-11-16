'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'is_first_login', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // All existing users treated as first-login until they reset
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'is_first_login');
  }
};
