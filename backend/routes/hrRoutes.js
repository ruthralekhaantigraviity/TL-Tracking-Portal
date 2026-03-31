const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const HRMember = require('../models/HRMember');
const User = require('../models/User');
const AdminActivity = require('../models/AdminActivity');

const JWT_SECRET = 'forge-india-secret-2024';

// Middleware to verify JWT
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Session expired. Please log in again.', details: e.message });
    }
};

// @route   POST /api/hr/login
// @desc    User Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for: ${username}`);
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        console.log(`Password match for ${username}: ${isMatch}`);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);

        res.json({ 
            token, 
            user: { 
                name: user.name, 
                role: user.role, 
                designation: user.designation,
                assignedTeam: user.assignedTeam 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hr
// @desc    Get members (filtered by user access)
router.get('/', auth, async (req, res) => {
    try {
        const { team } = req.query;
        let query = {};
        
        // Restrict by team leader's assigned team if not Admin
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            query.team = req.user.assignedTeam;
        } else if (team) {
            query.team = team;
        }

        const members = await HRMember.find(query).sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hr/seed-users
router.post('/seed-users', async (req, res) => {
    try {
        await User.deleteMany({});
        const users = await User.create([
            { username: 'sabari', password: 'sabari123', name: 'Sabari', designation: 'TL BDE', role: 'TL', assignedTeam: 'BDE' },
            { username: 'srisha', password: 'srisha123', name: 'Srisha', designation: 'TL SBI', role: 'TL', assignedTeam: 'SBI' },
            { username: 'Aditiya', password: 'Aditiya123', name: 'Aditiya', designation: 'HR Manager', role: 'Manager', assignedTeam: 'HR' },
            { username: 'vaideeshwari', password: 'password123', name: 'Vaideeshwari', designation: 'Administration', role: 'Admin', assignedTeam: 'All' },
            { username: 'admin', password: 'password123', name: 'Admin User', designation: 'Portal Admin', role: 'Admin', assignedTeam: 'All' }
        ]);
        res.status(201).json({ message: 'Users seeded', count: users.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hr/seed
router.post('/seed', async (req, res) => {
    try {
        await HRMember.deleteMany({});
        const members = await HRMember.create([
            {
                name: 'Aditya', designation: 'Senior HR Manager', domain: 'Recruitment', team: 'HR', dailyTask: 'Candidate Shortlisting', dailyTarget: 50, completedTarget: 42, totalCalls: 120, totalJoinees: 8, totalComplaints: 2, achievementRate: 94, workDuration: '9h',
                performanceHistory: [{ date: new Date(), calls: 90, joinees: 4, complaints: 0 }]
            },
            {
                name: 'Darshan', designation: 'HR Executive', domain: 'Sales', team: 'SBI', dailyTask: 'Final Interview Scheduling', dailyTarget: 30, completedTarget: 28, totalCalls: 98, totalJoinees: 4, totalComplaints: 1, achievementRate: 88, workDuration: '8h',
                performanceHistory: [{ date: new Date(), calls: 75, callsPicked: 50, callsNotPicked: 25, approvedCount: 1, declinedCount: 1, panVerified: 5, detailsVerified: 5, dispatchCompleted: 2, comments: 'Steady SBI outreach.' }]
            },
            {
                name: 'Yokesh', designation: 'BDE Professional', domain: 'Sales', team: 'BDE', dailyTask: 'Client Acquisition', dailyTarget: 10, completedTarget: 8, totalCalls: 45, totalJoinees: 3, totalComplaints: 0, achievementRate: 80, workDuration: '8h', companyName: 'Google India', rolePosition: 'Sales Lead',
                performanceHistory: [{ date: new Date(), calls: 15, joinees: 1, companyName: 'Google India', rolePosition: 'Sales Lead' }]
            }
        ]);
        res.status(201).json({ message: 'Members seeded', count: members.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hr
router.post('/', auth, async (req, res) => {
    try {
        const { name, designation, domain, team } = req.body;
        // Verify user can add to this team
        if (req.user.role === 'TL' && req.user.assignedTeam !== team) {
            return res.status(403).json({ message: 'Unauthorized to add to this team' });
        }

        const newMember = new HRMember({
            name, designation, domain, team: team || 'HR',
            dailyTask: 'Setting up workspace',
            performanceHistory: [{ date: new Date(), calls: 0, joinees: 0, complaints: 0, comments: 'New member initialized' }]
        });
        const savedMember = await newMember.save();
        res.status(201).json(savedMember);
    } catch (err) {
        console.error('CRITICAL: Member Creation Error:', err.message);
        res.status(400).json({ 
            message: 'Failed to create member', 
            details: err.message 
        });
    }
});

// @route   PUT /api/hr/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const updateFields = req.body;
        const member = await HRMember.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        // Verify team leader access
        if (req.user.role === 'TL' && req.user.assignedTeam !== member.team) {
            return res.status(403).json({ message: 'Unauthorized to update this team' });
        }

        // Handle BDE specific fields mapping
        if (member.team === 'BDE' && updateFields.companyName) member.companyName = updateFields.companyName;
        if (member.team === 'BDE' && updateFields.rolePosition) member.rolePosition = updateFields.rolePosition;

        // Auto-calculate historical consistency
        const latest = member.performanceHistory[member.performanceHistory.length - 1];
        if (latest) {
             // Map counts
             if (updateFields.totalCallsToday !== undefined) latest.calls = Number(updateFields.totalCallsToday);
             if (updateFields.paidCount !== undefined) latest.joinees = Number(updateFields.paidCount);
             
             // Update SBI fields
             if (updateFields.panVerified !== undefined) latest.panVerified = Number(updateFields.panVerified);
             if (updateFields.approvedCount !== undefined) latest.approvedCount = Number(updateFields.approvedCount);
             
             // Update BDE fields in history
             if (updateFields.companyName) latest.companyName = updateFields.companyName;
             if (updateFields.rolePosition) latest.rolePosition = updateFields.rolePosition;
             
             latest.comments = updateFields.comments || latest.comments;
        }

        Object.assign(member, updateFields);
        const updatedMember = await member.save();
        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/hr/admin/activity
// @desc    Submit Daily Admin Activity Log
router.post('/admin/activity', auth, async (req, res) => {
    try {
        console.log('--- Admin Activity Log Attempt ---');
        console.log('User Role:', req.user.role);
        console.log('User Name:', req.user.name);
        console.log('Payload:', req.body);

        if (req.user.role !== 'Admin') {
            console.log('Unauthorized: User is not an Admin');
            return res.status(403).json({ message: 'Only Admins can log daily activity.' });
        }

        const { content, date } = req.body;
        if (!content || !date) {
            return res.status(400).json({ message: 'Content and date are required' });
        }
        
        // Find existing for today or create new using manual uniqueness check
        let activity = await AdminActivity.findOne({ date, adminId: req.user._id });
        console.log('Existing Activity Found:', !!activity);
        
        if (activity) {
            activity.content = content;
            await activity.save();
            console.log('Activity Updated Successfully');
        } else {
            activity = new AdminActivity({
                date,
                content,
                adminName: req.user.name || 'Admin',
                adminId: req.user._id
            });
            await activity.save();
            console.log('New Activity Created Successfully');
        }
        
        res.status(201).json(activity);
    } catch (err) {
        console.error('CRITICAL: Admin Activity Save Error:', err.stack);
        res.status(500).json({ 
            message: 'Failed to save activity log', 
            details: err.message 
        });
    }
});

// @route   GET /api/hr/admin/activity/:date
// @desc    Get Admin Activity Log for a specific date
router.get('/admin/activity/:date', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const activity = await AdminActivity.findOne({ 
            date: req.params.date, 
            adminId: req.user._id 
        });
        
        if (!activity) {
            return res.status(404).json({ message: 'No log found for this date.' });
        }
        
        res.json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/hr/:id
// @desc    Remove a team member
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await HRMember.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Authorization: Admin can delete anyone, TL can only delete from their team
        if (req.user.role === 'TL' && req.user.assignedTeam !== member.team) {
            return res.status(403).json({ 
                message: 'Unauthorized', 
                details: `As a TL, you can only remove members from the ${req.user.assignedTeam} team.` 
            });
        }

        if (req.user.role !== 'Admin' && req.user.role !== 'TL' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Unauthorized: insufficient permissions' });
        }

        await HRMember.findByIdAndDelete(req.params.id);
        console.log(`User ${req.user.name} removed member ${member.name}`);
        
        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('CRITICAL: Member Deletion Error:', err.message);
        res.status(400).json({ 
            message: 'Failed to remove member', 
            details: err.message 
        });
    }
});

module.exports = router;
