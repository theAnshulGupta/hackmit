require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateAudio } = require('./audioGeneration');
const fetch = require('node-fetch'); // Use node-fetch for making HTTP requests
const base64 = require('base-64'); // For base64 encoding (if needed)

const app = express();
const port = 3005;

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/upload', upload.single('videoInput'), async (req, res) => {
    const { textInput } = req.body;
    const videoFilePath = req.file.path;

    try {
        // 1st API Call to ChatGPT with the text and video file
        const firstApiResponse = await makeChatGptApiCall(textInput, videoFilePath);
        let generatedText = firstApiResponse.generatedText;

        // 2nd API Call to Base10 (Whisper AI) with the video file
        const base10ResponseText = await makeBase10WhisperAICall(videoFilePath);
        generatedText += base10ResponseText; // Append the transcription from Whisper AI

        // Generate the audio based on the generated text
        const cdnLink = await generateAudio(generatedText);

        // Respond to the frontend with the audio URL
        res.json({ audioUrl: cdnLink });
    } catch (error) {
        console.error("Error in /api/upload:", error);
        res.status(500).json({ error: error.message || 'Failed to process the request' });
    }
});

// Function to make an API call to ChatGPT (stub for text generation)
async function makeChatGptApiCall(text, videoFilePath) {
    // Simulated API call response
    return {
        generatedText: "The piece starts with a majestic sunrise over a vast, rocky landscape, evoking a sense of awe and wonder."
    };
}

// Function to make the Base10 Whisper AI call
async function makeBase10WhisperAICall(videoFilePath) {
    try {
        // Read the video file, encode it to base64
        const audioBase64 = base64.encode(fs.readFileSync(videoFilePath).toString('base64'));

        // Make the POST request to the Base10 Whisper AI API
        const resp = await fetch('https://model-7qkpp9dw.api.baseten.co/development/predict', {
            method: 'POST',
            headers: {
                Authorization: 'Api-Key 7b7Gya44.tdNdHgu8NH4CsC0ZfjmKftR5sDNi34m0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "audio": audioBase64 })
        });

        // Check for successful response
        if (!resp.ok) {
            throw new Error(`Base10 Whisper AI API request failed with status ${resp.status}`);
        }

        // Parse the response as JSON
        const data = await resp.json();

        // Return the transcription text from the response
        return data.text || ''; // Assuming `text` field contains the transcription
    } catch (error) {
        console.error('Error in makeBase10WhisperAICall:', error);
        throw error;
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
