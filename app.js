require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateAudio } = require('./audioGeneration');

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
        const generatedText = firstApiResponse.generatedText;

        const cdnLink = await generateAudio(generatedText);
        // const audioFilePath = `./uploads/${Date.now()}-audio.mp3`;
        // fs.writeFileSync(audioFilePath, audioData);

        // // Send back the audio URL to the frontend
        // res.json({ audioUrl: `/uploads/${path.basename(audioFilePath)}` });
    } catch (error) {
        console.error("Error in /api/upload:", error);
        res.status(500).json({ error: error.message || 'Failed to process the request' });
    }
});

// Function to make an API call to ChatGPT (stub for text generation)
async function makeChatGptApiCall(text, videoFilePath) {
    // You will need to replace this with an actual API call to ChatGPT
    // For now, we simulate by returning dummy text
    return { generatedText: "The piece starts with a majestic sunrise over a vast, rocky landscape, evoking a sense of awe and wonder. It then transitions to a serene forest path bathed in golden light, inviting a feeling of peaceful exploration." };
}
//  We start with a quick coffee stop, where everyone shares their game plan for the day, from Canaan’s mission to find new kicks to Rich's hunt for the latest tech gadgets. The group checks out some stores, cracking jokes and showing off some hilarious (and questionable) outfit choices. Anshul gets distracted by a random arcade, and we all jump into a spontaneous gaming session. The day wraps up with some good food at the food court and a quick recap of the best moments. Overall, just a chill day hanging out and making memories!
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});