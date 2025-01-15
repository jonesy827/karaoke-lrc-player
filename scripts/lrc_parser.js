class LRCParser {
    constructor() {
        this.lyrics = [];
        this.debugOffset = 0; // Debug offset in milliseconds
    }

    // Set debug offset
    setDebugOffset(offsetMs) {
        this.debugOffset = offsetMs;
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
        let words = [];
        let remainingLine = line.slice(lineTimestampMatch[0].length).trim();

        // Check if this is an instrumental line
        if (remainingLine.includes('♪') || remainingLine.includes('INSTRUMENTAL')) {
            // Extract end timestamp if present
            const endTimestampMatch = remainingLine.match(/\[(\d{2}:\d{2}\.\d{2})\]/);
            const endTimestamp = endTimestampMatch ? LRCParser.timestampToSeconds(endTimestampMatch[0]) : null;
            
            // Create a single "word" for the entire instrumental section
            words = [{
                text: remainingLine,
                timestamp: lineTimestamp,
                duration: endTimestamp ? endTimestamp - lineTimestamp : null
            }];
        } else {
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
                // Apply offset to all timestamps
                parsedLine.lineTimestamp += this.debugOffset / 1000;
                parsedLine.words.forEach(word => {
                    word.timestamp += this.debugOffset / 1000;
                });
                this.lyrics.push(parsedLine);
            }
        }

        return this.lyrics;
    }

    // Get the word that should be highlighted at a given time
    getWordAtTime(time) {
        // No need to adjust time here anymore since timestamps are already adjusted
        const adjustedTime = time;

        // Find the current line
        const currentLineIndex = this.lyrics.findIndex(line => 
            line.lineTimestamp > adjustedTime
        ) - 1;

        if (currentLineIndex < 0) return null;

        const currentLine = this.lyrics[currentLineIndex];
        
        // Find the current word in the line
        const currentWordIndex = currentLine.words.findIndex((word, index) => {
            const nextWord = currentLine.words[index + 1];
            return word.timestamp <= adjustedTime && 
                   (!nextWord || nextWord.timestamp > adjustedTime);
        });

        if (currentWordIndex === -1) return null;

        const currentWord = currentLine.words[currentWordIndex];
        let duration;

        // If the word has an explicit duration (instrumental section), use it
        if (currentWord.duration) {
            duration = currentWord.duration;
        } else {
            // Calculate duration until next word
            const nextWord = currentLine.words[currentWordIndex + 1];
            if (nextWord) {
                duration = Math.max(0.1, nextWord.timestamp - currentWord.timestamp);
            } else if (currentLineIndex < this.lyrics.length - 1) {
                // If this is the last word in the line, use time until next line
                const nextLine = this.lyrics[currentLineIndex + 1];
                if (nextLine.words.length > 0) {
                    duration = Math.max(0.1, nextLine.words[0].timestamp - currentWord.timestamp);
                }
            }
        }

        // If no duration could be calculated (last word of last line)
        // or duration is too short, use a default
        if (!duration || duration < 0.1) {
            duration = 0.5;
            console.log(`Using default duration: ${duration}s`);
        }

        // Cap maximum duration
        duration = Math.min(duration, 5);

        return {
            word: {
                ...currentWord,
                index: currentWordIndex,
                duration,
                timestamp: currentWord.timestamp
            },
            lineIndex: currentLineIndex
        };
    }
}

export default LRCParser; 