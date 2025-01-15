class LyricsDisplay {
    constructor(container) {
        this.container = container;
        this.lines = [];
        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
        this.calculateVisibleLines();
        // Recalculate visible lines on resize
        window.addEventListener('resize', () => this.calculateVisibleLines());
    }

    calculateVisibleLines() {
        // Calculate based on viewport height and line height
        const viewportHeight = window.innerHeight;
        const lineHeight = 1.6; // matches CSS line-height
        const fontSize = Math.min(viewportHeight * 0.05, 32); // matches CSS font-size calculation
        const effectiveLineHeight = fontSize * lineHeight;
        // Account for padding and margins
        const availableHeight = viewportHeight - 100; // subtract control panel height and padding
        this.visibleLines = Math.floor(availableHeight / effectiveLineHeight);
        // Keep it reasonable (minimum 2, maximum 5)
        this.visibleLines = Math.max(2, Math.min(5, this.visibleLines));
    }

    // Create DOM elements for lyrics display
    render(parsedLyrics) {
        this.container.innerHTML = '';
        this.lines = [];
        let currentGroup = null;
        let currentGroupElement = null;

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

        parsedLyrics.forEach((line, lineIndex) => {
            // Check if this is an instrumental break
            const isInstrumental = line.rawText.includes('♪') || line.rawText.includes('INSTRUMENTAL');
            
            if (isInstrumental) {
                // Create a special instrumental break display
                const breakElement = document.createElement('div');
                breakElement.className = 'lyrics-line instrumental-break';
                breakElement.innerHTML = '♪ Instrumental Break ♪';
                
                // Add progress bar
                const progressBar = document.createElement('div');
                progressBar.className = 'instrumental-progress';
                breakElement.appendChild(progressBar);
                
                this.container.appendChild(breakElement);
                this.lines.push({
                    element: breakElement,
                    words: [],
                    isInstrumental: true,
                    duration: this.getInstrumentalDuration(lineIndex, parsedLyrics)
                });
                return;
            }

            // Check if we need to start a new group (based on empty lines or verse markers)
            const isNewGroup = line.rawText.trim() === '' || 
                             (lineIndex > 0 && parsedLyrics[lineIndex - 1].rawText.trim() === '');

            if (isNewGroup || !currentGroupElement) {
                currentGroup = [];
                currentGroupElement = document.createElement('div');
                currentGroupElement.className = 'lyrics-group';
                this.container.appendChild(currentGroupElement);
            }

            const lineElement = document.createElement('div');
            lineElement.className = 'lyrics-line';
            
            const words = line.words.map((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word.text;
                wordSpan.setAttribute('data-text', word.text);
                wordSpan.className = 'lyrics-word';
                wordSpan.dataset.lineIndex = lineIndex;
                wordSpan.dataset.wordIndex = wordIndex;
                return wordSpan;
            });

            // Add spaces between words
            words.forEach((word, idx) => {
                if (idx > 0) {
                    lineElement.appendChild(document.createTextNode(' '));
                }
                lineElement.appendChild(word);
            });

            currentGroupElement.appendChild(lineElement);
            currentGroup.push({
                element: lineElement,
                words: words
            });
            this.lines.push(currentGroup[currentGroup.length - 1]);
        });

        // Add styles if not already present
        if (!document.getElementById('lyrics-display-styles')) {
            const styles = document.createElement('style');
            styles.id = 'lyrics-display-styles';
            styles.textContent = `
                .lyrics-group {
                    margin: 1em 0;
                    transition: all 0.5s ease;
                    width: 100%;
                }
                .lyrics-line {
                    margin: 0.5em 0;
                    opacity: 0.6;
                    transition: all 0.3s ease;
                    line-height: 1.6;
                }
                .lyrics-line.active {
                    opacity: 1;
                    transform: scale(1.05);
                    color: var(--text-color);
                }
                .lyrics-word {
                    display: inline-block;
                    padding: 0.1em 0.2em;
                    border-radius: 4px;
                    transition: transform 0.2s ease;
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
                }
                .lyrics-word.active {
                    transform: scale(1.1);
                }
                .lyrics-word.active::before {
                    clip-path: inset(0 0 0 0);
                    transition: clip-path var(--word-duration, 0.5s) linear;
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
                .upcoming-lyrics {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.5s ease;
                }
                .upcoming-lyrics.visible {
                    opacity: 0.8;
                    transform: translateY(0);
                }
                @keyframes pulse-glow {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Get duration of instrumental section
    getInstrumentalDuration(lineIndex, parsedLyrics) {
        const currentLine = parsedLyrics[lineIndex];
        const nextLine = parsedLyrics[lineIndex + 1];
        if (nextLine) {
            return nextLine.lineTimestamp - currentLine.lineTimestamp;
        }
        return 5; // Default duration if it's the last line
    }

    // Highlight the current word and line, managing visible lines
    highlight(lineIndex, word, audioContext, startTime) {
        // Remove previous highlights only if changing lines or entering/leaving instrumental
        if (this.currentLineIndex !== -1 && 
            (this.currentLineIndex !== lineIndex || 
             this.lines[lineIndex]?.isInstrumental !== this.lines[this.currentLineIndex]?.isInstrumental)) {
            const prevLine = this.lines[this.currentLineIndex];
            if (prevLine) {
                prevLine.element.classList.remove('active');
                if (!prevLine.isInstrumental) {
                    prevLine.words.forEach(wordElem => {
                        wordElem.classList.remove('active');
                        wordElem.style.removeProperty('--word-duration');
                    });
                }
            }
        }

        // Add new highlights
        if (lineIndex !== -1) {
            const currentLine = this.lines[lineIndex];
            if (!currentLine) return;

            // Handle instrumental breaks
            if (currentLine.isInstrumental) {
                // Clear any previous word highlights and hide other lyrics
                this.lines.forEach((line, idx) => {
                    if (!line.isInstrumental) {
                        line.element.style.display = 'none';
                    }
                });

                // Show and highlight the instrumental break
                currentLine.element.classList.add('active');
                
                // Update progress bar
                const progressBar = currentLine.element.querySelector('.instrumental-progress');
                if (progressBar && currentLine.duration) {
                    const elapsed = audioContext.currentTime - startTime - word.timestamp;
                    const progress = Math.min(100, (elapsed / currentLine.duration) * 100);
                    progressBar.style.setProperty('--progress', `${progress}%`);
                    
                    // Show next lyrics a few seconds early
                    if (progress > 80 && this.lines[lineIndex + 1]) {
                        this.lines[lineIndex + 1].element.style.display = 'block';
                        this.lines[lineIndex + 1].element.classList.add('upcoming-lyrics', 'visible');
                    }
                }

                this.currentLineIndex = lineIndex;
                this.currentWordIndex = -1;
                return;
            }

            // Regular lyrics line
            if (word && typeof word.index === 'number') {
                const wordIndex = word.index;
                
                if (wordIndex >= 0 && wordIndex < currentLine.words.length) {
                    currentLine.element.classList.add('active');
                    
                    // Remove highlight from previous word instantly
                    if (this.currentWordIndex !== -1 && this.currentWordIndex !== wordIndex) {
                        const prevWord = currentLine.words[this.currentWordIndex];
                        if (prevWord) {
                            prevWord.classList.remove('active');
                        }
                    }
                    
                    const wordElement = currentLine.words[wordIndex];
                    
                    // Set the duration based on time until next word
                    if (word.duration) {
                        console.log(`Setting duration for word "${word.text}": ${word.duration}s`);
                        wordElement.style.setProperty('--word-duration', `${word.duration}s`);
                    }
                    
                    // Add active class to trigger the width transition
                    wordElement.classList.add('active');
                    
                    // Force a reflow to ensure transition starts from the beginning
                    void wordElement.offsetWidth;
                    
                    // Calculate visible range
                    const startLine = Math.max(0, lineIndex - Math.floor((this.visibleLines - 1) / 2));
                    const endLine = Math.min(this.lines.length - 1, startLine + this.visibleLines - 1);
                    
                    // Hide/show lines based on visibility range
                    this.lines.forEach((line, idx) => {
                        if (idx < startLine || idx > endLine) {
                            line.element.style.display = 'none';
                        } else {
                            line.element.style.display = 'block';
                            // Adjust opacity based on distance from current line
                            const distance = Math.abs(idx - lineIndex);
                            line.element.style.opacity = Math.max(0.3, 1 - (distance * 0.25));
                        }
                    });

                    // Center the current line by adjusting container transform
                    const totalLines = endLine - startLine + 1;
                    const currentLinePosition = lineIndex - startLine;
                    const offset = (currentLinePosition / (totalLines - 1)) - 0.5;
                    const translateY = -offset * 100;
                    this.container.style.transform = `translateY(${translateY}%)`;

                    this.currentLineIndex = lineIndex;
                    this.currentWordIndex = wordIndex;
                }
            }
        }
    }

    // Reset all highlights and display
    reset() {
        if (this.currentLineIndex !== -1) {
            const currentLine = this.lines[this.currentLineIndex];
            if (currentLine) {
                currentLine.element.classList.remove('active');
                if (this.currentWordIndex !== -1 && !currentLine.isInstrumental) {
                    currentLine.words[this.currentWordIndex]?.classList.remove('active');
                }
            }
        }
        
        // Reset line visibility and container position
        this.lines.forEach(line => {
            line.element.style.display = 'block';
            line.element.style.opacity = 0.6;
        });
        this.container.style.transform = 'translateY(0)';

        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
    }
}

export default LyricsDisplay; 