const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
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

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
