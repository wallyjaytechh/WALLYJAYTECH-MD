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
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false
    }));
}

// Cache to avoid duplicate processing
const processedStatuses = new Set();
const CLEAR_CACHE_INTERVAL = 30000; // Clear cache every 30 seconds

// Clear cache periodically
setInterval(() => {
    processedStatuses.clear();
    console.log('🧹 Cleared status cache');
}, CLEAR_CACHE_INTERVAL);

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
                text: `⚡ *WALLYJAYTECH-MD Auto Status*\n\n📱 *Auto Status View:* ${status}\n\n*Commands:*\n• .autostatus on - Enable instant status viewing\n• .autostatus off - Disable auto status viewing`,
                ...channelInfo
            });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto status view enabled!*\n\nBot will now instantly view all contact statuses as they appear.',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto status view disabled!*\n\nBot will no longer view statuses.',
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Invalid command!*\n\n*Available Commands:*\n• .autostatus on - Enable instant status viewing\n• .autostatus off - Disable auto status viewing`,
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
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Fast status viewing function (no delays)
async function viewStatusInstantly(sock, statusKey) {
    try {
        // Create a unique identifier for this status
        const statusId = `${statusKey.remoteJid}:${statusKey.id}`;
        
        // Skip if we already processed this status
        if (processedStatuses.has(statusId)) {
            return;
        }
        
        // Mark as processed
        processedStatuses.add(statusId);
        
        // View status immediately (no delay)
        await sock.readMessages([statusKey]);
        
        const sender = statusKey.participant || 'Unknown';
        console.log(`⚡ Instantly viewed status from ${sender}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error viewing status instantly:', error.message);
        
        // If it's a rate limit error, remove from cache to retry later
        if (error.message?.includes('rate-overlimit')) {
            const statusId = `${statusKey.remoteJid}:${statusKey.id}`;
            processedStatuses.delete(statusId);
            console.log('⚠️ Rate limit hit, will retry on next update');
        }
        
        return false;
    }
}

// Optimized function to handle status updates
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        let statusKey = null;

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                statusKey = msg.key;
            }
        }
        // Handle direct status updates
        else if (status.key && status.key.remoteJid === 'status@broadcast') {
            statusKey = status.key;
        }

        // If we have a valid status key, view it IMMEDIATELY
        if (statusKey) {
            // Don't await - process immediately without blocking
            viewStatusInstantly(sock, statusKey).catch(err => {
                console.error('Background status view error:', err.message);
            });
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

// Alternative: Bulk status viewer for when multiple statuses appear
async function handleBulkStatusUpdate(sock, statusList) {
    if (!isAutoStatusEnabled()) return;
    
    try {
        const statusKeys = [];
        
        for (const status of statusList) {
            if (status.messages && status.messages.length > 0) {
                const msg = status.messages[0];
                if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                    // Check cache before adding
                    const statusId = `${msg.key.remoteJid}:${msg.key.id}`;
                    if (!processedStatuses.has(statusId)) {
                        statusKeys.push(msg.key);
                        processedStatuses.add(statusId);
                    }
                }
            }
        }
        
        if (statusKeys.length > 0) {
            // View all statuses at once
            await sock.readMessages(statusKeys);
            console.log(`⚡ Bulk viewed ${statusKeys.length} statuses instantly`);
        }
    } catch (error) {
        console.error('❌ Error in bulk status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    handleBulkStatusUpdate,
    isAutoStatusEnabled
};
