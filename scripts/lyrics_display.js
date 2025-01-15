class LyricsDisplay {
    constructor(container) {
        this.container = container;
        this.lines = [];
        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
    }

    // Create DOM elements for lyrics display
    render(parsedLyrics) {
        this.container.innerHTML = '';
        this.lines = [];

        parsedLyrics.forEach((line, lineIndex) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'lyrics-line';
            
            const words = line.words.map((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word.text + ' ';
                wordSpan.className = 'lyrics-word';
                wordSpan.dataset.lineIndex = lineIndex;
                wordSpan.dataset.wordIndex = wordIndex;
                return wordSpan;
            });

            words.forEach(word => lineElement.appendChild(word));
            this.container.appendChild(lineElement);
            this.lines.push({
                element: lineElement,
                words: words
            });
        });

        // Add styles if not already present
        if (!document.getElementById('lyrics-display-styles')) {
            const styles = document.createElement('style');
            styles.id = 'lyrics-display-styles';
            styles.textContent = `
                .lyrics-line {
                    margin: 0.5em 0;
                    line-height: 1.6;
                    transition: font-weight 0.2s;
                }
                .lyrics-word {
                    transition: all 0.2s ease;
                    padding: 0.1em 0.2em;
                    border-radius: 3px;
                    display: inline-block;
                }
                .lyrics-word.active {
                    background-color: #ffeb3b;
                    color: #000;
                    transform: scale(1.1);
                }
                .lyrics-line.active {
                    font-weight: bold;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Highlight the current word and line
    highlight(lineIndex, word) {
        // Remove previous highlights
        if (this.currentLineIndex !== -1) {
            this.lines[this.currentLineIndex].element.classList.remove('active');
            if (this.currentWordIndex !== -1) {
                this.lines[this.currentLineIndex].words[this.currentWordIndex].classList.remove('active');
            }
        }

        // Add new highlights
        if (lineIndex !== -1 && word && typeof word.index === 'number') {
            const wordIndex = word.index;
            
            if (wordIndex >= 0 && wordIndex < this.lines[lineIndex].words.length) {
                this.lines[lineIndex].element.classList.add('active');
                this.lines[lineIndex].words[wordIndex].classList.add('active');
                
                // Scroll into view if needed
                const wordElement = this.lines[lineIndex].words[wordIndex];
                const containerRect = this.container.getBoundingClientRect();
                const wordRect = wordElement.getBoundingClientRect();

                if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
                    wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                this.currentLineIndex = lineIndex;
                this.currentWordIndex = wordIndex;
            }
        }
    }

    // Reset all highlights
    reset() {
        if (this.currentLineIndex !== -1) {
            this.lines[this.currentLineIndex].element.classList.remove('active');
            if (this.currentWordIndex !== -1) {
                this.lines[this.currentLineIndex].words[this.currentWordIndex].classList.remove('active');
            }
        }
        this.currentLineIndex = -1;
        this.currentWordIndex = -1;
    }
}

export default LyricsDisplay; 