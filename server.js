const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config');
const app = express();

// Middleware
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/reading', async (req, res) => {
    try {
        const { name, email, questions } = req.body;
        
        // Validate input
        if (!name || !email || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Process reading (implement your reading logic here)
        const reading = await generateReading(questions);
        
        // Send response
        res.json({ success: true, reading });
    } catch (error) {
        console.error('Error processing reading:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Helper function to generate readings
async function generateReading(questions) {
    // Implement your reading generation logic here
    return {
        timestamp: new Date().toISOString(),
        questions,
        cards: questions.map(() => ({
            name: 'Sample Card',
            meaning: 'Sample interpretation'
        }))
    };
}
