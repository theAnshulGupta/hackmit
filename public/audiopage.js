document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const loadingMessage = document.getElementById("loadingMessage");
    const geminiMessage = document.getElementById("geminiMessage");
    const transcriptionMessage = document.getElementById("transcriptionMessage");

    const audioFilePath = localStorage.getItem("audioFilePath");
    const transcription = localStorage.getItem("transcription");
    const description = localStorage.getItem("description");

    if (description) {
        geminiMessage.textContent = "Gemini processing complete: " + description;
    }

    if (transcription) {
        transcriptionMessage.textContent = "Transcription complete: " + transcription;
    }

    if (audioFilePath) {
        checkAudioAvailability(audioFilePath);
    } else {
        loadingMessage.textContent = "No audio file available";
    }

    function checkAudioAvailability(audioUrl) {
        const maxAttempts = 100;
        let attempts = 0;

        const intervalId = setInterval(async () => {
            attempts++;

            try {
                const response = await fetch(audioUrl, {
                    method: 'HEAD'
                });

                if (response.ok) {
                    clearInterval(intervalId);
                    audioPlayer.src = audioUrl;
                    audioPlayer.style.display = 'block';
                    loadingMessage.style.display = 'none';
                    geminiMessage.textContent = "Audio file ready!";
                }
            } catch (error) {
                console.error("Error checking audio file:", error);
            }

            if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                loadingMessage.textContent = "Audio file is not available after multiple attempts.";
            }
        }, 1000);
    }
});
