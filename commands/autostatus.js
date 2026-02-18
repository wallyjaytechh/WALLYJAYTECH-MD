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
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false
    }, null, 2));
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

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            
            await sock.sendMessage(chatId, { 
                text: `🔄 *WALLYJAYTECH-MD Auto Status*\n\n📱 *Auto Status View:* ${status}\n\n*Commands:*\n• .autostatus on - Enable auto status view\n• .autostatus off - Disable auto status view`,
                ...channelInfo
            });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto status view enabled!*\n\nBot will now instantly view all contact statuses as soon as they are posted.',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto status view disabled!*\n\nBot will no longer automatically view statuses.',
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Invalid command!*\n\n*Available Commands:*\n• .autostatus on - Enable auto status view\n• .autostatus off - Disable auto status view`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto status!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// OPTIMIZED: Handle status updates IMMEDIATELY
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Handle status from messages.upsert (MOST COMMON)
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    // View immediately - NO DELAY
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    const senderNumber = sender.split('@')[0];
                    console.log(`👁️ Auto-viewed status from ${senderNumber} instantly`);
                } catch (err) {
                    // If rate limited, log but don't retry immediately
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, skipping status view');
                    } else {
                        console.error('❌ Error viewing status:', err.message);
                    }
                }
                return;
            }
        }

        // Handle direct status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                // View immediately - NO DELAY
                await sock.readMessages([status.key]);
                const sender = status.key.participant || status.key.remoteJid;
                const senderNumber = sender.split('@')[0];
                console.log(`👁️ Auto-viewed status from ${senderNumber} instantly`);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, skipping status view');
                } else {
                    console.error('❌ Error viewing status:', err.message);
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

// Handle bulk status updates (when multiple statuses appear at once)
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        if (!isAutoStatusEnabled() || !statusMessages || statusMessages.length === 0) {
            return;
        }

        console.log(`📱 Instantly processing ${statusMessages.length} status updates`);
        
        // Process all statuses immediately without delay
        for (const msg of statusMessages) {
            try {
                if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                    // View immediately
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    const senderNumber = sender.split('@')[0];
                    console.log(`👁️ Auto-viewed status from ${senderNumber} instantly`);
                }
            } catch (err) {
                // Skip if error, continue with next status
                console.error('❌ Error viewing status:', err.message);
                continue;
            }
        }
        
        console.log('✅ Finished processing all statuses instantly');
        
    } catch (error) {
        console.error('❌ Error in bulk status handling:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    handleBulkStatusUpdate,
    isAutoStatusEnabled
};
