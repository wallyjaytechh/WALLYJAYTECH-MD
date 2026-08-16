const fs = require('fs');
const path = require('path');
const settings = require('../settings');  // ← ADD THIS

class LanguageManager {
    constructor() {
        // Read default language from settings.js
        this.defaultLanguage = settings.botLanguage || 'en';  // ← USE SETTINGS
        this.userLangFile = path.join(__dirname, '../data/user_langs.json');
        this.ensureUserLangFile();  // ← ADD THIS
    }

    // Create user_langs.json if it doesn't exist
    ensureUserLangFile() {
        try {
            if (!fs.existsSync(this.userLangFile)) {
                const dir = path.dirname(this.userLangFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(this.userLangFile, JSON.stringify({}, null, 2));
                console.log(`✅ Created: ${this.userLangFile}`);
            }
        } catch (e) {
            console.error('Error creating user_langs.json:', e);
        }
    }

    getUserLanguage(userId) {
        try {
            if (fs.existsSync(this.userLangFile)) {
                const data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
                // If user has saved preference, use it
                if (data[userId]) {
                    return data[userId];
                }
            }
        } catch (e) {}
        // If no saved preference, use default from settings
        return this.defaultLanguage;
    }

    setUserLanguage(userId, langCode) {
        try {
            let data = {};
            if (fs.existsSync(this.userLangFile)) {
                data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
            }
            data[userId] = langCode;
            fs.writeFileSync(this.userLangFile, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = new LanguageManager();
