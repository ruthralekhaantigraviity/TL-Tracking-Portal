const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const hrRoutes = require('./routes/hrRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://tl-tracking-portal-vzew.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/hr', hrRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_performance')

    .then(() => {
        console.log('Connected to MongoDB');
        // Only start server if not being imported (Vercel uses its own wrapper)
        if (require.main === module) {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Basic route
app.get('/', (req, res) => {
    res.send('HR Performance API is running...');
});

module.exports = app;
