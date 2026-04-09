const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance';

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for user seeding...');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users.');

        const users = [
            { username: 'sabari', password: 'password123', name: 'Sabari', designation: 'TL – BDE', role: 'TL', assignedTeam: 'BDE' },
            { username: 'sreesha', password: 'password123', name: 'Sreesha', designation: 'TL – SBI', role: 'TL', assignedTeam: 'SBI' },
            { username: 'insurance_tl', password: 'password123', name: 'Insurance TL', designation: 'TL – Insurance', role: 'TL', assignedTeam: 'Insurance' },
            { username: 'adithya', password: 'password123', name: 'Adithya', designation: 'HR Manager', role: 'Manager', assignedTeam: 'All' },
            { username: 'vaideeshwari', password: 'password123', name: 'Vaideeshwari', designation: 'Administration', role: 'Admin', assignedTeam: 'All' }
        ];

        for (const u of users) {
             await new User(u).save();
             console.log(`Added user: ${u.username}`);
        }

        console.log('User seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
};

seedUsers();
