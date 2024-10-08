const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function mergeTexts(videoText, audioText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Merge the following video and audio descriptions into a concise summary of no more than 40 words:

  Video: ${videoText}
  Audio: ${audioText}`;``

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

async function extractFrames(videoPath, numFrames = 5) {
  const framesDir = path.join(path.dirname(videoPath), 'frames');
  await fs.mkdir(framesDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => resolve(framesDir))
      .on('error', (err) => reject(err))
      .screenshots({
        count: numFrames,
        folder: framesDir,
        filename: 'frame-%i.png'
      });
  });
}

async function processVideo(videoPath, textInput) {
  console.log("Processing video:", videoPath);
  
  try {
    const framesDir = await extractFrames(videoPath);
    const frames = await fs.readdir(framesDir);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${textInput}\nAnalyze these frames from the video and give a concise summary of no longer than 40 words.`;
    console.log("Prompt:", prompt);

    const parts = [prompt];
    for (const frame of frames) {
      const imagePath = path.join(framesDir, frame);
      const imageData = await fs.readFile(imagePath);
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageData.toString('base64')
        }
      });
    }
    
    const result = await model.generateContent(parts);
    const response = await result.response;
    const generatedText = response.text();
    console.log("Generated content:", generatedText);

    for (const frame of frames) {
      await fs.unlink(path.join(framesDir, frame));
    }
    await fs.rmdir(framesDir);

    return generatedText;
  } catch (error) {
    return "Make a song talking about people in a big room working hard and collaborating in an environment that is academic and grand."
  }
}

module.exports = { processVideo, mergeTexts };
