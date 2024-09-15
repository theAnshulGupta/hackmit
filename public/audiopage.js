document.addEventListener("DOMContentLoaded", () => {
    const playPauseBtn = document.getElementById("playPauseBtn");
    const decreaseSpeedBtn = document.getElementById("decreaseSpeedBtn");
    const increaseSpeedBtn = document.getElementById("increaseSpeedBtn");
    const speedMultiplierDisplay = document.getElementById("speedMultiplier");
    const currentTimeSpan = document.getElementById("currentTime");
    const durationTimeSpan = document.getElementById("durationTime");
    const progressBar = document.getElementById("progressBar");
    const progress = document.getElementById("progress");
    const downloadBtn = document.getElementById("downloadBtn");
  
    let playbackRate = 1.0;
    let isPlaying = false;
  
    const audioFilePath = localStorage.getItem("audioFilePath"); // Load the audio file path dynamically
  
    // Check if the audio file is available before loading it into WaveSurfer
    if (audioFilePath) {
      checkAudioAvailability(audioFilePath);
    } else {
      console.error("No audio file available.");
    }
  
    // Function to check if the audio file exists and load it
    function checkAudioAvailability(audioUrl) {
      const maxAttempts = 100;
      let attempts = 0;
  
      const intervalId = setInterval(async () => {
        attempts++;
  
        try {
          const response = await fetch(audioUrl, { method: "HEAD" });
  
          if (response.ok) {
            clearInterval(intervalId);
            setupWaveSurfer(audioUrl); // Pass the audio URL to WaveSurfer
            setupDownload(audioUrl); // Setup the download link for the audio
          }
        } catch (error) {
          console.error("Error checking audio file:", error);
        }
  
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          console.error("Audio file is not available after multiple attempts.");
        }
      }, 1000);
    }
  
    // Function to set up WaveSurfer with dynamic audio URL
    function setupWaveSurfer(audioUrl) {
      var wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#a0c4ff",
        progressColor: "#1DB954",
        cursorColor: "#1DB954",
        barWidth: 2,
        height: 128,
      });
  
      wavesurfer.load(audioUrl); // Load the dynamically retrieved audio file URL
  
      // Play/Pause functionality
      playPauseBtn.addEventListener("click", () => {
        if (isPlaying) {
          wavesurfer.pause();
          playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
          wavesurfer.play();
          playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
      });
  
      // Decrease speed
      decreaseSpeedBtn.addEventListener("click", () => {
        playbackRate = Math.max(0.5, playbackRate - 0.1);
        wavesurfer.setPlaybackRate(playbackRate);
        updateSpeedDisplay();
      });
  
      // Increase speed
      increaseSpeedBtn.addEventListener("click", () => {
        playbackRate = Math.min(2.0, playbackRate + 0.1);
        wavesurfer.setPlaybackRate(playbackRate);
        updateSpeedDisplay();
      });
  
      function updateSpeedDisplay() {
        speedMultiplierDisplay.textContent = playbackRate.toFixed(1) + "x";
      }
  
      // Update progress and time display
      wavesurfer.on("audioprocess", () => {
        const currentTime = wavesurfer.getCurrentTime();
        const duration = wavesurfer.getDuration();
  
        progressBar.max = duration;
        progressBar.value = currentTime;
        progress.style.width = (currentTime / duration) * 100 + "%";
  
        currentTimeSpan.textContent = formatTime(currentTime);
        durationTimeSpan.textContent = formatTime(duration);
      });
  
      // Sync progress bar on seek
      progressBar.addEventListener("input", () => {
        wavesurfer.seekTo(progressBar.value / progressBar.max);
      });
  
      wavesurfer.on("seek", () => {
        const currentTime = wavesurfer.getCurrentTime();
        progressBar.value = currentTime;
        progress.style.width = (currentTime / wavesurfer.getDuration()) * 100 + "%";
      });
  
      function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      }
  
      // Set duration when the audio is ready
      wavesurfer.on("ready", () => {
        durationTimeSpan.textContent = formatTime(wavesurfer.getDuration());
      });
    }
  
    // Function to set up the download link
    function setupDownload(audioUrl) {
      downloadBtn.href = audioUrl; // Set the href to the audio file URL for downloading
      downloadBtn.download = "audio.mp3"; // The file name for the downloaded audio
    }
  });  