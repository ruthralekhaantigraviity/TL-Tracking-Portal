const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: 'Department performance unit' },
    domain: { type: String, default: 'General' },
    teamLeader: { type: String, default: '-' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'Users' }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
