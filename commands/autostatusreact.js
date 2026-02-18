const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// Path to store config
const configPath = path.join(__dirname, '../data/autoStatusReact.json');

// WhatsApp default reaction
const DEFAULT_REACTION = '💚';

// Initialize config
if (!fs.existsSync(configPath)) {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function autoStatusReactCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ Owner only!',
                ...channelInfo
            });
            return;
        }

        let config = JSON.parse(fs.readFileSync(configPath));
        const command = args[0]?.toLowerCase();

        if (!command) {
            const status = config.enabled ? '✅ ON' : '❌ OFF';
            await sock.sendMessage(chatId, { 
                text: `💚 *Auto Status React*\n\nStatus: ${status}\n\nCommands:\n.autostatusreact on\n.autostatusreact off`,
                ...channelInfo
            });
            return;
        }

        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ Auto status reactions ON - will react with 💚',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ Auto status reactions OFF',
                ...channelInfo
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: 'Use: .autostatusreact on or .autostatusreact off',
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

function isAutoReactEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}

async function reactToStatus(sock, statusKey) {
    try {
        if (!isAutoReactEnabled()) return;
        
        await sock.sendMessage('status@broadcast', {
            react: {
                key: statusKey,
                text: DEFAULT_REACTION
            }
        });
        console.log(`💚 Reacted to status`);
    } catch (error) {
        console.error('React error:', error.message);
    }
}

module.exports = {
    autoStatusReactCommand,
    reactToStatus,
    isAutoReactEnabled
};
