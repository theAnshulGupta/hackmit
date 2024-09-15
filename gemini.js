const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processVideo(videoPath, textInput) {
  console.log("Processing video:", videoPath);
  
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create the prompt
    const prompt = `${textInput}\nAnalyze this video and give a concise summary of no longer than 40 words.`;
    console.log("Prompt:", prompt);

    // Read the video file
    const videoData = await fs.readFile(videoPath);

    // Generate content
    console.log("Making LLM inference request...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "video/mp4",
          data: videoData.toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const generatedText = response.text();
    console.log("Generated content:", generatedText);

    return generatedText;
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

module.exports = { processVideo };