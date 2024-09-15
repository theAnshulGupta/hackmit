const fetch = require('node-fetch');

async function generateAudio(text) {
    console.log("Generating audio for text:", text);
    try {
        const response = await fetch("https://studio-api.suno.ai/api/external/generate/", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${process.env.SUNO_API_KEY}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                topic: text,
                tags: "rap"
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API response not OK. Status: ${response.status}, Body: ${errorBody}`);
            throw new Error(`Failed to generate audio. Status: ${response.status}`);
        }

        const data = await response.json();
        const song_uuid = data["id"];
        const cdn_link = "https://cdn1.suno.ai/" + song_uuid + ".mp3";
        
        return cdn_link;
    } catch (error) {
        console.error("Error in generateAudio:", error);
        throw error;
    }
}

module.exports = { generateAudio };
