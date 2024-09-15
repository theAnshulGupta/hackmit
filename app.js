require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateAudio } = require('./audioGeneration');
const { processVideo } = require('./gemini');
const fetch = require('node-fetch'); 
const ffmpeg = require('fluent-ffmpeg'); 

const app = express();
const port = 3004;

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('videoInput'), async (req, res) => {
    const { textInput } = req.body;
    const videoFilePath = req.file.path;

    try {
        const generatedText = await processVideo(videoFilePath, textInput);
        const base10ResponseText = await makeBase10WhisperAICall(videoFilePath);
        
        const cdnLink = await generateAudio(generatedText);
        
        res.json({
            audioUrl: cdnLink,
            transcription: base10ResponseText,
            description: generatedText
        });
    } catch (error) {
        console.error("Error in /api/upload:", error);
        res.status(500).json({ error: error.message || 'Failed to process the request' });
    }
});

async function makeBase10WhisperAICall(videoFilePath) {
    try {
        const audioFilePath = await extractAudioFromVideo(videoFilePath);
        const audioBase64 = fs.readFileSync(audioFilePath).toString('base64');  
        const resp = await fetch('https://model-7qkpp9dw.api.baseten.co/development/predict', {
            method: 'POST',
            headers: {
                Authorization: 'Api-Key 7b7Gya44.tdNdHgu8NH4CsC0ZfjmKftR5sDNi34m0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "audio": audioBase64 })
        });

        if (!resp.ok) {
            throw new Error(`Base10 Whisper AI API request failed with status ${resp.status}`);
        }

        const data = await resp.json();
        return data.text || ''; 
    } catch (error) {
        console.error('Error in makeBase10WhisperAICall:', error);
        throw error;
    }
}

function extractAudioFromVideo(videoFilePath) {
    return new Promise((resolve, reject) => {
        const audioFilePath = videoFilePath.replace(path.extname(videoFilePath), '.mp3');

        ffmpeg(videoFilePath)
            .output(audioFilePath)
            .on('end', () => {
                console.log(`Audio extracted to ${audioFilePath}`);
                resolve(audioFilePath);
            })
            .on('error', (err) => {
                console.error('Error extracting audio:', err);
                reject(err);
            })
            .run();
    });
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
