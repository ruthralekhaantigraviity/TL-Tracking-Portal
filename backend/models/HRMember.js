const mongoose = require('mongoose');

const performanceDataSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    calls: { type: Number, default: 0 },
    callCategory: { type: String, default: '-' },
    convertedCalls: { type: Number, default: 0 },
    conversionSector: { type: String, default: '-' },
    joinees: { type: Number, default: 0 },
    paidSector: { type: String, default: '-' },
    complaints: { type: Number, default: 0 },
    complaintReason: { type: String, default: '-' },
    completedTarget: { type: Number, default: 0 },
    comments: { type: String, default: '-' },
    // SBI Specific fields
    panVerified: { type: Number, default: 0 },
    detailsVerified: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    declinedCount: { type: Number, default: 0 },
    dispatchCompleted: { type: Number, default: 0 },
    callsPicked: { type: Number, default: 0 },
    callsNotPicked: { type: Number, default: 0 },
    // BDE Specific fields
    companyName: { type: String, default: '-' },
    rolePosition: { type: String, default: '-' }
});




const hrMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, default: 'HR Executive' },
    domain: { type: String, default: 'Recruitment' },
    team: { type: String, default: 'HR', enum: ['HR', 'SBI', 'IT', 'Sales', 'BDE', 'Administration'] },

    dailyTask: { type: String, default: 'Internal Processing' },
    dailyTarget: { type: Number, default: 0 },
    completedTarget: { type: Number, default: 0 },
    clientsProvided: { type: Number, default: 0 },
    convertedCalls: { type: Number, default: 0 },
    conversionSector: { type: String, default: '-' },
    paidCount: { type: Number, default: 0 },
    paidSector: { type: String, default: '-' },
    totalCalls: { type: Number, default: 0 },
    callCategory: { type: String, default: '-' },
    totalJoinees: { type: Number, default: 0 },
    totalComplaints: { type: Number, default: 0 },
    complaintReason: { type: String, default: '-' },
    workDuration: { type: String, default: '8h' },
    achievementRate: { type: Number, default: 0 },
    comments: { type: String, default: '-' },
    // SBI Specific totals
    panVerified: { type: Number, default: 0 },
    detailsVerified: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    declinedCount: { type: Number, default: 0 },
    dispatchCompleted: { type: Number, default: 0 },
    totalCallsPicked: { type: Number, default: 0 },
    totalCallsNotPicked: { type: Number, default: 0 },
    // BDE Specific totals/current
    companyName: { type: String, default: '-' },
    rolePosition: { type: String, default: '-' },
    performanceHistory: [performanceDataSchema],


    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
}, { timestamps: true });


module.exports = mongoose.model('HRMember', hrMemberSchema);
