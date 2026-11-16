'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Camps', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Camps', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Camps', 'latitude');
    await queryInterface.removeColumn('Camps', 'longitude');
  }
};