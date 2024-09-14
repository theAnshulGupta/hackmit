document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('textInput', document.getElementById('textInput').value);
    formData.append('videoInput', document.getElementById('videoInput').files[0]);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.audioUrl) {
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = data.audioUrl;
            audioPlayer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});