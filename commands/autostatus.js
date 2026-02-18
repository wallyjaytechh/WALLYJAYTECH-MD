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

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!',
                ...channelInfo
            });
            return;
        }

        let config = JSON.parse(fs.readFileSync(configPath));
        const command = args[0]?.toLowerCase();

        if (!command) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Status*\n\n📱 Status: ${status}\n\nCommands:\n• .autostatus on\n• .autostatus off`,
                ...channelInfo
            });
            return;
        }

        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ Auto status enabled - viewing instantly!',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ Auto status disabled',
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: '❌ Use: .autostatus on or .autostatus off',
                ...channelInfo
            });
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

// ULTRA FAST - no processing, just view
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) return;

        // Handle messages.upsert format
        if (status.messages?.[0]?.key?.remoteJid === 'status@broadcast') {
            const msg = status.messages[0];
            // View immediately - no await needed
            sock.readMessages([msg.key]).catch(() => {});
            const sender = msg.key.participant || msg.key.remoteJid;
            console.log(`👁️ Status viewed from ${sender.split('@')[0]}`);
        }
        // Handle direct status format
        else if (status.key?.remoteJid === 'status@broadcast') {
            sock.readMessages([status.key]).catch(() => {});
            const sender = status.key.participant || status.key.remoteJid;
            console.log(`👁️ Status viewed from ${sender.split('@')[0]}`);
        }
    } catch (error) {
        // Silent fail - absolutely no delay
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    isAutoStatusEnabled
};
