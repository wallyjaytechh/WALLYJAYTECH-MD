// language/manager.js
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

class LanguageManager {
    constructor() {
        this.defaultLanguage = settings.botLanguage || 'en';
        this.userLangFile = path.join(__dirname, '../data/user_langs.json');
        this.ownerLangFile = path.join(__dirname, '../data/owner_lang.json');  // ← NEW
        this.ownerNumber = settings.ownerNumber || '2348144317152';
        this.ensureFiles();
    }

    ensureFiles() {
        try {
            // Ensure user_langs.json
            if (!fs.existsSync(this.userLangFile)) {
                const dir = path.dirname(this.userLangFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(this.userLangFile, JSON.stringify({}, null, 2));
                console.log(`✅ Created: ${this.userLangFile}`);
            }

            // Ensure owner_lang.json (separate file, not overwritten by updates)
            if (!fs.existsSync(this.ownerLangFile)) {
                const dir = path.dirname(this.ownerLangFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Set default language from settings.js
                fs.writeFileSync(this.ownerLangFile, JSON.stringify({
                    language: this.defaultLanguage
                }, null, 2));
                console.log(`✅ Created: ${this.ownerLangFile} with language: ${this.defaultLanguage}`);
            }
        } catch (e) {
            console.error('Error creating files:', e);
        }
    }

    getUserLanguage(userId) {
        try {
            // Check if this is the owner
            if (userId === this.ownerNumber || userId.includes(this.ownerNumber)) {
                // Get owner's language from separate file
                if (fs.existsSync(this.ownerLangFile)) {
                    const data = JSON.parse(fs.readFileSync(this.ownerLangFile, 'utf8'));
                    if (data.language) {
                        return data.language;
                    }
                }
            }

            // Check user_langs.json for other users
            if (fs.existsSync(this.userLangFile)) {
                const data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
                if (data[userId]) {
                    return data[userId];
                }
            }
        } catch (e) {}
        return this.defaultLanguage;
    }

    getOwnerLanguage() {
        try {
            if (fs.existsSync(this.ownerLangFile)) {
                const data = JSON.parse(fs.readFileSync(this.ownerLangFile, 'utf8'));
                if (data.language) {
                    return data.language;
                }
            }
        } catch (e) {}
        return this.defaultLanguage;
    }

    setUserLanguage(userId, langCode) {
        try {
            // If owner, save to owner_lang.json (won't be overwritten by updates)
            if (userId === this.ownerNumber || userId.includes(this.ownerNumber)) {
                fs.writeFileSync(this.ownerLangFile, JSON.stringify({
                    language: langCode
                }, null, 2));
                console.log(`✅ Owner language saved to: ${this.ownerLangFile} (${langCode})`);
                return true;
            }

            // For other users, save to user_langs.json
            let data = {};
            if (fs.existsSync(this.userLangFile)) {
                data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
            }
            data[userId] = langCode;
            fs.writeFileSync(this.userLangFile, JSON.stringify(data, null, 2));
            console.log(`✅ User language saved: ${userId} → ${langCode}`);
            
            return true;
        } catch (e) {
            console.error('Error saving language:', e);
            return false;
        }
    }
}

module.exports = new LanguageManager();
