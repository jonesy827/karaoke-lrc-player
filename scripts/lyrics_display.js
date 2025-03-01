class LyricsDisplay {
    constructor(container) {
        this.container = container;
        this.currentScreenIndex = -1;
        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
        this.screenManager = null;
    }

    // Create DOM elements for lyrics display
    render(screenManager) {
        this.screenManager = screenManager;
        this.container.innerHTML = '';
        this.currentScreenIndex = -1;
        
        // Remove any existing transform
        this.container.style.removeProperty('transform');
        
        // Add base styles if not present
        if (!document.getElementById('lyrics-base-styles')) {
            const baseStyles = document.createElement('style');
            baseStyles.id = 'lyrics-base-styles';
            baseStyles.textContent = `
                :root {
                    --text-color-rgb: 255, 255, 255;  /* White text in RGB format */
                }
            `;
            document.head.appendChild(baseStyles);
        }

        // Create screen container
        this.screenContainer = document.createElement('div');
        this.screenContainer.className = 'screen-container';
        this.container.appendChild(this.screenContainer);

        // Add styles if not already present
        if (!document.getElementById('lyrics-display-styles')) {
            const styles = document.createElement('style');
            styles.id = 'lyrics-display-styles';
            styles.textContent = `
                .screen-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .lyrics-screen {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                }

                .lyrics-screen.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                .lyrics-line {
                    margin: 0.5em 0;
                    opacity: 0.6;
                    transition: all 0.3s ease;
                    line-height: 1.6;
                    text-align: center;
                }

                .lyrics-line.active {
                    opacity: 1;
                    color: var(--text-color);
                }

                .lyrics-word {
                    display: inline-block;
                    padding: 0.1em 0.2em;
                    position: relative;
                    color: var(--text-color);
                }

                .lyrics-word::before {
                    content: attr(data-text);
                    position: absolute;
                    left: 0;
                    top: 0;
                    padding: 0.1em 0.2em;
                    color: var(--highlight-color);
                    clip-path: inset(0 100% 0 0);
                    pointer-events: none;
                    white-space: nowrap;
                }

                .lyrics-word.past::before {
                    clip-path: inset(0 0 0 0);
                }

                .lyrics-word.active::before {
                    animation: word-highlight var(--word-duration, 0.5s) linear forwards;
                }

                @keyframes word-highlight {
                    from { clip-path: inset(0 100% 0 0); }
                    to { clip-path: inset(0 0 0 0); }
                }

                .instrumental-break {
                    font-style: italic;
                    color: var(--highlight-color);
                    text-align: center;
                    padding: 1em 0;
                    opacity: 0.8;
                    position: relative;
                }

                .instrumental-break.active {
                    animation: pulse-glow 2s infinite;
                }

                .instrumental-progress {
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .instrumental-progress::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: var(--progress, 0%);
                    background: var(--highlight-color);
                    transition: width 0.1s linear;
                }

                @keyframes pulse-glow {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Show initial screen
        const initialState = this.screenManager.getScreenAtTime(0);
        if (initialState) {
            const screenElement = this.createScreenElement(initialState.screen);
            this.screenContainer.appendChild(screenElement);
            screenElement.classList.add('active');
            this.currentScreenIndex = initialState.screenIndex;
        }
    }

    // Create a screen element
    createScreenElement(screen) {
        const screenElement = document.createElement('div');
        screenElement.className = 'lyrics-screen';

        screen.lines.forEach((line, lineIndex) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'lyrics-line';
            
            if (line.rawText.includes('♪') || line.rawText.includes('INSTRUMENTAL')) {
                lineElement.className = 'lyrics-line instrumental-break';
                lineElement.innerHTML = '♪ Instrumental Break ♪';
                
                const progressBar = document.createElement('div');
                progressBar.className = 'instrumental-progress';
                lineElement.appendChild(progressBar);
            } else {
                const words = line.words.map((word, wordIndex) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = word.text;
                    wordSpan.setAttribute('data-text', word.text);
                    wordSpan.className = 'lyrics-word';
                    wordSpan.dataset.lineIndex = lineIndex;
                    wordSpan.dataset.wordIndex = wordIndex;
                    wordSpan.dataset.timestamp = word.timestamp; // Add timestamp
                    return wordSpan;
                });

                words.forEach((word, idx) => {
                    if (idx > 0) {
                        lineElement.appendChild(document.createTextNode(' '));
                    }
                    lineElement.appendChild(word);
                });
            }

            screenElement.appendChild(lineElement);
        });

        return screenElement;
    }

    // Update display based on current time
    update(time) {
        if (!this.screenManager) return;

        const currentState = this.screenManager.getScreenAtTime(time);
        if (!currentState) return;

        const { screen, screenIndex, currentLineIndex, currentWord } = currentState;

        // Handle screen transitions
        if (this.currentScreenIndex !== screenIndex) {
            // Remove old screen
            const oldScreen = this.screenContainer.querySelector('.lyrics-screen.active');
            if (oldScreen) {
                oldScreen.classList.remove('active');
                setTimeout(() => oldScreen.remove(), 500);
            }

            // Create and add new screen
            const screenElement = this.createScreenElement(screen);
            this.screenContainer.appendChild(screenElement);
            
            // Force reflow
            void screenElement.offsetWidth;
            
            // Make new screen visible
            screenElement.classList.add('active');
            
            this.currentScreenIndex = screenIndex;
            this.currentLineIndex = -1;
            this.currentWordIndex = -1;
        }

        const screenElement = this.screenContainer.querySelector('.lyrics-screen.active');
        if (!screenElement) return;

        // Update line highlighting
        if (this.currentLineIndex !== currentLineIndex) {
            const lines = screenElement.querySelectorAll('.lyrics-line');
            lines.forEach((line, idx) => {
                if (idx === currentLineIndex) {
                    line.classList.add('active');
                } else {
                    line.classList.remove('active');
                }
            });
            this.currentLineIndex = currentLineIndex;
        }

        // Update word highlighting
        if (currentWord && (this.currentWordIndex !== currentWord.index || this.currentLineIndex !== currentLineIndex)) {
            const words = screenElement.querySelectorAll('.lyrics-word');
            words.forEach(word => {
                const lineIdx = parseInt(word.dataset.lineIndex);
                const wordIdx = parseInt(word.dataset.wordIndex);
                
                if (lineIdx === currentLineIndex && wordIdx === currentWord.index) {
                    word.classList.add('active');
                    if (currentWord.duration) {
                        word.style.setProperty('--word-duration', `${currentWord.duration}s`);
                    }
                } else {
                    word.classList.remove('active');
                }
            });
            this.currentWordIndex = currentWord.index;
        }

        // Update word highlighting and past words
        const words = screenElement.querySelectorAll('.lyrics-word');
        words.forEach(word => {
            const wordTimestamp = parseFloat(word.dataset.timestamp);
            word.classList.toggle('past', wordTimestamp <= time);
        });

        // Update instrumental progress if needed
        if (screen.isInstrumental) {
            const progressBar = screenElement.querySelector('.instrumental-progress');
            if (progressBar) {
                progressBar.style.setProperty('--progress', `${currentState.progress * 100}%`);
            }
        }
    }

    // Reset display state
    reset() {
        this.container.innerHTML = '';
        this.currentScreenIndex = -1;
        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
        if (this.screenManager) {
            this.render(this.screenManager);
        }
    }
}

export default LyricsDisplay;
