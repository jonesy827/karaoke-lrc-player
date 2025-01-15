class LRCParser {
    constructor() {
        this.lyrics = [];
    }

    // Convert timestamp string to seconds
    static timestampToSeconds(timestamp) {
        const [minutes, seconds] = timestamp.slice(1, -1).split(':').map(Number);
        return minutes * 60 + seconds;
    }

    // Parse a single line with word-level timing
    parseLine(line) {
        const lineTimestampMatch = line.match(/^\[(\d{2}:\d{2}\.\d{2})\]/);
        if (!lineTimestampMatch) return null;

        const lineTimestamp = LRCParser.timestampToSeconds(lineTimestampMatch[0]);
        const words = [];
        let remainingLine = line.slice(lineTimestampMatch[0].length).trim();

        // Extract word-level timestamps and words
        const wordRegex = /<(\d{2}:\d{2}\.\d{2})>([^<]+)/g;
        let match;
        
        while ((match = wordRegex.exec(remainingLine)) !== null) {
            const wordTimestamp = LRCParser.timestampToSeconds(match[1]);
            const word = match[2].trim();
            
            if (word) {
                words.push({
                    text: word,
                    timestamp: wordTimestamp
                });
            }
        }

        return {
            lineTimestamp,
            words,
            rawText: words.map(w => w.text).join(' ')
        };
    }

    // Parse the entire LRC file content
    parse(lrcContent) {
        this.lyrics = [];
        const lines = lrcContent.split('\n');

        for (const line of lines) {
            const parsedLine = this.parseLine(line.trim());
            if (parsedLine) {
                this.lyrics.push(parsedLine);
            }
        }

        return this.lyrics;
    }

    // Get the word that should be highlighted at a given time
    getWordAtTime(time) {
        // Find the current line
        const currentLineIndex = this.lyrics.findIndex(line => 
            line.lineTimestamp > time
        ) - 1;

        if (currentLineIndex < 0) return null;

        const currentLine = this.lyrics[currentLineIndex];
        
        // Find the current word in the line
        const currentWordIndex = currentLine.words.findIndex((word, index) => {
            const nextWord = currentLine.words[index + 1];
            return word.timestamp <= time && 
                   (!nextWord || nextWord.timestamp > time);
        });

        return currentWordIndex !== -1 ? {
            word: {
                ...currentLine.words[currentWordIndex],
                index: currentWordIndex
            },
            lineIndex: currentLineIndex
        } : null;
    }
}

export default LRCParser; 