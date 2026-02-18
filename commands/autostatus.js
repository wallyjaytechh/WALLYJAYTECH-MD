const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config
if (!fs.existsSync(configPath)) {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        const command = args[0]?.toLowerCase();

        if (!command) {
            await sock.sendMessage(chatId, { 
                text: `🔄 Auto Status: ${config.enabled ? 'ON' : 'OFF'}\n\n.autostatus on\n.autostatus off`
            });
            return;
        }

        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '✅ Auto status ON' });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '❌ Auto status OFF' });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function isAutoStatusEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}

// ULTRA LIGHTWEIGHT - no processing
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) return;
        
        let msg = status.messages?.[0] || status;
        if (msg.key?.remoteJid === 'status@broadcast') {
            // FIRE AND FORGET - absolutely no delay
            sock.readMessages([msg.key]).catch(() => {});
        }
    } catch {
        // Silent fail
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    isAutoStatusEnabled
};
