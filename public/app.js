document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');

  uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(uploadForm);

      try {
          const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
          });

          if (response.ok) {
              const data = await response.json();
              const audioUrl = data.audioUrl;
              const transcription = data.transcription;
              const description = data.description;

              localStorage.setItem('audioFilePath', audioUrl);
              localStorage.setItem('transcription', transcription);
              localStorage.setItem('description', description);

              window.location.href = 'audiopage.html';
          } else {
              console.error("Failed to upload the video.");
          }
      } catch (error) {
          console.error("Error uploading video:", error);
      }
  });
});

document.getElementById('videoInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const videoPreview = document.getElementById('videoPreview');

  if (file) {
    const videoUrl = URL.createObjectURL(file);
    videoPreview.src = videoUrl;
    videoPreview.style.display = 'block';
  }
});


document.getElementById("uploadForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const spinner = document.getElementById("spinner");
  spinner.style.display = "inline-block";
});
