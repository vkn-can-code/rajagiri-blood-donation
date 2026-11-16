'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('RequestResponses', 'certificate_status', {
      type: Sequelize.ENUM('none', 'uploaded', 'granted'),
      defaultValue: 'none',
      allowNull: false
    });
    await queryInterface.addColumn('RequestResponses', 'certificate_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('RequestResponses', 'certificate_status');
    await queryInterface.removeColumn('RequestResponses', 'certificate_url');
    // If you need to drop the ENUM type completely in Postgres, you might need raw SQL:
    // await queryInterface.sequelize.query('DROP TYPE "enum_RequestResponses_certificate_status";'); 
  }
};
