//══════════════════════════════════════════════════════════════════════════════//
//                      PROFESSIONAL ANTI-DELETE SYSTEM v2.0                    //
//              Recovers deleted messages instantly with smart routing          //
//══════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

// ==================== CONFIGURATION ====================
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp/antidelete');
const MAX_TEMP_SIZE_MB = 500;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Message storage
const messageStore = new Map();
const deletedLog = new Map();

// Ensure temp directory exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get folder size in MB
 */
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }
        return totalSize / (1024 * 1024);
    } catch (err) {
        console.error('❌ Error getting folder size:', err.message);
        return 0;
    }
};

/**
 * Clean temp folder if size exceeds limit
 */
const cleanTempFolder = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (sizeMB > MAX_TEMP_SIZE_MB) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            let deleted = 0;
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
                deleted++;
            }
            console.log(`🧹 Cleaned ${deleted} temp files (${sizeMB.toFixed(2)}MB -> 0MB)`);
        }
    } catch (err) {
        console.error('❌ Temp cleanup error:', err.message);
    }
};

// Periodic cleanup
setInterval(cleanTempFolder, CLEANUP_INTERVAL);

/**
 * Load configuration
 */
function loadConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            const defaultConfig = {
                enabled: false,
                route: {
                    private: 'dm',        // 'dm' or 'chat'
                    group: 'chat',        // 'chat' or 'dm'
                    fallback: 'dm'        // Where to send if group is locked
                }
            };
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch (err) {
        console.error('❌ Config load error:', err.message);
        return { enabled: false, route: { private: 'dm', group: 'chat', fallback: 'dm' } };
    }
}

/**
 * Save configuration
 */
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return true;
    } catch (err) {
        console.error('❌ Config save error:', err.message);
        return false;
    }
}

/**
 * Check if user is owner/sudo
 */
const isOwnerOrSudo = require('../lib/isOwner');

/**
 * Format timestamp
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: true
    });
}

/**
 * Get message type details
 */
function getMessageTypeDetails(message) {
    if (!message) return { type: 'unknown', emoji: '❓' };
    
    const typeMap = {
        conversation: { type: 'text', emoji: '💬' },
        extendedTextMessage: { type: 'text', emoji: '💬' },
        imageMessage: { type: 'image', emoji: '📷' },
        videoMessage: { type: 'video', emoji: '🎥' },
        audioMessage: { type: 'audio', emoji: '🎵' },
        stickerMessage: { type: 'sticker', emoji: '🎨' },
        documentMessage: { type: 'document', emoji: '📄' },
        contactMessage: { type: 'contact', emoji: '👤' },
        locationMessage: { type: 'location', emoji: '📍' },
        liveLocationMessage: { type: 'live_location', emoji: '📍' },
        voiceMessage: { type: 'voice', emoji: '🎤' }
    };

    for (const [key, value] of Object.entries(typeMap)) {
        if (message[key]) return value;
    }
    
    return { type: 'unknown', emoji: '❓' };
}

/**
 * Get group metadata with caching
 */
const groupCache = new Map();
async function getGroupMetadata(sock, groupJid) {
    try {
        if (groupCache.has(groupJid)) {
            const cached = groupCache.get(groupJid);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
                return cached.metadata;
            }
        }
        
        const metadata = await sock.groupMetadata(groupJid);
        groupCache.set(groupJid, { metadata, timestamp: Date.now() });
        return metadata;
    } catch (err) {
        console.error('❌ Group metadata error:', err.message);
        return null;
    }
}

/**
 * Check if bot can send to group
 */
async function canSendToGroup(sock, groupJid) {
    try {
        const metadata = await getGroupMetadata(sock, groupJid);
        if (!metadata) return false;
        
        // Check if bot is still in group
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isStillInGroup = metadata.participants.some(p => p.id === botJid);
        if (!isStillInGroup) return false;
        
        // Check if group is locked (only admins can send)
        const isLocked = metadata.announce === true;
        if (isLocked) {
            // Check if bot is admin
            const botParticipant = metadata.participants.find(p => p.id === botJid);
            return botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
        }
        
        return true;
    } catch {
        return false;
    }
}

/**
 * Determine target chat for recovery
 */
async function determineTargetChat(sock, config, originalChat, groupJid, deletedBy) {
    const route = config.route;
    
    // If it's a private chat (DM)
    if (!groupJid) {
        if (route.private === 'dm') {
            return sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Bot DM
        } else {
            return originalChat; // Original private chat
        }
    }
    
    // If it's a group
    if (groupJid) {
        if (route.group === 'chat') {
            const canSend = await canSendToGroup(sock, groupJid);
            if (canSend) {
                return groupJid; // Send to group
            } else {
                // Fallback to DM
                console.log(`⚠️ Cannot send to group (locked/removed), falling back to DM`);
                return sock.user.id.split(':')[0] + '@s.whatsapp.net';
            }
        } else {
            return sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Bot DM
        }
    }
    
    return sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Default fallback
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Store incoming messages for recovery
 */
async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        // Skip status broadcasts
        if (message.key?.remoteJid === 'status@broadcast') {
            return;
        }

        // Skip if no message ID
        if (!message.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const groupJid = isGroup ? message.key.remoteJid : null;
        
        // Don't store own messages
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (sender === botJid) return;

        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let fileName = '';
        let fileSize = 0;
        let mimeType = '';

        // Extract message content based on type
        const msg = message.message || {};
        const msgType = getMessageTypeDetails(msg);

        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.imageMessage) {
            mediaType = 'image';
            content = msg.imageMessage.caption || '';
            fileName = msg.imageMessage.fileName || `image_${Date.now()}.jpg`;
            fileSize = msg.imageMessage.fileLength || 0;
            mimeType = msg.imageMessage.mimetype || 'image/jpeg';
            
            try {
                const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
            } catch (err) {
                console.error('❌ Image download error:', err.message);
            }
        } else if (msg.videoMessage) {
            mediaType = 'video';
            content = msg.videoMessage.caption || '';
            fileName = msg.videoMessage.fileName || `video_${Date.now()}.mp4`;
            fileSize = msg.videoMessage.fileLength || 0;
            mimeType = msg.videoMessage.mimetype || 'video/mp4';
            
            try {
                const stream = await downloadContentFromMessage(msg.videoMessage, 'video');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
            } catch (err) {
                console.error('❌ Video download error:', err.message);
            }
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            const ext = msg.audioMessage.mimetype?.includes('ogg') ? 'ogg' : (msg.audioMessage.mimetype?.includes('mp4') ? 'm4a' : 'mp3');
            fileName = msg.audioMessage.fileName || `audio_${Date.now()}.${ext}`;
            fileSize = msg.audioMessage.fileLength || 0;
            mimeType = msg.audioMessage.mimetype || 'audio/mpeg';
            
            try {
                const stream = await downloadContentFromMessage(msg.audioMessage, 'audio');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
                await writeFile(mediaPath, buffer);
            } catch (err) {
                console.error('❌ Audio download error:', err.message);
            }
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            fileName = `sticker_${Date.now()}.webp`;
            fileSize = msg.stickerMessage.fileLength || 0;
            mimeType = 'image/webp';
            
            try {
                const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
                await writeFile(mediaPath, buffer);
            } catch (err) {
                console.error('❌ Sticker download error:', err.message);
            }
        } else if (msg.documentMessage) {
            mediaType = 'document';
            content = msg.documentMessage.caption || '';
            fileName = msg.documentMessage.fileName || `document_${Date.now()}.bin`;
            fileSize = msg.documentMessage.fileLength || 0;
            mimeType = msg.documentMessage.mimetype || 'application/octet-stream';
            
            try {
                const stream = await downloadContentFromMessage(msg.documentMessage, 'document');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`);
                await writeFile(mediaPath, buffer);
            } catch (err) {
                console.error('❌ Document download error:', err.message);
            }
        } else if (msg.contactMessage) {
            mediaType = 'contact';
            content = JSON.stringify(msg.contactMessage);
        } else if (msg.locationMessage) {
            mediaType = 'location';
            content = JSON.stringify(msg.locationMessage);
        }

        // Store message data
        messageStore.set(messageId, {
            id: messageId,
            content,
            mediaType,
            mediaPath,
            fileName,
            fileSize,
            mimeType,
            sender,
            group: groupJid,
            remoteJid: message.key.remoteJid,
            timestamp: Date.now(),
            messageType: msgType.type,
            emoji: msgType.emoji,
            fromMe: message.key.fromMe || false
        });

    } catch (err) {
        console.error('❌ storeMessage error:', err.message);
    }
}

/**
 * Handle message revocation (deletion)
 */
async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        // Skip status broadcasts
        if (revocationMessage.key?.remoteJid === 'status@broadcast') return;

        // Get revoked message key
        const revokedKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedKey?.id) {
            return;
        }

        const messageId = revokedKey.id;
        const deletedBy = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const originalChat = revokedKey.remoteJid;
        const isGroup = originalChat?.endsWith('@g.us');
        const groupJid = isGroup ? originalChat : null;

        // Get original message
        const original = messageStore.get(messageId);
        if (!original) {
            return;
        }

        // Don't recover if bot deleted it (optional - remove if you want to recover bot deletions)
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (deletedBy === botJid) return;

        // Determine target chat for recovery
        const targetChat = await determineTargetChat(sock, config, originalChat, groupJid, deletedBy);
        
        // Format sender info
        const senderNumber = original.sender.split('@')[0];
        const deleterNumber = deletedBy.split('@')[0];

        // Get group name if applicable
        let groupName = '';
        if (groupJid) {
            const metadata = await getGroupMetadata(sock, groupJid);
            groupName = metadata?.subject || 'Unknown Group';
        }

        // Create recovery message
        const timestamp = formatTimestamp(original.timestamp);
        const msgType = original.messageType.toUpperCase();
        const emoji = original.emoji;

        // Build message
        let recoveryText = `🚨 *MESSAGE RECOVERED* 🚨\n\n`;
        recoveryText += `${emoji} *Type:* ${msgType}\n`;
        recoveryText += `👤 *Sender:* @${senderNumber}\n`;
        recoveryText += `🗑️ *Deleted by:* @${deleterNumber}\n`;
        recoveryText += `🕒 *Time:* ${timestamp}\n`;
        
        if (groupName) {
            recoveryText += `👥 *Group:* ${groupName}\n`;
        }
        
        if (original.fileName) {
            recoveryText += `📎 *File:* ${original.fileName}\n`;
        }
        
        if (original.content) {
            recoveryText += `\n💬 *Message:*\n${original.content}\n`;
        }

        recoveryText += `\n🔒 *WALLYJAYTECH-MD*`;

        // Send recovery message
        await sock.sendMessage(targetChat, {
            text: recoveryText,
            mentions: [original.sender, deletedBy]
        });

        // Send media if exists
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, {
                            image: { url: original.mediaPath },
                            caption: `📎 Recovered image from @${senderNumber}`,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'video':
                        await sock.sendMessage(targetChat, {
                            video: { url: original.mediaPath },
                            caption: `📎 Recovered video from @${senderNumber}`,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'audio':
                    case 'voice':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: original.mimeType || 'audio/mpeg',
                            ptt: original.mediaType === 'voice'
                        });
                        break;
                        
                    case 'sticker':
                        await sock.sendMessage(targetChat, {
                            sticker: { url: original.mediaPath }
                        });
                        break;
                        
                    case 'document':
                        await sock.sendMessage(targetChat, {
                            document: { url: original.mediaPath },
                            fileName: original.fileName || 'document.bin',
                            mimetype: original.mimeType,
                            caption: `📎 Recovered document from @${senderNumber}`,
                            mentions: [original.sender]
                        });
                        break;
                }
                
                // Log recovery
                console.log(`✅ Recovered [${emoji}] from ${senderNumber}`);
                
                // Cleanup media file
                try {
                    fs.unlinkSync(original.mediaPath);
                } catch (err) {}
                
            } catch (err) {
                console.error('❌ Media send error:', err.message);
            }
        }

        // Remove from store
        messageStore.delete(messageId);

    } catch (err) {
        console.error('❌ handleMessageRevocation error:', err.message);
    }
}

/**
 * Anti-delete command handler - SIMPLIFIED for compatibility
 */
async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Only the bot owner can use this command.*' 
            }, { quoted: message });
            return;
        }

        const config = loadConfig();
        
        // Handle different arguments
        if (args && args.length > 0) {
            const action = args[0].toLowerCase();
            
            if (action === 'on') {
                config.enabled = true;
                saveConfig(config);
                await sock.sendMessage(chatId, {
                    text: '✅ *Anti-delete ENABLED*\n\nI will now recover deleted messages.'
                }, { quoted: message });
                return;
            }
            
            if (action === 'off') {
                config.enabled = false;
                saveConfig(config);
                await sock.sendMessage(chatId, {
                    text: '❌ *Anti-delete DISABLED*\n\nI will ignore deleted messages.'
                }, { quoted: message });
                return;
            }
            
            if (action === 'private') {
                if (args[1] === 'dm') {
                    config.route.private = 'dm';
                    saveConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '✅ *Private messages will be sent to BOT DM*'
                    }, { quoted: message });
                    return;
                }
                if (args[1] === 'chat') {
                    config.route.private = 'chat';
                    saveConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '✅ *Private messages will be sent to ORIGINAL CHAT*'
                    }, { quoted: message });
                    return;
                }
            }
            
            if (action === 'group') {
                if (args[1] === 'chat') {
                    config.route.group = 'chat';
                    saveConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '✅ *Group messages will be sent to GROUP CHAT*'
                    }, { quoted: message });
                    return;
                }
                if (args[1] === 'dm') {
                    config.route.group = 'dm';
                    saveConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '✅ *Group messages will be sent to BOT DM*'
                    }, { quoted: message });
                    return;
                }
            }
            
            if (action === 'stats') {
                const storedCount = messageStore.size;
                const tempSize = getFolderSizeInMB(TEMP_MEDIA_DIR).toFixed(2);
                await sock.sendMessage(chatId, {
                    text: `*📊 ANTI-DELETE STATS*\n\n` +
                          `• Stored: ${storedCount} messages\n` +
                          `• Temp Size: ${tempSize} MB\n` +
                          `• Status: ${config.enabled ? '✅ Active' : '❌ Inactive'}`
                }, { quoted: message });
                return;
            }
        }
        
        // Show settings if no valid command
        const status = config.enabled ? '✅ ON' : '❌ OFF';
        const privateRoute = config.route.private === 'dm' ? 'Bot DM' : 'Original Chat';
        const groupRoute = config.route.group === 'chat' ? 'Group Chat' : 'Bot DM';
        
        const settingsText = `*🚨 ANTI-DELETE SETTINGS*\n\n` +
            `*Status:* ${status}\n` +
            `*Private Route:* ${privateRoute}\n` +
            `*Group Route:* ${groupRoute}\n\n` +
            `*Commands:*\n` +
            `• .antidelete on - Enable\n` +
            `• .antidelete off - Disable\n` +
            `• .antidelete private dm - Send to DM\n` +
            `• .antidelete private chat - Send to chat\n` +
            `• .antidelete group chat - Send to group\n` +
            `• .antidelete group dm - Send to DM\n` +
            `• .antidelete stats - View stats`;

        await sock.sendMessage(chatId, {
            text: settingsText
        }, { quoted: message });

    } catch (err) {
        console.error('❌ Command error:', err.message);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command.'
        }, { quoted: message });
    }
}

// ==================== EXPORTS ====================
module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
