document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const videoInput = document.getElementById('videoInput');
    const audioPlayer = document.getElementById('audioPlayer');
  
    // Handle video preview
    videoInput.addEventListener('change', handleVideoPreview);
  
    function handleVideoPreview(event) {
      const existingPreview = document.getElementById('videoPreview');
      if (existingPreview) {
        existingPreview.remove();
      }
  
      const file = event.target.files[0];
      if (file && file.type.startsWith('video/')) {
        const videoPreview = document.createElement('video');
        videoPreview.setAttribute('controls', 'controls');
        videoPreview.setAttribute('width', '400px');
        videoPreview.setAttribute('id', 'videoPreview');
        videoPreview.src = URL.createObjectURL(file);
  
        videoInput.parentNode.insertBefore(videoPreview, videoInput.nextSibling);
      }
    }
  
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      // Optionally, generate or handle the audio file here
      // For demonstration purposes, we'll assume an audio file is generated
      const audioFilePath = 'your-audio-file.mp3'; // Update this with the actual path
  
      // Store the audio file path in local storage (or use other methods as needed)
      localStorage.setItem('audioFilePath', audioFilePath);
  
      // Redirect to the new page
      window.location.href = 'audioPage.html';
    });
  });
  
