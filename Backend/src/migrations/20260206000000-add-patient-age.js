
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('BloodRequests', 'patient_age', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('BloodRequests', 'patient_age');
    }
};
