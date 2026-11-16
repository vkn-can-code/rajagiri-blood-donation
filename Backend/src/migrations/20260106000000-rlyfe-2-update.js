'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Users Table Updates
        await queryInterface.addColumn('Users', 'height', { type: Sequelize.FLOAT, allowNull: true });
        await queryInterface.addColumn('Users', 'weight', { type: Sequelize.FLOAT, allowNull: true });
        await queryInterface.addColumn('Users', 'gender', { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true });
        await queryInterface.addColumn('Users', 'student_id', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('Users', 'address', { type: Sequelize.TEXT, allowNull: true });
        await queryInterface.addColumn('Users', 'has_donated', { type: Sequelize.BOOLEAN, defaultValue: false });
        await queryInterface.addColumn('Users', 'last_donation_date', { type: Sequelize.DATEONLY, allowNull: true });
        await queryInterface.addColumn('Users', 'badges', { type: Sequelize.JSON, defaultValue: [] });

        // 2. Batches Table Updates
        await queryInterface.removeColumn('Batches', 'current_semester');

        // 3. Donations Table Updates
        await queryInterface.addColumn('Donations', 'blood_request_id', {
            type: Sequelize.INTEGER,
            references: { model: 'BloodRequests', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert Donations
        await queryInterface.removeColumn('Donations', 'blood_request_id');

        // Revert Batches
        await queryInterface.addColumn('Batches', 'current_semester', { type: Sequelize.INTEGER });

        // Revert Users
        await queryInterface.removeColumn('Users', 'height');
        await queryInterface.removeColumn('Users', 'weight');
        await queryInterface.removeColumn('Users', 'gender');
        await queryInterface.removeColumn('Users', 'student_id');
        await queryInterface.removeColumn('Users', 'address');
        await queryInterface.removeColumn('Users', 'has_donated');
        await queryInterface.removeColumn('Users', 'last_donation_date');
        await queryInterface.removeColumn('Users', 'badges');

        // Note: Enum types in Postgres might persist, but removing column is enough for rollback logic here.
    }
};
