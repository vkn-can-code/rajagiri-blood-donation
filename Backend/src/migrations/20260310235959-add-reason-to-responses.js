'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add reason column
    await queryInterface.addColumn('RequestResponses', 'reason', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Changing an ENUM in Postgres can be tricky, the safest way is to change it to STRING
    await queryInterface.changeColumn('RequestResponses', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'new'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RequestResponses', 'reason');
  }
};
