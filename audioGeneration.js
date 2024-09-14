const fetch = require('node-fetch');

async function generateAudio(text) {
    const description_prompt = `rap song in a male voice that describe this event: ${text}`
    console.log("Generating audio for text:", text);
    try {
        console.log("api key:", process.env.SUNO_API_KEY)
        const response = await fetch("https://studio-api.suno.ai/api/external/generate/", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${process.env.SUNO_API_KEY}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                topic: description_prompt,
                tags: "rap"
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API response not OK. Status: ${response.status}, Body: ${errorBody}`);
            throw new Error(`Failed to generate audio. Status: ${response.status}`);
        }

        const data = await response.json();
        song_uuid = data["id"]
        cdn_link = "https://cdn2.suno.ai/image_" + song_uuid + ".jpeg?width=100"

        return cdn_link
        
    } catch (error) {
        console.error("Error in generateAudio:", error);
        throw error;
    }
}

module.exports = { generateAudio };