const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const hrRoutes = require('./routes/hrRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Diagnostic Logger
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log(`- Host: ${req.headers.host}`);
    console.log(`- Origin: ${req.headers.origin}`);
    next();
});

// Middleware
app.use(cors({
    origin: [
        'https://tl-tracking-portal-vzew.vercel.app', 
        'https://tl-tracking-portal-kk6n.vercel.app',
        /\.vercel\.app$/, // Allow any Vercel deployment
        'http://localhost:5173', 
        'http://127.0.0.1:5173'
    ],
    credentials: true
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'OK', environment: process.env.NODE_ENV }));
app.get('/health', (req, res) => res.json({ status: 'OK', source: 'root' }));
app.get('/api/hr/health', (req, res) => res.json({ status: 'OK', source: 'api/hr' }));

// Routes
app.use('/api/hr', hrRoutes);
app.use('/hr', hrRoutes); // Fallback for various deployment environments

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// Only start server if not being imported (Vercel uses its own wrapper)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Basic route
app.get('/', (req, res) => {
    res.send('HR Performance API is running...');
});

// Custom 404 Handler for Diagnostics
app.use((req, res) => {
    const errorMsg = `[404 Error] Not Found: ${req.url}`;
    console.log(errorMsg);
    res.status(404).json({ 
        message: 'Route not found in Express', 
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestion: 'Check if you are missing /api/hr prefix or if the proxy is stripping it.'
    });
});

module.exports = app;
