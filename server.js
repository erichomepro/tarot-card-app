const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from the public directory
app.use(express.static('public'));
app.use('/images', express.static('images'));

// API Routes
app.post('/api/reading', async (req, res) => {
    try {
        console.log('Received reading request:', req.body);
        const { name, email, questions } = req.body;
        
        // Validate input
        if (!name || !email || !questions || !Array.isArray(questions)) {
            console.log('Invalid input received:', req.body);
            return res.status(400).json({ 
                error: 'Invalid input',
                details: 'Name, email, and questions array are required'
            });
        }

        // Process reading
        const reading = await generateReading(questions);
        console.log('Generated reading:', reading);
        
        res.json({ success: true, reading });
    } catch (error) {
        console.error('Error processing reading:', error);
        res.status(500).json({ 
            error: 'Error processing reading request',
            message: error.message
        });
    }
});

// OpenAI interpretation endpoint
app.post('/api/get-interpretation', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Received interpretation request:', prompt);

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

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
        res.status(500).json({ 
            error: 'Failed to get interpretation',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Static files directory: ${path.join(__dirname, 'public')}`);
    console.log(`Images directory: ${path.join(__dirname, 'images')}`);
});

// Helper function to generate readings
async function generateReading(questions) {
    try {
        // Generate a reading for each question
        const readings = await Promise.all(questions.map(async (question) => {
            const card = {
                name: getRandomCard(),
                position: Math.random() > 0.5 ? 'upright' : 'reversed'
            };

            // Get interpretation from OpenAI if API key is available
            if (process.env.OPENAI_API_KEY) {
                const prompt = `Generate a tarot card reading interpretation for the question: "${question}" with the card "${card.name}" in ${card.position} position. Keep the interpretation concise but meaningful.`;
                
                try {
                    const interpretation = await getInterpretation(prompt);
                    card.interpretation = interpretation;
                } catch (error) {
                    console.error('Error getting interpretation:', error);
                    card.interpretation = getDefaultInterpretation(card);
                }
            } else {
                card.interpretation = getDefaultInterpretation(card);
            }

            return {
                question,
                card
            };
        }));

        return {
            timestamp: new Date().toISOString(),
            readings
        };
    } catch (error) {
        console.error('Error generating reading:', error);
        throw error;
    }
}

function getRandomCard() {
    const cards = [
        'The Fool', 'The Magician', 'The High Priestess', 'The Empress',
        'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
        'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
        'The Hanged Man', 'Death', 'Temperance', 'The Devil',
        'The Tower', 'The Star', 'The Moon', 'The Sun',
        'Judgement', 'The World'
    ];
    return cards[Math.floor(Math.random() * cards.length)];
}

function getDefaultInterpretation(card) {
    return `The ${card.name} in ${card.position} position suggests a time of ${
        card.position === 'upright' ? 'positive' : 'challenging'
    } energy. Consider how this might relate to your question.`;
}

async function getInterpretation(prompt) {
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
        throw new Error('Failed to get interpretation from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
