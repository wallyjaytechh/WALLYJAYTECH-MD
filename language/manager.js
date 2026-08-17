// language/manager.js
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

class LanguageManager {
    constructor() {
        this.defaultLanguage = settings.botLanguage || 'en';
        this.userLangFile = path.join(__dirname, '../data/user_langs.json');
        this.ownerNumber = settings.ownerNumber || '2348144317152';
        this.ensureUserLangFile();
    }

    ensureUserLangFile() {
        try {
            if (!fs.existsSync(this.userLangFile)) {
                const dir = path.dirname(this.userLangFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Pre-set owner language to default
                const defaultData = {};
                defaultData[this.ownerNumber] = this.defaultLanguage;
                fs.writeFileSync(this.userLangFile, JSON.stringify(defaultData, null, 2));
                console.log(`✅ Created: ${this.userLangFile} with owner language: ${this.defaultLanguage}`);
            }
        } catch (e) {
            console.error('Error creating user_langs.json:', e);
        }
    }

    getUserLanguage(userId) {
        try {
            if (fs.existsSync(this.userLangFile)) {
                const data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
                if (data[userId]) {
                    return data[userId];
                }
            }
        } catch (e) {}
        return this.defaultLanguage;
    }

    // Get owner's language
    getOwnerLanguage() {
        return this.getUserLanguage(this.ownerNumber);
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

    // Get all available languages
    getAvailableLanguages() {
        return Object.keys(this.languages || {});
    }
}

module.exports = new LanguageManager();
