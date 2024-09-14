// import { GoogleGenerativeAI } from "@google/generative-ai";

// async function generateStory() {
//     const genAI = new GoogleGenerativeAI("AIzaSyDhD-bG1Rk9fKv1jr30qlVSZcp3Y_Dgtdg");
//     const model = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//     const prompt = "Write a story about a magic backpack.";
//     const result = await model.generateContent({ prompt });

//     console.log(result.response.text);
// }

// generateStory().catch(console.error);

/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }
  
  /**
   * Waits for the given files to be active.
   *
   * Some files uploaded to the Gemini API need to be processed before they can
   * be used as prompt inputs. The status can be seen by querying the file's
   * "state" field.
   *
   * This implementation uses a simple blocking polling loop. Production code
   * should probably employ a more sophisticated approach.
   */
  async function waitForFilesActive(files) {
    console.log("Waiting for file processing...");
    for (const name of files.map((file) => file.name)) {
      let file = await fileManager.getFile(name);
      while (file.state === "PROCESSING") {
        process.stdout.write(".")
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(name)
      }
      if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`);
      }
    }
    console.log("...all files ready\n");
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run() {
    // TODO Make these files available on the local file system
    // You may need to update the file paths
    const files = [
      await uploadToGemini("nature.mp4", "video/mp4"),
    ];
  
    // Some files have a processing delay. Wait for them to be ready.
    await waitForFilesActive(files);
  
    const chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: files[0].mimeType,
                fileUri: files[0].uri,
              },
            },
          ],
        },
        {
          role: "user",
          parts: [
            {text: "You are an AI agent that determines the artistic environment and atmosphere of videos and converts them into text summaries. Keep in mind that these text summaries are later used as descriptors of a musical piece, so make them more abstract and creative.\n\nWith this information, please analyze the provided video file and write a brief description for it that would be used to make a musical piece, focusing on describing the environment it is in."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The piece starts with a majestic sunrise over a vast, rocky landscape, evoking a sense of awe and wonder. It then transitions to a serene forest path bathed in golden light, inviting a feeling of peaceful exploration. The music then shifts to a lush, green forest, where rays of sunlight pierce through the canopy, creating a mystical and ethereal atmosphere. Finally, the piece culminates in a breathtaking waterfall cascading down a verdant canyon, conveying a sense of power and tranquility. \n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "What is the audio in the video? Is there any dialogue"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "You are correct! There is no dialogue in the video. The audio is a royalty-free music track. 🎶 \n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    console.log(result.response.text());
  }
  
  run();