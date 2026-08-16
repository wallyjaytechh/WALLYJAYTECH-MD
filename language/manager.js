const fs = require('fs');
const path = require('path');

class LanguageManager {
    constructor() {
        this.defaultLanguage = 'en';
        this.userLangFile = path.join(__dirname, '../data/user_langs.json');
    }

    getUserLanguage(userId) {
        try {
            if (fs.existsSync(this.userLangFile)) {
                const data = JSON.parse(fs.readFileSync(this.userLangFile, 'utf8'));
                return data[userId] || this.defaultLanguage;
            }
        } catch (e) {}
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
