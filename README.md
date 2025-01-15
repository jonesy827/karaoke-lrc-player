# Karaoke LRC Player

A web-based karaoke player that supports word-level lyrics highlighting and multiple audio track mixing. Built with the Web Audio API for perfect synchronization between audio and lyrics.

## Features

- Multi-track audio playback (instrumental, lead vocals, backing vocals)
- Word-level lyrics highlighting synchronized with audio
- Individual volume controls for each audio track
- Screen-based lyrics display with smooth transitions
- Support for enhanced LRC format with word-level timestamps

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

## Technologies Used

- Web Audio API for precise audio synchronization
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