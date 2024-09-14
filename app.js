const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file upload handling
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
        const generatedText = firstApiResponse.generatedText;

        // 2nd API Call to ChatGPT with the text generated from the first call to get audio
        const secondApiResponse = await makeChatGptApiCallForAudio(generatedText);
        const audioFilePath = `./uploads/${Date.now()}-audio.mp3`;
        fs.writeFileSync(audioFilePath, secondApiResponse.audioData);

        // Send back the audio URL to the frontend
        res.json({ audioUrl: `/uploads/${path.basename(audioFilePath)}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});

// Function to make an API call to ChatGPT (stub for text generation)
async function makeChatGptApiCall(text, videoFilePath) {
    // You will need to replace this with an actual API call to ChatGPT
    // For now, we simulate by returning dummy text
    return { generatedText: "This is a generated response from ChatGPT based on video and text input." };
}

// Function to make an API call to ChatGPT (stub for audio generation)
async function makeChatGptApiCallForAudio(text) {
    // Simulate an API call that returns audio data (you'll implement this)
    return { audioData: Buffer.from('fake_audio_data') }; // Replace with real data
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});