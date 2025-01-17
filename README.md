# Karaoke LRC Player

A web-based karaoke player that supports word-level lyrics highlighting and multiple audio track mixing. Built with the Web Audio API for perfect synchronization between audio and lyrics.

## Features

- Multi-track audio playback (instrumental, lead vocals, backing vocals)
- Word-level lyrics highlighting synchronized with audio
- Individual volume controls for each audio track
- Screen-based lyrics display with smooth transitions
- Support for enhanced LRC format with word-level timestamps
- Sound-reactive background visualizations with multiple styles

## Getting Started

### Prerequisites

- Python 3.x (for the local development server)
- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/karaoke-lrc-player.git
cd karaoke-lrc-player
```

2. Start the local development server:
```bash
python serve.py
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## Song Format

Place your songs in the `songs/` directory with the following structure:

```
songs/
└── Your Song Name/
    ├── lyrics.lrc      # Enhanced LRC file with word-level timestamps
    ├── no_vocals.wav   # Instrumental track
    ├── lead_vocals.wav # Lead vocals track
    └── backing_vocals.wav (optional)
```

### LRC File Format

The player supports enhanced LRC files with word-level timestamps. Each line starts with a line timestamp, followed by individual word timestamps:

```
[00:01.00] <00:01.00>Hello <00:01.50>world
[00:02.50] <00:02.50>This <00:03.00>is <00:03.25>Karaoke!
```

## Display System

The player uses a screen-based display system that:
- Shows lyrics in full-screen pages
- Automatically splits content into screens based on natural breaks and line count
- Handles instrumental breaks as dedicated screens with progress indicators
- Maintains word-level highlighting with accurate timing
- Smoothly transitions between screens

## Usage

1. Select a song from the dropdown menu
2. Use the play/pause button to control playback
3. Adjust volume levels for each track using the sliders
   - Lead vocals are muted by default
   - Backing vocals slider only appears if the track exists
4. Use the progress bar to seek within the song
5. Switch between different visualization styles using the style selector

### Visualization Styles

The player includes several sound-reactive background visualizations that respond to the music in real-time. Each style can be previewed in the control panel before selection:

1. **Frequency Waves**: Dynamic waves that pulse with the music frequency, creating smooth flowing patterns
2. **Particle Field**: Interactive particles that respond to audio intensity, forming organic flowing patterns
3. **Color Pulse**: Pulsating colors that react to the music's rhythm and energy
4. **Spectrum Bars**: Classic spectrum analyzer with responsive bars showing frequency distribution
5. **Aurora**: Ethereal aurora-like waves that dance to the music
6. **Nebula**: Cosmic nebula clouds that pulse and swirl with the music, creating a space-like atmosphere
7. **Circuit Flow**: Cyberpunk-inspired network of nodes with data pulses flowing to the beat

Features of the visualization system:
- Real-time audio analysis using Web Audio API's analyzer nodes
- Multiple frequency band analysis for detailed audio response
- Live preview of each style in the control panel
- Smooth transitions between styles
- Responsive design that adapts to any screen size
- Bass-reactive effects for enhanced visual impact
- GPU-accelerated rendering for smooth performance

Each visualization style analyzes both overall frequency data and specific bass frequencies to create dynamic, music-driven backgrounds that enhance the karaoke experience. The visualization controls include:
- Style selection dropdown with live previews
- Descriptive text explaining each style's characteristics
- Automatic resizing and performance optimization
- Seamless integration with the audio mixing system

## Technologies Used

- Web Audio API for precise audio synchronization and visualization analysis
- Canvas API for real-time background animations
- ES6 Modules for code organization
- Vanilla JavaScript, HTML, and CSS
- Python for local development server

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 