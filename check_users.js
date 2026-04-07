const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance';

const checkUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const count = await User.countDocuments();
        console.log(`User count: ${count}`);
        if (count > 0) {
            const users = await User.find({}, { username: 1 });
            console.log('Usernames found:', users.map(u => u.username).join(', '));
        } else {
            console.log('No users found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkUsers();
