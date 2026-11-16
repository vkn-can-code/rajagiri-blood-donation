// This file is src/seeders/seedData.js

// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { User, Department, Batch, sequelize } = require('../models');

const seedData = async () => {
    console.log('🚀 Starting data seeding process...');

    try {
        // --- 1. Seed Faculty ---
        console.log('\n--- Seeding Faculty ---');
        const facultyData = [
            { name: 'Dr. Alan Turing', email: 'alan@rlyfe.com', role: 'faculty_admin', department: 'Computer Science' },
            { name: 'Dr. Grace Hopper', email: 'grace@rlyfe.com', role: 'faculty_admin', department: 'Computer Science' },
            { name: 'Dr. C.V. Raman', email: 'raman@rlyfe.com', role: 'faculty_admin', department: 'Physics' },
            { name: 'Dr. APJ Abdul Kalam', email: 'kalam@rlyfe.com', role: 'faculty_admin', department: 'Aerospace' }
        ];

        const facultyUsers = [];
        for (const f of facultyData) {
            const [user] = await User.findOrCreate({
                where: { email: f.email },
                defaults: {
                    name: f.name,
                    email: f.email,
                    password_hash: 'password123', // Will be hashed by hook
                    role: f.role,
                    phone_number: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                }
            });
            facultyUsers.push(user);
            console.log(`✅ Faculty: ${user.name}`);
        }

        // --- 2. Seed Departments ---
        console.log('\n--- Seeding Departments ---');
        // Map faculty to departments for Head of Department
        const deptsToCreate = [
            { name: 'Computer Science Engineering', headEmail: 'alan@rlyfe.com', code: 'CSE' },
            { name: 'Electronics & Communication', headEmail: 'grace@rlyfe.com', code: 'ECE' }, // reusing grace for demo
            { name: 'Mechanical Engineering', headEmail: 'raman@rlyfe.com', code: 'ME' }
        ];

        const departments = [];
        for (const d of deptsToCreate) {
            const head = facultyUsers.find(u => u.email === d.headEmail) || facultyUsers[0];

            const [dept] = await Department.findOrCreate({
                where: { name: d.name },
                defaults: {
                    name: d.name,
                    head_faculty_id: head.id
                }
            });
            departments.push(dept);
            console.log(`✅ Department: ${dept.name}`);
        }

        // --- 3. Seed Batches ---
        console.log('\n--- Seeding Batches ---');
        // We need departments to link batches
        // Helper to find dept by fuzzy name matching or code
        const getDept = (code) => departments.find(d => d.name.includes(code) || d.name === code);

        const batchesToCreate = [
            { name: 'S8 CSE Alpha', deptCode: 'Computer Science', tutorEmail: 'alan@rlyfe.com' },
            { name: 'S8 CSE Beta', deptCode: 'Computer Science', tutorEmail: 'grace@rlyfe.com' },
            { name: 'S6 ECE Alpha', deptCode: 'Electronics', tutorEmail: 'raman@rlyfe.com' },
            { name: 'S4 ME Alpha', deptCode: 'Mechanical', tutorEmail: 'kalam@rlyfe.com' } // Kalam wasn't head but can be tutor
        ];

        const batches = [];
        for (const b of batchesToCreate) {
            const dept = getDept(b.deptCode);
            if (!dept) {
                console.warn(`⚠️  Skipping batch ${b.name}: Department not found.`);
                continue;
            }

            // Find tutor, or fallback to first faculty
            let tutor = facultyUsers.find(u => u.email === b.tutorEmail);
            if (!tutor) tutor = facultyUsers[0];

            const [batch] = await Batch.findOrCreate({
                where: { batch_name: b.name },
                defaults: {
                    batch_name: b.name,
                    department_id: dept.id,
                    class_tutor_id: tutor.id
                }
            });
            batches.push(batch);
            console.log(`✅ Batch: ${batch.batch_name} (Dept: ${dept.name})`);
        }

        // --- 4. Seed Students ---
        console.log('\n--- Seeding Students ---');
        const studentNames = [
            'John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown',
            'Diana Prince', 'Evan Wright', 'Fiona Green', 'George King', 'Hannah Scott',
            'Ian Hall', 'Julia White', 'Kevin Lee', 'Laura Adams', 'Mike Ross'
        ];

        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

        for (let i = 0; i < studentNames.length; i++) {
            const name = studentNames[i];
            const email = `${name.toLowerCase().replace(' ', '.')}@student.rlyfe.com`;
            // Distribute students across batches cyclically
            const batch = batches[i % batches.length];
            const bg = bloodGroups[i % bloodGroups.length];

            const [student] = await User.findOrCreate({
                where: { email: email },
                defaults: {
                    name: name,
                    email: email,
                    password_hash: 'student123',
                    role: 'student',
                    phone_number: (9000000000 + i).toString(),
                    batch_id: batch ? batch.id : null,
                    blood_group: bg,
                    // Extra details
                    student_id: `S${2024000 + i}`,
                    gender: i % 2 === 0 ? 'male' : 'female',
                    weight: 60 + (i * 1.5),
                    height: 160 + (i * 2),
                    address: `${i} Rajagiri Valley, Kakkanad`,
                    has_donated: i % 3 === 0, // every 3rd student has donated
                }
            });
            console.log(`✅ Student: ${student.name} (${batch ? batch.batch_name : 'No Batch'})`);
        }

        console.log('\n🌟 Seeding Completed Successfully!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await sequelize.close();
    }
};

seedData();
