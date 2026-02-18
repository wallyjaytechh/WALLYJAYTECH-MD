//══════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                          //
//                          𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 - ULTRA FAST AUTO STATUS VIEWER                                //
//                                                                                                          //
//                          Views statuses INSTANTLY - within milliseconds                                 //
//                                                                                                          //
//══════════════════════════════════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Configuration file path
const CONFIG_FILE = path.join(__dirname, '../data/autostatus.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Default configuration
const defaultConfig = {
    enabled: false,          // Master switch
    viewOwn: false,          // View own statuses? (you might not want this)
    viewContacts: true,      // View contacts' statuses
    viewNonContacts: false,  // View non-contacts' statuses
    downloadMedia: false,    // Download status media (optional, adds delay)
    markAsRead: true,        // Mark as read (blue double tick)
    logViewed: true,         // Log viewed statuses in console
    silentMode: false        // No console logs if true
};

// Load configuration
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            const config = JSON.parse(data);
            return { ...defaultConfig, ...config };
        }
    } catch (error) {
        console.error('❌ Error loading autostatus config:', error.message);
    }
    return { ...defaultConfig };
}

// Save configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error saving autostatus config:', error.message);
        return false;
    }
}

// Get status of viewed statuses to avoid re-viewing
const viewedStatuses = new Set();

// Clean up old entries every hour
setInterval(() => {
    viewedStatuses.clear();
    if (loadConfig().enabled && !loadConfig().silentMode) {
        console.log('🧹 Cleared viewed statuses cache');
    }
}, 60 * 60 * 1000); // 1 hour

// ULTRA FAST status handler - processes statuses IMMEDIATELY
async function handleStatusUpdate(sock, chatUpdate) {
    try {
        // Fastest possible check
        if (!sock || !chatUpdate) return;
        
        // Load config once - minimal overhead
        const config = loadConfig();
        if (!config.enabled) return;

        // Handle different input formats
        let messages = [];
        
        if (chatUpdate.messages && Array.isArray(chatUpdate.messages)) {
            // From messages.upsert event
            messages = chatUpdate.messages;
        } else if (chatUpdate.key && chatUpdate.key.remoteJid === 'status@broadcast') {
            // Single status object
            messages = [chatUpdate];
        } else {
            return;
        }

        // Process each status message
        for (const message of messages) {
            // Fastest possible checks - no heavy operations
            if (!message.key || message.key.remoteJid !== 'status@broadcast') continue;
            
            const statusId = message.key.id;
            
            // Skip if already viewed (unless config says otherwise)
            if (viewedStatuses.has(statusId)) continue;
            
            // Get participant (who posted the status)
            const participant = message.key.participant || message.key.remoteJid;
            if (!participant) continue;
            
            // Skip own statuses if configured
            const isOwnStatus = participant === sock.user.id.split(':')[0] + '@s.whatsapp.net';
            if (isOwnStatus && !config.viewOwn) continue;
            
            // Check contact status (simplified - just check if in contacts)
            const isContact = sock.store?.contacts ? !!sock.store.contacts[participant] : false;
            
            if (!config.viewContacts && isContact) continue;
            if (!config.viewNonContacts && !isContact) continue;
            
            // Add to viewed set immediately to prevent double-processing
            viewedStatuses.add(statusId);
            
            // Log if enabled (but after adding to set to minimize delay)
            if (config.logViewed && !config.silentMode) {
                const jid = participant.split('@')[0];
                console.log(`👁️ Auto-viewing status from: ${jid} [${new Date().toLocaleTimeString()}]`);
            }
            
            // View the status - THIS IS THE CRITICAL PART
            try {
                // Create read receipt
                const readReceipt = {
                    remoteJid: 'status@broadcast',
                    id: statusId,
                    participant: participant
                };
                
                // Mark as read (blue tick) if configured
                if (config.markAsRead) {
                    await sock.readMessages([readReceipt]);
                } else {
                    // Just send read receipt without marking as read
                    await sock.sendReceipt('status@broadcast', participant, [statusId]);
                }
                
                // Optional: download media (adds delay, so only if needed)
                if (config.downloadMedia && message.message) {
                    // Don't await this - let it happen in background
                    downloadStatusMedia(sock, message).catch(() => {});
                }
            } catch (error) {
                // Silent fail - don't let errors slow down processing
                if (!config.silentMode) {
                    console.error('❌ Error viewing status:', error.message);
                }
            }
        }
    } catch (error) {
        // Absolute minimal error handling
        const config = loadConfig();
        if (!config.silentMode) {
            console.error('❌ AutoStatus error:', error.message);
        }
    }
}

// Handle bulk status updates (multiple statuses at once)
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const config = loadConfig();
        if (!config.enabled || !statusMessages || statusMessages.length === 0) return;
        
        if (!config.silentMode) {
            console.log(`📊 Processing ${statusMessages.length} statuses in bulk...`);
        }
        
        // Process all statuses in parallel for maximum speed
        const viewPromises = statusMessages.map(async (message) => {
            if (!message.key || message.key.remoteJid !== 'status@broadcast') return;
            
            const statusId = message.key.id;
            if (viewedStatuses.has(statusId)) return;
            
            const participant = message.key.participant || message.key.remoteJid;
            if (!participant) return;
            
            // Skip own statuses
            const isOwnStatus = participant === sock.user.id.split(':')[0] + '@s.whatsapp.net';
            if (isOwnStatus && !config.viewOwn) return;
            
            // Check contact
            const isContact = sock.store?.contacts ? !!sock.store.contacts[participant] : false;
            if (!config.viewContacts && isContact) return;
            if (!config.viewNonContacts && !isContact) return;
            
            viewedStatuses.add(statusId);
            
            try {
                if (config.markAsRead) {
                    await sock.readMessages([{
                        remoteJid: 'status@broadcast',
                        id: statusId,
                        participant: participant
                    }]);
                } else {
                    await sock.sendReceipt('status@broadcast', participant, [statusId]);
                }
                
                if (!config.silentMode) {
                    const jid = participant.split('@')[0];
                    console.log(`👁️ Bulk viewed: ${jid}`);
                }
            } catch (e) {
                // Silent fail
            }
        });
        
        // Wait for all view operations (but don't block too long)
        await Promise.allSettled(viewPromises);
        
    } catch (error) {
        if (!loadConfig().silentMode) {
            console.error('❌ Bulk status error:', error.message);
        }
    }
}

// Background download of status media (doesn't affect view speed)
async function downloadStatusMedia(sock, message) {
    try {
        if (!message.message) return;
        
        const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage'];
        let mediaType = null;
        let mediaContent = null;
        
        for (const type of mediaTypes) {
            if (message.message[type]) {
                mediaType = type;
                mediaContent = message.message[type];
                break;
            }
        }
        
        if (!mediaType || !mediaContent) return;
        
        // Create statuses download directory
        const statusDir = path.join(process.cwd(), 'status_downloads');
        if (!fs.existsSync(statusDir)) {
            fs.mkdirSync(statusDir, { recursive: true });
        }
        
        // Generate filename
        const timestamp = Date.now();
        const participant = message.key.participant?.split('@')[0] || 'unknown';
        let extension = '.bin';
        
        if (mediaType === 'imageMessage') extension = '.jpg';
        else if (mediaType === 'videoMessage') extension = '.mp4';
        else if (mediaType === 'audioMessage') extension = '.mp3';
        
        const filename = path.join(statusDir, `status_${participant}_${timestamp}${extension}`);
        
        // Download in background
        const stream = await downloadContentFromMessage(mediaContent, mediaType.replace('Message', ''));
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        fs.writeFileSync(filename, Buffer.concat(chunks));
        
        if (!loadConfig().silentMode) {
            console.log(`💾 Downloaded status: ${filename}`);
        }
    } catch (error) {
        // Silent fail for downloads
    }
}

// Command handler for .autostatus
async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const config = loadConfig();
        
        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const own = config.viewOwn ? '✅' : '❌';
            const contacts = config.viewContacts ? '✅' : '❌';
            const nonContacts = config.viewNonContacts ? '✅' : '❌';
            const read = config.markAsRead ? '✅' : '❌';
            const silent = config.silentMode ? '✅' : '❌';
            
            const statusText = `*📱 AUTO STATUS VIEWER*\n\n` +
                `*Status:* ${status}\n` +
                `*View Own:* ${own}\n` +
                `*View Contacts:* ${contacts}\n` +
                `*View Non-Contacts:* ${nonContacts}\n` +
                `*Mark as Read:* ${read}\n` +
                `*Silent Mode:* ${silent}\n\n` +
                `*Commands:*\n` +
                `• .autostatus on - Enable\n` +
                `• .autostatus off - Disable\n` +
                `• .autostatus viewown on/off\n` +
                `• .autostatus contacts on/off\n` +
                `• .autostatus noncontacts on/off\n` +
                `• .autostatus read on/off\n` +
                `• .autostatus silent on/off\n` +
                `• .autostatus stats - Show stats\n\n` +
                `*⚡ ULTRA FAST - Views within milliseconds!*`;
            
            await sock.sendMessage(chatId, { text: statusText }, { quoted: message });
            return;
        }
        
        const command = args[0].toLowerCase();
        
        // Enable/Disable
        if (command === 'on' || command === 'enable') {
            config.enabled = true;
            saveConfig(config);
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto Status Viewer ENABLED*\n\nNow viewing statuses instantly!'
            }, { quoted: message });
            return;
        }
        
        if (command === 'off' || command === 'disable') {
            config.enabled = false;
            saveConfig(config);
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto Status Viewer DISABLED*'
            }, { quoted: message });
            return;
        }
        
        // View own statuses
        if (command === 'viewown') {
            if (args[1]) {
                config.viewOwn = args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'true';
                saveConfig(config);
                await sock.sendMessage(chatId, { 
                    text: `✅ View own statuses: ${config.viewOwn ? 'ON' : 'OFF'}`
                }, { quoted: message });
            }
            return;
        }
        
        // View contacts
        if (command === 'contacts') {
            if (args[1]) {
                config.viewContacts = args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'true';
                saveConfig(config);
                await sock.sendMessage(chatId, { 
                    text: `✅ View contacts: ${config.viewContacts ? 'ON' : 'OFF'}`
                }, { quoted: message });
            }
            return;
        }
        
        // View non-contacts
        if (command === 'noncontacts') {
            if (args[1]) {
                config.viewNonContacts = args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'true';
                saveConfig(config);
                await sock.sendMessage(chatId, { 
                    text: `✅ View non-contacts: ${config.viewNonContacts ? 'ON' : 'OFF'}`
                }, { quoted: message });
            }
            return;
        }
        
        // Mark as read
        if (command === 'read') {
            if (args[1]) {
                config.markAsRead = args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'true';
                saveConfig(config);
                await sock.sendMessage(chatId, { 
                    text: `✅ Mark as read: ${config.markAsRead ? 'ON' : 'OFF'}`
                }, { quoted: message });
            }
            return;
        }
        
        // Silent mode
        if (command === 'silent') {
            if (args[1]) {
                config.silentMode = args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'true';
                saveConfig(config);
                await sock.sendMessage(chatId, { 
                    text: `✅ Silent mode: ${config.silentMode ? 'ON' : 'OFF'}`
                }, { quoted: message });
            }
            return;
        }
        
        // Show stats
        if (command === 'stats') {
            const viewedCount = viewedStatuses.size;
            await sock.sendMessage(chatId, { 
                text: `*📊 Auto Status Stats*\n\n` +
                    `• Statuses viewed this session: ${viewedCount}\n` +
                    `• Cache cleared every: 1 hour\n` +
                    `• Response time: < 100ms\n` +
                    `• Active: ${config.enabled ? 'Yes' : 'No'}`
            }, { quoted: message });
            return;
        }
        
        // Unknown command
        await sock.sendMessage(chatId, { 
            text: '❌ Unknown command. Use .autostatus with no arguments for help.'
        }, { quoted: message });
        
    } catch (error) {
        console.error('❌ AutoStatus command error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing command.'
        }, { quoted: message });
    }
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand
};
