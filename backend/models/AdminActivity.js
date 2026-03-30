const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    content: { type: String, required: true },
    adminName: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// We handle 'one report per day' manually in the routes logic to avoid index creation conflicts
module.exports = mongoose.model('AdminActivity', adminActivitySchema);
