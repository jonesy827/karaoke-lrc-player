import LRCParser from './lrc_parser.js';
import LyricsDisplay from './lyrics_display.js';

// Audio Context and nodes
let audioContext;
let instrumentalNode;
let leadVocalsNode;
let backingVocalsNode;
let instrumentalGain;
let leadVocalsGain;
let backingVocalsGain;
let startTime = 0;
let isPlaying = false;

// Audio buffers
let instrumental;
let leadVocals;
let backingVocals;

// Lyrics handling
let lrcParser;
let lyricsDisplay;
let animationFrame;

// DOM Elements
const songSelect = document.getElementById('song-select');
const lyricsContainer = document.getElementById('lyrics-container');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const instrumentalVolume = document.getElementById('instrumental-volume');
const leadVocalsVolume = document.getElementById('lead-vocals-volume');
const backingVocalsVolume = document.getElementById('backing-vocals-volume');
const progressSlider = document.querySelector('.progress-slider');
const progressBarFill = document.querySelector('.progress-bar-fill');
const currentTimeDisplay = document.querySelector('.current-time');
const totalTimeDisplay = document.querySelector('.total-time');

// Additional state variables
let duration = 0;
let progressUpdateInterval;
let progressAnimationFrame;

// Initialize audio context on user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setupVolumeControls();
    }
}

// Setup volume controls
function setupVolumeControls() {
    instrumentalGain = audioContext.createGain();
    leadVocalsGain = audioContext.createGain();
    backingVocalsGain = audioContext.createGain();

    // Set initial volumes
    instrumentalGain.gain.value = parseFloat(instrumentalVolume.value);
    leadVocalsGain.gain.value = parseFloat(leadVocalsVolume.value);
    backingVocalsGain.gain.value = parseFloat(backingVocalsVolume.value);

    // Connect to destination
    instrumentalGain.connect(audioContext.destination);
    leadVocalsGain.connect(audioContext.destination);
    backingVocalsGain.connect(audioContext.destination);
}

// Load and decode audio file
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Load all audio tracks for a song
async function loadSong(songPath) {
    try {
        initAudioContext();
        
        // Load and store audio buffers
        [instrumental, leadVocals, backingVocals] = await Promise.all([
            loadAudio(`${songPath}/no_vocals.wav`),
            loadAudio(`${songPath}/lead_vocals.wav`),
            loadAudio(`${songPath}/backing_vocals.wav`)
        ]);

        // Set duration based on instrumental track
        duration = instrumental.duration;
        totalTimeDisplay.textContent = formatTime(duration);
        progressSlider.value = 0;
        progressBarFill.style.width = '0%';
        currentTimeDisplay.textContent = '0:00';

        // Create audio buffer source nodes
        instrumentalNode = audioContext.createBufferSource();
        leadVocalsNode = audioContext.createBufferSource();
        backingVocalsNode = audioContext.createBufferSource();

        // Set the audio buffers
        instrumentalNode.buffer = instrumental;
        leadVocalsNode.buffer = leadVocals;
        backingVocalsNode.buffer = backingVocals;

        // Connect nodes to gain nodes
        instrumentalNode.connect(instrumentalGain);
        leadVocalsNode.connect(leadVocalsGain);
        backingVocalsNode.connect(backingVocalsGain);

        // Load and parse lyrics
        const lrcResponse = await fetch(`${songPath}/lyrics.lrc`);
        const lrcText = await lrcResponse.text();
        
        lrcParser = new LRCParser();
        const parsedLyrics = lrcParser.parse(lrcText);
        
        lyricsDisplay = new LyricsDisplay(lyricsContainer);
        lyricsDisplay.render(parsedLyrics);

        return true;
    } catch (error) {
        console.error('Error loading song:', error);
        return false;
    }
}

// Update lyrics display based on current time
function updateLyrics() {
    if (!isPlaying) return;
    
    const currentTime = audioContext.currentTime - startTime;
    const currentWord = lrcParser.getWordAtTime(currentTime);
    
    if (currentWord) {
        lyricsDisplay.highlight(currentWord.lineIndex, currentWord.word, audioContext, startTime);
    }
    
    animationFrame = requestAnimationFrame(updateLyrics);
}

// Play the loaded song
function playSong() {
    if (!instrumental || isPlaying) return;
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    startTime = audioContext.currentTime;
    
    // Create new buffer source nodes
    instrumentalNode = audioContext.createBufferSource();
    leadVocalsNode = audioContext.createBufferSource();
    backingVocalsNode = audioContext.createBufferSource();
    
    // Set the audio buffers
    instrumentalNode.buffer = instrumental;
    leadVocalsNode.buffer = leadVocals;
    backingVocalsNode.buffer = backingVocals;
    
    // Connect nodes to gain nodes
    instrumentalNode.connect(instrumentalGain);
    leadVocalsNode.connect(leadVocalsGain);
    backingVocalsNode.connect(backingVocalsGain);
    
    // Start playback
    instrumentalNode.start(0);
    leadVocalsNode.start(0);
    backingVocalsNode.start(0);
    
    isPlaying = true;
    updateLyrics();
    startProgressUpdate();
}

// Update progress bar and time display
function startProgressUpdate() {
    if (progressAnimationFrame) {
        cancelAnimationFrame(progressAnimationFrame);
    }
    
    function updateProgress() {
        if (!isPlaying) return;
        
        const currentTime = audioContext.currentTime - startTime;
        const progress = (currentTime / duration) * 100;
        
        // Update slider value and progress bar fill
        progressSlider.value = progress;
        progressBarFill.style.width = `${progress}%`;
        progressBarFill.parentElement.style.setProperty('--thumb-position', `${progress}%`);
        currentTimeDisplay.textContent = formatTime(currentTime);
        
        if (currentTime >= duration) {
            stopSong();
            return;
        }
        
        progressAnimationFrame = requestAnimationFrame(updateProgress);
    }
    
    updateProgress();
}

// Format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Handle seeking
function seekTo(percentage) {
    if (!instrumental) return;
    
    const newTime = (percentage / 100) * duration;
    
    if (isPlaying) {
        // Stop current playback
        instrumentalNode.stop();
        leadVocalsNode.stop();
        backingVocalsNode.stop();
        
        // Create and start new nodes at the seek position
        instrumentalNode = audioContext.createBufferSource();
        leadVocalsNode = audioContext.createBufferSource();
        backingVocalsNode = audioContext.createBufferSource();
        
        instrumentalNode.buffer = instrumental;
        leadVocalsNode.buffer = leadVocals;
        backingVocalsNode.buffer = backingVocals;
        
        instrumentalNode.connect(instrumentalGain);
        leadVocalsNode.connect(leadVocalsGain);
        backingVocalsNode.connect(backingVocalsGain);
        
        startTime = audioContext.currentTime - newTime;
        
        instrumentalNode.start(0, newTime);
        leadVocalsNode.start(0, newTime);
        backingVocalsNode.start(0, newTime);
    } else {
        startTime = audioContext.currentTime - newTime;
    }
    
    // Update displays
    currentTimeDisplay.textContent = formatTime(newTime);
    progressBarFill.style.width = `${percentage}%`;
    progressBarFill.parentElement.style.setProperty('--thumb-position', `${percentage}%`);
}

// Pause playback
function pauseSong() {
    if (!isPlaying) return;
    audioContext.suspend();
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(progressAnimationFrame);
    isPlaying = false;
}

// Stop playback
function stopSong() {
    if (!isPlaying) return;
    
    audioContext.suspend().then(() => {
        // Clean up existing nodes
        instrumentalNode.stop();
        leadVocalsNode.stop();
        backingVocalsNode.stop();
        
        instrumentalNode.disconnect();
        leadVocalsNode.disconnect();
        backingVocalsNode.disconnect();
        
        // Reset state
        isPlaying = false;
        startTime = 0;
        cancelAnimationFrame(animationFrame);
        cancelAnimationFrame(progressAnimationFrame);
        lyricsDisplay.reset();
        
        // Reset progress displays
        progressSlider.value = 0;
        progressBarFill.style.width = '0%';
        currentTimeDisplay.textContent = '0:00';
        
        // Reload the song
        loadSong(songSelect.value);
    });
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (audioContext?.state === 'suspended') {
        audioContext.resume();
        isPlaying = true;
        updateLyrics();
    } else {
        playSong();
    }
});

pauseBtn.addEventListener('click', pauseSong);
stopBtn.addEventListener('click', stopSong);

// Volume control event listeners
instrumentalVolume.addEventListener('input', (e) => {
    if (instrumentalGain) {
        instrumentalGain.gain.value = parseFloat(e.target.value);
    }
});

leadVocalsVolume.addEventListener('input', (e) => {
    if (leadVocalsGain) {
        leadVocalsGain.gain.value = parseFloat(e.target.value);
    }
});

backingVocalsVolume.addEventListener('input', (e) => {
    if (backingVocalsGain) {
        backingVocalsGain.gain.value = parseFloat(e.target.value);
    }
});

// Add progress slider event listener
progressSlider.addEventListener('input', (e) => {
    const percentage = parseFloat(e.target.value);
    seekTo(percentage);
});

// Add progress slider hover effect
progressSlider.addEventListener('mouseover', () => {
    progressBarFill.parentElement.classList.add('hover');
});

progressSlider.addEventListener('mouseout', () => {
    progressBarFill.parentElement.classList.remove('hover');
});

// Load available songs
async function loadAvailableSongs() {
    try {
        const response = await fetch('/songs');
        const data = await response.json();
        
        songSelect.innerHTML = '<option value="">Select a song...</option>';
        data.forEach(song => {
            const option = document.createElement('option');
            option.value = `songs/${song}`;
            option.textContent = song.replace(/-/g, ' ');
            songSelect.appendChild(option);
        });
        
        songSelect.addEventListener('change', async () => {
            if (songSelect.value) {
                await loadSong(songSelect.value);
            }
        });
    } catch (error) {
        console.error('Error loading song list:', error);
        lyricsContainer.innerHTML = '<em>Error loading song list. Please check the console for details.</em>';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableSongs();
}); 