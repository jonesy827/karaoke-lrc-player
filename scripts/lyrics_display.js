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

        parsedLyrics.forEach((line, lineIndex) => {
            // Check if this is an instrumental break
            const isInstrumental = line.rawText.includes('♪') || line.rawText.includes('INSTRUMENTAL');
            
            if (isInstrumental) {
                // Create a special instrumental break display
                const breakElement = document.createElement('div');
                breakElement.className = 'lyrics-line instrumental-break';
                breakElement.innerHTML = '♪ Instrumental Break ♪';
                this.container.appendChild(breakElement);
                this.lines.push({
                    element: breakElement,
                    words: [],
                    isInstrumental: true
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
                    transition: all 0.2s ease;
                }
                .lyrics-word.active {
                    color: var(--highlight-color);
                    transform: scale(1.1);
                    text-shadow: 0 0 10px var(--highlight-color);
                }
                .instrumental-break {
                    font-style: italic;
                    color: var(--primary-color);
                    text-align: center;
                    padding: 0.5em 0;
                    opacity: 0.8;
                }
                .instrumental-break.active {
                    animation: pulse-glow 2s infinite;
                }
                @keyframes pulse-glow {
                    0% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0.6; transform: scale(1); }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Highlight the current word and line, managing visible lines
    highlight(lineIndex, word) {
        // Remove previous highlights
        if (this.currentLineIndex !== -1) {
            const prevLine = this.lines[this.currentLineIndex];
            if (prevLine) {
                prevLine.element.classList.remove('active');
                if (this.currentWordIndex !== -1 && !prevLine.isInstrumental) {
                    prevLine.words[this.currentWordIndex]?.classList.remove('active');
                }
            }
        }

        // Add new highlights
        if (lineIndex !== -1) {
            const currentLine = this.lines[lineIndex];
            if (!currentLine) return;

            // Handle instrumental breaks
            if (currentLine.isInstrumental) {
                currentLine.element.classList.add('active');
                this.currentLineIndex = lineIndex;
                this.currentWordIndex = -1;
                return;
            }

            // Regular lyrics line
            if (word && typeof word.index === 'number') {
                const wordIndex = word.index;
                
                if (wordIndex >= 0 && wordIndex < currentLine.words.length) {
                    currentLine.element.classList.add('active');
                    currentLine.words[wordIndex].classList.add('active');
                    
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