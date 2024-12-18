const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from root directory
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.jpg') || filePath.endsWith('.png')) {
            res.set('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Serve HTML files
app.get('/', (req, res) => {
    console.log('Serving index.html from:', path.join(__dirname, 'index.html'));
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading the page');
        }
    });
});

app.get('/reading', (req, res) => {
    res.sendFile(path.join(__dirname, 'reading.html'), (err) => {
        if (err) {
            console.error('Error sending reading.html:', err);
            res.status(500).send('Error loading the reading page');
        }
    });
});

app.get('/tarot', (req, res) => {
    res.sendFile(path.join(__dirname, 'tarot.html'), (err) => {
        if (err) {
            console.error('Error sending tarot.html:', err);
            res.status(500).send('Error loading the tarot page');
        }
    });
});

// OpenAI interpretation endpoint
app.post('/api/get-interpretation', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Received interpretation request:', prompt);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            throw new Error('OpenAI API error: ' + error);
        }

        const data = await response.json();
        res.json({ interpretation: data.choices[0].message.content });
    } catch (error) {
        console.error('Error in get-interpretation:', error);
        res.status(500).json({ error: 'Failed to get interpretation', details: error.message });
    }
});

// Handle client data
app.post('/api/save-client', (req, res) => {
    try {
        const clientData = req.body;
        console.log('Received client data:', clientData);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving client data:', error);
        res.status(500).json({ error: 'Failed to save client data', details: error.message });
    }
});

// Save reading data
app.post('/api/save-reading', async (req, res) => {
    try {
        const readingData = req.body;
        const fileName = `reading_${Date.now()}.json`;
        const filePath = path.join(__dirname, 'readings', fileName);
        
        // Ensure readings directory exists
        const readingsDir = path.join(__dirname, 'readings');
        try {
            await fs.access(readingsDir);
        } catch {
            await fs.mkdir(readingsDir, { recursive: true });
        }
        
        await fs.writeFile(filePath, JSON.stringify(readingData, null, 2));
        console.log('Reading saved to:', filePath);
        
        res.json({ 
            success: true, 
            message: 'Reading saved successfully',
            fileName: fileName
        });
    } catch (error) {
        console.error('Error saving reading:', error);
        res.status(500).json({ error: 'Failed to save reading', details: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Get port from environment variable or use 3000 as default
const port = process.env.PORT || 3000;

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log('==================================');
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Static files being served from: ${__dirname}`);
    console.log(`Images directory: ${path.join(__dirname, 'images')}`);
    console.log('Directory contents:');
    fs.readdir(__dirname)
        .then(files => console.log(files))
        .catch(err => console.error('Error listing directory:', err));
    console.log('==================================');
});
