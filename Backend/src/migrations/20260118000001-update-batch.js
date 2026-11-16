'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add department_id column
        await queryInterface.addColumn('Batches', 'department_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Departments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: true // Allow null initially to prevent errors with existing data
        });

        // 2. Remove old columns if they exist
        // We wrap in try-catch in case they don't exist or migration is re-run
        try {
            await queryInterface.removeColumn('Batches', 'department');
        } catch (e) { console.log('Column department likely already removed'); }

        try {
            await queryInterface.removeColumn('Batches', 'class_tutor_id');
        } catch (e) { console.log('Column class_tutor_id likely already removed'); }
    },

    async down(queryInterface, Sequelize) {
        // Revert changes
        await queryInterface.removeColumn('Batches', 'department_id');

        await queryInterface.addColumn('Batches', 'department', {
            type: Sequelize.STRING
        });

        await queryInterface.addColumn('Batches', 'class_tutor_id', {
            type: Sequelize.INTEGER,
            references: { model: 'Users', key: 'id' }
        });
    }
};
