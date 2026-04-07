const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const HRMember = require('../models/HRMember');
const User = require('../models/User');
const Team = require('../models/Team');
const AdminActivity = require('../models/AdminActivity');

const JWT_SECRET = 'forge-india-secret-2024';

// Middleware to verify JWT
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token) {
            console.log('Auth failed: No token provided');
            throw new Error('No token provided');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);
        
        if (!user) {
            console.log(`Auth failed: User not found for ID ${decoded._id}`);
            throw new Error('User not found');
        }
        
        req.user = user;
        next();
    } catch (e) {
        console.log(`Auth middleware error: ${e.message}`);
        res.status(401).json({ message: 'Session expired. Please log in again.', details: e.message });
    }
};

// @route   POST /api/hr/login
// @desc    User Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for: ${username}`);
        // Case-insensitive search for username
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
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

// @route   POST /api/hr/register
// @desc    Register a new user (Admin/Manager only)
router.post('/register', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Only Admins and Managers can create accounts' });
        }
        const { username, password, name, role, designation, assignedTeam } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const newUser = new User({
            username: username.toLowerCase(),
            password, // Password hashing is handled by pre-save hook
            name,
            role: role || 'TL',
            designation,
            assignedTeam: assignedTeam || 'HR'
        });

        await newUser.save();
        
        const token = jwt.sign({ _id: newUser._id }, JWT_SECRET);
        
        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                role: newUser.role,
                designation: newUser.designation,
                assignedTeam: newUser.assignedTeam
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hr/teams
// @desc    Get all teams (Publicly accessible for registration)
router.get('/teams', async (req, res) => {
    try {
        let teams = await Team.find().sort({ name: 1 }).lean();
        
        // Check for optional auth to show Administration
        const token = req.header('Authorization')?.replace('Bearer ', '');
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                user = await User.findById(decoded._id);
            } catch (e) {
                // Ignore token error for this public route
            }
        }

        // Ensure Administration is in the list for Admin/Manager
        if (user && (user.role === 'Admin' || user.role === 'Manager')) {
            const hasAdmin = teams.some(t => t.name === 'Administration');
            if (!hasAdmin) {
                teams.unshift({ 
                    _id: 'admin_team_id', 
                    name: 'Administration', 
                    domain: 'Management' 
                });
            }
        } else {
            // Public registration also sees Administration option by default 
            // OR we can decide to hide it. I'll include it for now as per user's "all dashboards" request.
            if (!teams.some(t => t.name === 'Administration')) {
                teams.unshift({ _id: 'admin_team_id', name: 'Administration', domain: 'Management' });
            }
        }
        
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hr/teams
// @desc    Create a new team
router.post('/teams', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Only Admins and Managers can add teams' });
        }
        const { name, domain, description } = req.body;
        
        // Check if team name already exists (case-insensitive)
        const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingTeam) {
            return res.status(400).json({ message: `A team named "${name}" already exists. Please choose a different name.` });
        }

        const newTeam = new Team({ name, domain, description });
        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam);
    } catch (err) {
        res.status(400).json({ message: 'Failed to create team. Please check your inputs.' });
    }
});

// @route   DELETE /api/hr/teams/:id
// @desc    Delete a team
router.delete('/teams/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Only Admins and Managers can delete teams' });
        }
        
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Optional: We could prevent deletion if members exist, 
        // but for now, we'll just delete the team entry.
        await Team.findByIdAndDelete(req.params.id);
        
        console.log(`Team "${team.name}" deleted by ${req.user.name}`);
        res.json({ message: 'Team deleted successfully' });
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
    res.json({ message: 'User seeding handled by main seed' });
});

// @route   POST /api/hr/seed
router.post('/seed', async (req, res) => {
    try {
        // Seed Users
        await User.deleteMany({});
        const users = await User.create([
            { username: 'sabari', password: 'password123', name: 'Sabari', designation: 'TL – BDE', role: 'TL', assignedTeam: 'BDE' },
            { username: 'sreesha', password: 'password123', name: 'Sreesha', designation: 'TL – SBI', role: 'TL', assignedTeam: 'SBI' },
            { username: 'insurance_tl', password: 'password123', name: 'Insurance TL', designation: 'TL – Insurance', role: 'TL', assignedTeam: 'Insurance' },
            { username: 'adithya', password: 'password123', name: 'Adithya', designation: 'HR Manager', role: 'Manager', assignedTeam: 'All' },
            { username: 'vaideeshwari', password: 'password123', name: 'Vaideeshwari', designation: 'Administration', role: 'Admin', assignedTeam: 'All' }
        ]);

        // Seed Teams
        await Team.deleteMany({});
        const teams = await Team.create([
            { name: 'BDE', domain: 'Business Development', description: 'BDE Team Operations' },
            { name: 'SBI', domain: 'Financial Services', description: 'SBI Card Reporting' },
            { name: 'Insurance', domain: 'Insurance', description: 'Insurance Team Reporting' },
            { name: 'Administration', domain: 'Management', description: 'Core System Control' }
        ]);

        // Seed Sample Members
        await HRMember.deleteMany({});
        const members = await HRMember.create([
            {
                name: 'Vikas Chenna', team: 'BDE', designation: 'BDE Executive', project: 'Asset Acquisition', dailyTarget: 10, completedTarget: 8, totalCalls: 45, 
                performanceHistory: [{ date: new Date(), project: 'Asset Acquisition', calls: 45, officeVisits: 2, joinedCompany: 1, completedTarget: 8 }]
            },
            {
                name: 'Rahul Kumar', team: 'SBI', designation: 'SBI Executive', dailyTarget: 20, completedTarget: 15, totalCalls: 60,
                performanceHistory: [{ date: new Date(), calls: 60, rnr: 5, od: 2, cardProcessing: 10, cardReceived: 3, completedTarget: 15 }]
            },
            {
                name: 'Anjali Sharma', team: 'Insurance', designation: 'Insurance Executive', dailyTarget: 15, completedTarget: 10, totalCalls: 50,
                performanceHistory: [{ date: new Date(), calls: 50, insuranceConverted: 5, partialPaymentDone: 2, fullyPaid: 1, completedTarget: 10 }]
            }
        ]);

        res.status(201).json({ 
            message: 'Portal Seeding Successful', 
            users: users.length, 
            teams: teams.length,
            members: members.length
        });
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
             // Map counts & core fields
             if (updateFields.totalCallsToday !== undefined) latest.calls = Number(updateFields.totalCallsToday);
             if (updateFields.paidCount !== undefined) latest.joinees = Number(updateFields.paidCount);
             if (updateFields.convertedCalls !== undefined) latest.convertedCalls = Number(updateFields.convertedCalls);
             if (updateFields.completedTarget !== undefined) latest.completedTarget = Number(updateFields.completedTarget);
             if (updateFields.callCategory !== undefined) latest.callCategory = updateFields.callCategory;
             
             // Update SBI fields in history
             if (updateFields.rnr !== undefined) latest.rnr = Number(updateFields.rnr);
             if (updateFields.od !== undefined) latest.od = Number(updateFields.od);
             if (updateFields.cardProcessing !== undefined) latest.cardProcessing = Number(updateFields.cardProcessing);
             if (updateFields.cardReceived !== undefined) latest.cardReceived = Number(updateFields.cardReceived);
             
             // Update BDE fields in history
             if (updateFields.project) latest.project = updateFields.project;
             if (updateFields.officeVisits !== undefined) latest.officeVisits = Number(updateFields.officeVisits);
             if (updateFields.underInterview !== undefined) latest.underInterview = Number(updateFields.underInterview);
             if (updateFields.paymentProgress !== undefined) latest.paymentProgress = Number(updateFields.paymentProgress);
             if (updateFields.partialPaid !== undefined) latest.partialPaid = Number(updateFields.partialPaid);
             if (updateFields.joinedCompany !== undefined) latest.joinedCompany = Number(updateFields.joinedCompany);

             // Update Insurance fields in history
             if (updateFields.insuranceConverted !== undefined) latest.insuranceConverted = Number(updateFields.insuranceConverted);
             if (updateFields.partialPaymentDone !== undefined) latest.partialPaymentDone = Number(updateFields.partialPaymentDone);
             if (updateFields.fullyPaid !== undefined) latest.fullyPaid = Number(updateFields.fullyPaid);
             
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
