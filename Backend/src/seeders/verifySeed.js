// verifySeed.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { User, Department, Batch, sequelize } = require('../models');

const verify = async () => {
    try {
        const userCount = await User.count();
        const deptCount = await Department.count();
        const batchCount = await Batch.count();

        console.log(`Users: ${userCount}`);
        console.log(`Departments: ${deptCount}`);
        console.log(`Batches: ${batchCount}`);

        const students = await User.findAll({ where: { role: 'student' }, limit: 2, include: 'StudentBatch' });
        if (students.length > 0) {
            console.log('Sample Student:', students[0].name, 'Batch:', students[0].StudentBatch ? students[0].StudentBatch.batch_name : 'None');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await sequelize.close();
    }
};

verify();
