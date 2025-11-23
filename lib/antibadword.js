const fs = require('fs');
const path = require('path');

const BAD_WORDS_FILE = './data/badwords.json';
const ANTIBADWORD_SETTINGS = './data/antibadword_settings.json';

// Load settings and bad words
function loadSettings() {
    try {
        if (fs.existsSync(ANTIBADWORD_SETTINGS)) {
            return JSON.parse(fs.readFileSync(ANTIBADWORD_SETTINGS));
        }
    } catch (error) {
        console.error('Error loading antibadword settings:', error);
    }
    return {};
}

function loadBadWords() {
    try {
        if (fs.existsSync(BAD_WORDS_FILE)) {
            return JSON.parse(fs.readFileSync(BAD_WORDS_FILE));
        }
    } catch (error) {
        console.error('Error loading bad words:', error);
    }
    return { global: [], groups: {} };
}

// Check if message contains bad words
function containsBadWords(message, chatId) {
    const settings = loadSettings();
    const badWordsData = loadBadWords();
    
    // Check if antibadword is enabled for this group
    if (!settings[chatId]?.enabled) {
        return false;
    }

    const messageText = message.toLowerCase();
    const groupWords = badWordsData.groups[chatId] || [];
    const globalWords = badWordsData.global || [];

    const allBadWords = [...globalWords, ...groupWords];
    
    // Check for exact matches and partial matches
    for (const word of allBadWords) {
        if (word && messageText.includes(word.toLowerCase())) {
            return {
                found: true,
                word: word,
                isGlobal: globalWords.includes(word)
            };
        }
    }

    return { found: false };
}

// Handle bad word detection
async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const detection = containsBadWords(userMessage, chatId);
        
        if (detection.found) {
            // Delete the message containing bad words
            try {
                await sock.sendMessage(chatId, {
                    delete: message.key
                });
            } catch (deleteError) {
                console.error('Error deleting message:', deleteError);
            }

            // Warn the user
            const warningMessage = `*🚫 BAD WORD DETECTED*\n\n@${senderId.split('@')[0]} Your message was deleted for containing inappropriate language.\n\n*Violation:* "${detection.word}"\n*Type:* ${detection.isGlobal ? 'Global' : 'Group'} banned word`;

            await sock.sendMessage(chatId, {
                text: warningMessage,
                mentions: [senderId]
            }, { quoted: message });

            // Log the violation
            console.log(`Bad word detected from ${senderId} in ${chatId}: "${detection.word}"`);
            
            return true; // Bad word was detected and handled
        }
    } catch (error) {
        console.error('Error in bad word detection:', error);
    }
    
    return false; // No bad word detected or error occurred
}

// Add global bad words (for bot owner)
function addGlobalBadWord(word) {
    try {
        const badWordsData = loadBadWords();
        const cleanWord = word.toLowerCase().trim();
        
        if (!badWordsData.global.includes(cleanWord)) {
            badWordsData.global.push(cleanWord);
            fs.writeFileSync(BAD_WORDS_FILE, JSON.stringify(badWordsData, null, 2));
            return true;
        }
    } catch (error) {
        console.error('Error adding global bad word:', error);
    }
    return false;
}

// Remove global bad word
function removeGlobalBadWord(word) {
    try {
        const badWordsData = loadBadWords();
        const cleanWord = word.toLowerCase().trim();
        const index = badWordsData.global.indexOf(cleanWord);
        
        if (index > -1) {
            badWordsData.global.splice(index, 1);
            fs.writeFileSync(BAD_WORDS_FILE, JSON.stringify(badWordsData, null, 2));
            return true;
        }
    } catch (error) {
        console.error('Error removing global bad word:', error);
    }
    return false;
}

// Export functions
module.exports = {
    handleBadwordDetection,
    containsBadWords,
    addGlobalBadWord,
    removeGlobalBadWord,
    loadBadWords,
    loadSettings
};
