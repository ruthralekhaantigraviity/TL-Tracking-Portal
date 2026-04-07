const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Team = require('../models/Team');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance';

const removeTeam = async (teamName) => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');

        const result = await Team.deleteOne({ name: teamName });
        if (result.deletedCount > 0) {
            console.log(`Successfully removed team: ${teamName}`);
        } else {
            console.log(`Team "${teamName}" not found.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

removeTeam('sabari');
