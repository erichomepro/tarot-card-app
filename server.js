const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve other HTML files
app.get('/reading', (req, res) => {
    res.sendFile(path.join(__dirname, 'reading.html'));
});

app.get('/tarot', (req, res) => {
    res.sendFile(path.join(__dirname, 'tarot.html'));
});

// OpenAI interpretation endpoint
app.post('/api/get-interpretation', async (req, res) => {
    try {
        const { prompt, readingType } = req.body;
        
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
            throw new Error('OpenAI API error');
        }

        const data = await response.json();
        res.json({ interpretation: data.choices[0].message.content });
    } catch (error) {
        console.error('Error in get-interpretation:', error);
        res.status(500).json({ error: 'Failed to get interpretation' });
    }
});

// Endpoint to save reading
app.post('/save-reading', async (req, res) => {
    try {
        const { fileName, content } = req.body;
        const filePath = path.join(__dirname, fileName);

        // Ensure the readings directory exists
        const readingsDir = path.join(__dirname, 'readings');
        try {
            await fs.access(readingsDir);
        } catch {
            await fs.mkdir(readingsDir, { recursive: true });
        }

        // Write the file
        await fs.writeFile(filePath, content);
        res.status(200).json({ message: 'Reading saved successfully' });
    } catch (error) {
        console.error('Error saving reading:', error);
        res.status(500).json({ error: 'Failed to save reading' });
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
        res.status(500).json({ error: 'Failed to save client data' });
    }
});

// Save reading data
app.post('/api/save-reading', async (req, res) => {
    try {
        const readingData = req.body;
        const fileName = `reading_${Date.now()}.json`;
        const filePath = path.join(__dirname, 'readings', fileName);
        
        await fs.writeFile(filePath, JSON.stringify(readingData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Reading saved successfully',
            fileName: fileName
        });
    } catch (error) {
        console.error('Error saving reading:', error);
        res.status(500).json({ error: 'Failed to save reading' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Get port from environment variable or use 3000 as default
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: Set to "${process.env.NODE_ENV}"`);
    console.log(`Static files being served from: ${__dirname}`);
});
