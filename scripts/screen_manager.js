class ScreenManager {
    constructor(maxLinesPerScreen = 4) {
        this.maxLinesPerScreen = maxLinesPerScreen;
        this.screens = [];
        this.currentScreenIndex = -1;
    }

    // Generate screens from parsed lyrics
    generateScreens(parsedLyrics) {
        this.screens = [];
        let currentScreen = [];
        let currentLineCount = 0;

        for (let i = 0; i < parsedLyrics.length; i++) {
            const line = parsedLyrics[i];
            const isInstrumental = line.rawText.includes('♪') || line.rawText.includes('INSTRUMENTAL');
            
            // Handle instrumental breaks as their own screen
            if (isInstrumental) {
                // If we have accumulated lines, create a screen
                if (currentScreen.length > 0) {
                    this.screens.push({
                        lines: [...currentScreen],
                        startTime: currentScreen[0].lineTimestamp,
                        endTime: line.lineTimestamp
                    });
                    currentScreen = [];
                    currentLineCount = 0;
                }

                // Add instrumental screen
                this.screens.push({
                    lines: [line],
                    startTime: line.lineTimestamp,
                    endTime: i < parsedLyrics.length - 1 ? parsedLyrics[i + 1].lineTimestamp : line.lineTimestamp + 5,
                    isInstrumental: true
                });
                continue;
            }

            // Handle empty lines as screen breaks
            if (line.rawText.trim() === '') {
                if (currentScreen.length > 0) {
                    const nextNonEmptyLine = parsedLyrics.slice(i + 1).find(l => l.rawText.trim() !== '');
                    this.screens.push({
                        lines: [...currentScreen],
                        startTime: currentScreen[0].lineTimestamp,
                        endTime: nextNonEmptyLine ? nextNonEmptyLine.lineTimestamp : currentScreen[currentScreen.length - 1].lineTimestamp + 5
                    });
                    currentScreen = [];
                    currentLineCount = 0;
                }
                continue;
            }

            // Add line to current screen
            currentScreen.push(line);
            currentLineCount++;

            // Check if we need to create a new screen
            if (currentLineCount >= this.maxLinesPerScreen || i === parsedLyrics.length - 1) {
                const nextLine = parsedLyrics[i + 1];
                this.screens.push({
                    lines: [...currentScreen],
                    startTime: currentScreen[0].lineTimestamp,
                    endTime: nextLine ? nextLine.lineTimestamp : line.lineTimestamp + 5
                });
                currentScreen = [];
                currentLineCount = 0;
            }
        }

        // Add any remaining lines as the last screen
        if (currentScreen.length > 0) {
            this.screens.push({
                lines: [...currentScreen],
                startTime: currentScreen[0].lineTimestamp,
                endTime: currentScreen[currentScreen.length - 1].lineTimestamp + 5
            });
        }

        return this.screens;
    }

    // Get the screen that should be displayed at a given time
    getScreenAtTime(time) {
        // For initial display, show first screen if time is 0 or negative
        if (time <= 0 && this.screens.length > 0) {
            const firstScreen = this.screens[0];
            return {
                screen: firstScreen,
                screenIndex: 0,
                currentLineIndex: -1,
                currentWord: null,
                progress: 0
            };
        }

        const screenIndex = this.screens.findIndex(screen => 
            screen.startTime <= time && time < screen.endTime
        );

        if (screenIndex === -1) return null;

        // Find the current word within the screen
        const screen = this.screens[screenIndex];
        let currentLineIndex = -1;
        let currentWord = null;

        // Find the latest word that should be highlighted
        let latestTime = -1;
        let nextWordTime = null;
        
        // First pass: find the current word
        screen.lines.forEach((line, lineIdx) => {
            line.words.forEach((word, wordIdx) => {
                if (word.timestamp <= time && word.timestamp > latestTime) {
                    latestTime = word.timestamp;
                    currentLineIndex = lineIdx;
                    currentWord = {
                        ...word,
                        index: wordIdx
                    };
                }
            });
        });

        // If we found a word, find the next word's timestamp
        if (currentWord) {
            // Look in current line first
            const currentLine = screen.lines[currentLineIndex];
            if (currentWord.index < currentLine.words.length - 1) {
                nextWordTime = currentLine.words[currentWord.index + 1].timestamp;
            } else {
                // Look in next lines of current screen
                for (let i = currentLineIndex + 1; i < screen.lines.length; i++) {
                    if (screen.lines[i].words.length > 0) {
                        nextWordTime = screen.lines[i].words[0].timestamp;
                        break;
                    }
                }
                
                // If no next word in current screen, look in next screen
                if (!nextWordTime && screenIndex < this.screens.length - 1) {
                    const nextScreen = this.screens[screenIndex + 1];
                    if (nextScreen.lines[0].words.length > 0) {
                        nextWordTime = nextScreen.lines[0].words[0].timestamp;
                    }
                }
            }

            // Calculate duration
            if (nextWordTime !== null) {
                currentWord.duration = nextWordTime - currentWord.timestamp;
            } else {
                // If no next word found, use a reasonable default
                currentWord.duration = 0.5;
            }

            // Cap minimum and maximum duration
            currentWord.duration = Math.max(0.1, Math.min(currentWord.duration, 5));
        }

        return {
            screen,
            screenIndex,
            currentLineIndex,
            currentWord,
            progress: screen.isInstrumental ? 
                (time - screen.startTime) / (screen.endTime - screen.startTime) : 0
        };
    }
}

export default ScreenManager; 