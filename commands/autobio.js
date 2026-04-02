const fs = require('fs');
const path = require('path');

const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');
const AUTOBIO_TEXT = "POWERED BY WALLYJAYTECH-MD";

let autobioEnabled = true;

// Load state
try {
    if (fs.existsSync(AUTOBIO_FILE)) {
        const saved = JSON.parse(fs.readFileSync(AUTOBIO_FILE, 'utf8'));
        autobioEnabled = saved.enabled !== false;
    }
} catch (e) {}

function saveState() {
    try {
        const dir = path.dirname(AUTOBIO_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(AUTOBIO_FILE, JSON.stringify({ enabled: autobioEnabled }, null, 2));
    } catch (e) {}
}

module.exports = {
    async execute(sock, chatId, message, args) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isOwnerOrSudo } = require('../lib/isOwner');
        const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!isAuthorized) {
            await sock.sendMessage(chatId, {
                text: '❌ Only bot owner can use autobio commands!'
            }, { quoted: message });
            return;
        }
        
        const action = args[0]?.toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            autobioEnabled = true;
            saveState();
            await sock.updateProfileStatus(AUTOBIO_TEXT);
            await sock.sendMessage(chatId, {
                text: `✅ AutoBio ENABLED\n\n📱 Bio: ${AUTOBIO_TEXT}`
            }, { quoted: message });
        } 
        else if (action === 'off' || action === 'disable') {
            autobioEnabled = false;
            saveState();
            await sock.sendMessage(chatId, {
                text: `❌ AutoBio DISABLED`
            }, { quoted: message });
        }
        else if (action === 'status') {
            await sock.sendMessage(chatId, {
                text: `📊 AutoBio Status\n\nStatus: ${autobioEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}\nBio: ${AUTOBIO_TEXT}\n\nCommands:\n.autobio on - Enable\n.autobio off - Disable\n.autobio status - Show status`
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚙️ AutoBio Commands\n\nStatus: ${autobioEnabled ? '🟢 ON' : '🔴 OFF'}\nBio: ${AUTOBIO_TEXT}\n\n.autobio on - Enable\n.autobio off - Disable\n.autobio status - Show status`
            }, { quoted: message });
        }
    },
    
    async updateBioIfNeeded(sock) {
        if (!autobioEnabled) return false;
        try {
            await sock.updateProfileStatus(AUTOBIO_TEXT);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    async startOnConnect(sock) {
        if (autobioEnabled) {
            try {
                await sock.updateProfileStatus(AUTOBIO_TEXT);
                console.log('✅ AutoBio set on connect');
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }
};
