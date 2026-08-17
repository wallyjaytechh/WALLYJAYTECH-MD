// language/manager.js
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

class LanguageManager {
    constructor() {
        this.defaultLanguage = settings.botLanguage || 'en';
        this.userLangFile = path.join(__dirname, '../data/user_langs.json');
        this.settingsPath = path.join(__dirname, '../settings.js');
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

    getOwnerLanguage() {
        return this.getUserLanguage(this.ownerNumber);
    }

    // ---- UPDATE SETTINGS.JS WITH NEW LANGUAGE ----
    updateSettingsLanguage(langCode) {
        try {
            let settingsContent = fs.readFileSync(this.settingsPath, 'utf8');
            
            // Find and replace botLanguage value
            const regex = /(botLanguage:\s*)['"]([^'"]*)['"]/;
            const match = settingsContent.match(regex);
            
            if (match) {
                settingsContent = settingsContent.replace(regex, `$1'${langCode}'`);
                fs.writeFileSync(this.settingsPath, settingsContent, 'utf8');
                console.log(`✅ Updated settings.js botLanguage to: ${langCode}`);
                
                // Also update the loaded settings object
                settings.botLanguage = langCode;
                this.defaultLanguage = langCode;
                
                return true;
            } else {
                // If botLanguage doesn't exist, add it
                const insertRegex = /(module\.exports\s*=\s*\{[\s\S]*?)(\n\s*\};)/;
                const insertMatch = settingsContent.match(insertRegex);
                if (insertMatch) {
                    settingsContent = settingsContent.replace(
                        insertRegex,
                        `$1,\n  botLanguage: '${langCode}'\n$2`
                    );
                    fs.writeFileSync(this.settingsPath, settingsContent, 'utf8');
                    console.log(`✅ Added botLanguage: ${langCode} to settings.js`);
                    settings.botLanguage = langCode;
                    this.defaultLanguage = langCode;
                    return true;
                }
                return false;
            }
        } catch (e) {
            console.error('Error updating settings.js:', e);
            return false;
        }
    }

    setUserLanguage(userId, langCode) {
        try {
            let data = {};
            if (fs.existsSync(this.userLangFile)) {
                data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
            }
            data[userId] = langCode;
            fs.writeFileSync(this.userLangFile, JSON.stringify(data, null, 2));
            
            // If the user is the owner, also update settings.js
            if (userId === this.ownerNumber || userId.includes(this.ownerNumber)) {
                this.updateSettingsLanguage(langCode);
            }
            
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = new LanguageManager();
