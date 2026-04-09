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
    // BDE Specific fields
    project: { type: String, default: '-' },
    officeVisits: { type: Number, default: 0 },
    underInterview: { type: Number, default: 0 },
    paymentProgress: { type: Number, default: 0 },
    partialPaid: { type: Number, default: 0 },
    joinedCompany: { type: Number, default: 0 },
    // SBI Specific fields
    rnr: { type: Number, default: 0 },
    od: { type: Number, default: 0 },
    cardProcessing: { type: Number, default: 0 },
    cardReceived: { type: Number, default: 0 },
    // Insurance Specific fields
    insuranceConverted: { type: Number, default: 0 },
    partialPaymentDone: { type: Number, default: 0 },
    fullyPaid: { type: Number, default: 0 }
});

const hrMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, default: 'HR Executive' },
    domain: { type: String, default: 'Recruitment' },
    team: { type: String, default: 'General' },
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
    totalOfficeVisits: { type: Number, default: 0 },
    totalJoined: { type: Number, default: 0 },
    totalCardReceived: { type: Number, default: 0 },
    totalFullyPaid: { type: Number, default: 0 },
    project: { type: String, default: '-' },
    performanceHistory: [performanceDataSchema],
    avatar: { type: String, default: 'https://i.pravatar.cc/150' }
}, { timestamps: true });

module.exports = mongoose.models.HRMember || mongoose.model('HRMember', hrMemberSchema);
