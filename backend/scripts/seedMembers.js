const mongoose = require('mongoose');
const HRMember = require('../models/HRMember');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance';

const seedMembers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const members = [
            {
                name: 'Arun Kumar',
                designation: 'Sr. Sales Officer',
                domain: 'Sales',
                team: 'SBI',
                dailyTarget: 30,
                performanceHistory: [{
                    date: new Date(),
                    calls: 45,
                    callsPicked: 30,
                    callsNotPicked: 15,
                    panVerified: 12,
                    detailsVerified: 10,
                    approvedCount: 8,
                    comments: 'Excellent performance in credit card sales.'
                }]
            },
            {
                name: 'Priyanka Sharma',
                designation: 'HR Executive',
                domain: 'Recruitment',
                team: 'HR',
                dailyTarget: 20,
                performanceHistory: [{
                    date: new Date(),
                    calls: 35,
                    joinees: 3,
                    convertedCalls: 5,
                    comments: 'Steady progress in hiring for the IT department.'
                }]
            },
            {
                name: 'Rahul Singh',
                designation: 'BDE Lead',
                domain: 'Business Development',
                team: 'BDE',
                dailyTarget: 10,
                performanceHistory: [{
                    date: new Date(),
                    calls: 25,
                    convertedCalls: 2,
                    joinees: 1,
                    companyName: 'TechCorp Solutions',
                    rolePosition: 'Sr. Developer',
                    comments: 'Finalizing partnership with TechCorp.'
                }]
            },
            {
                name: 'Deepica R',
                designation: 'Verification Specialist',
                domain: 'Backend Operations',
                team: 'SBI',
                dailyTarget: 40,
                performanceHistory: [{
                    date: new Date(),
                    calls: 50,
                    callsPicked: 40,
                    callsNotPicked: 10,
                    panVerified: 35,
                    detailsVerified: 30,
                    approvedCount: 25,
                    comments: 'High verification accuracy today.'
                }]
            }
        ];

        // Only add if not exists to avoid duplicates if run multiple times
        for (const m of members) {
            const existing = await HRMember.findOne({ name: m.name });
            if (!existing) {
                await new HRMember(m).save();
                console.log(`Added member: ${m.name}`);
            } else {
                console.log(`Member already exists: ${m.name}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
};

seedMembers();
