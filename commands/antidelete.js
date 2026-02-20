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
                    group: 'chat',        // 'chat' or 'dm'  (changed from 'group' to 'chat')
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
        if (route.group === 'chat') {  // Changed from 'group' to 'chat'
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
        
        // Don't store own messages if they're not from someone else in group
        if (sender === sock.user.id) return;

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
            
            const buffer = await downloadContentFromMessage(msg.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (msg.videoMessage) {
            mediaType = 'video';
            content = msg.videoMessage.caption || '';
            fileName = msg.videoMessage.fileName || `video_${Date.now()}.mp4`;
            fileSize = msg.videoMessage.fileLength || 0;
            mimeType = msg.videoMessage.mimetype || 'video/mp4';
            
            const buffer = await downloadContentFromMessage(msg.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            const ext = msg.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
            fileName = msg.audioMessage.fileName || `audio_${Date.now()}.${ext}`;
            fileSize = msg.audioMessage.fileLength || 0;
            mimeType = msg.audioMessage.mimetype || 'audio/mpeg';
            
            const buffer = await downloadContentFromMessage(msg.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
            await writeFile(mediaPath, buffer);
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            fileName = `sticker_${Date.now()}.webp`;
            fileSize = msg.stickerMessage.fileLength || 0;
            mimeType = 'image/webp';
            
            const buffer = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (msg.documentMessage) {
            mediaType = 'document';
            content = msg.documentMessage.caption || '';
            fileName = msg.documentMessage.fileName || `document_${Date.now()}.bin`;
            fileSize = msg.documentMessage.fileLength || 0;
            mimeType = msg.documentMessage.mimetype || 'application/octet-stream';
            
            const buffer = await downloadContentFromMessage(msg.documentMessage, 'document');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`);
            await writeFile(mediaPath, buffer);
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
            console.log('❌ Invalid revocation message');
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
            console.log(`❌ Original message not found: ${messageId}`);
            return;
        }

        // Determine target chat for recovery
        const targetChat = await determineTargetChat(sock, config, originalChat, groupJid, deletedBy);
        
        // Format sender info
        const senderNumber = original.sender.split('@')[0];
        const deleterNumber = deletedBy.split('@')[0];
        const botNumber = sock.user.id.split(':')[0];

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

        // Build header
        let header = `╔═══════════◥◣✦◢◤═══════════╗\n`;
        header += `┃    🚨 *MESSAGE RECOVERED* 🚨\n`;
        header += `╚═══════════◢◤✦◥◣═══════════╝\n\n`;

        // Message details
        let details = `*📋 DETAILS*\n`;
        details += `┌─────────────────────\n`;
        details += `│ ${emoji} *Type:* ${msgType}\n`;
        details += `│ 👤 *Sender:* @${senderNumber}\n`;
        details += `│ 🗑️ *Deleted by:* @${deleterNumber}\n`;
        details += `│ 🕒 *Time:* ${timestamp}\n`;
        
        if (groupName) {
            details += `│ 👥 *Group:* ${groupName}\n`;
        }
        
        if (original.fileName) {
            details += `│ 📎 *File:* ${original.fileName}\n`;
        }
        
        if (original.fileSize) {
            const size = (original.fileSize / 1024).toFixed(2);
            details += `│ 📊 *Size:* ${size} KB\n`;
        }
        
        details += `└─────────────────────\n`;

        // Message content
        let content = '';
        if (original.content) {
            content += `\n*💬 CONTENT*\n`;
            content += `┌─────────────────────\n`;
            content += `│ ${original.content}\n`;
            content += `└─────────────────────\n`;
        }

        // Footer
        let footer = `\n╔═══════════◥◣✦◢◤═══════════╗\n`;
        footer += `┃     🔒 *WALLYJAYTECH-MD*   \n`;
        footer += `╚═══════════◢◤✦◥◣═══════════╝`;

        const fullMessage = header + details + content + footer;

        // Send recovery message
        await sock.sendMessage(targetChat, {
            text: fullMessage,
            mentions: [original.sender, deletedBy]
        });

        // Send media if exists
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaCaption = `📎 *Recovered ${original.mediaType.toUpperCase()}*\nFrom: @${senderNumber}`;
            
            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, {
                            image: { url: original.mediaPath },
                            caption: mediaCaption,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'video':
                        await sock.sendMessage(targetChat, {
                            video: { url: original.mediaPath },
                            caption: mediaCaption,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'audio':
                    case 'voice':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: original.mimeType || 'audio/mpeg',
                            ptt: original.mediaType === 'voice',
                            mentions: [original.sender]
                        });
                        await sock.sendMessage(targetChat, {
                            text: mediaCaption
                        });
                        break;
                        
                    case 'sticker':
                        await sock.sendMessage(targetChat, {
                            sticker: { url: original.mediaPath }
                        });
                        await sock.sendMessage(targetChat, {
                            text: mediaCaption,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'document':
                        await sock.sendMessage(targetChat, {
                            document: { url: original.mediaPath },
                            fileName: original.fileName || 'document.bin',
                            mimetype: original.mimeType,
                            caption: mediaCaption,
                            mentions: [original.sender]
                        });
                        break;
                        
                    case 'contact':
                        await sock.sendMessage(targetChat, {
                            contacts: {
                                displayName: 'Recovered Contact',
                                contacts: [JSON.parse(original.content)]
                            }
                        });
                        break;
                }
                
                // Log recovery
                console.log(`✅ Recovered [${original.emoji}] ${messageId} from ${senderNumber} → ${targetChat.includes('g.us') ? 'Group' : 'DM'}`);
                
                // Track deleted message
                deletedLog.set(messageId, {
                    ...original,
                    recoveredAt: Date.now(),
                    recoveredTo: targetChat
                });

                // Cleanup media file
                try {
                    fs.unlinkSync(original.mediaPath);
                } catch (err) {
                    console.error('⚠️ Media cleanup error:', err.message);
                }
                
            } catch (err) {
                console.error('❌ Media send error:', err.message);
                await sock.sendMessage(targetChat, {
                    text: `⚠️ Error sending media: ${err.message}`
                });
            }
        }

        // Remove from store
        messageStore.delete(messageId);

    } catch (err) {
        console.error('❌ handleMessageRevocation error:', err.message);
    }
}

/**
 * Anti-delete command handler
 */
async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            return sock.sendMessage(chatId, { 
                text: '❌ *Only the bot owner can use this command.*' 
            }, { quoted: message });
        }

        const config = loadConfig();
        const action = args[0]?.toLowerCase();

        // Show settings if no action
        if (!action) {
            const status = config.enabled ? '✅ ON' : '❌ OFF';
            const privateRoute = config.route.private === 'dm' ? 'Bot DM' : 'Original Chat';
            const groupRoute = config.route.group === 'chat' ? 'Group Chat' : 'Bot DM';  // Changed display text
            
            const settingsText = `╔══════════════════════╗
║  🚨 *ANTI-DELETE* 🚨
╚══════════════════════╝

*📊 CURRENT SETTINGS*

┌─────────────────────
│ *Status:* ${status}
│ *Private Msg Route:* ${privateRoute}
│ *Group Msg Route:* ${groupRoute}
│ *Fallback:* Bot DM
└─────────────────────

*⚡ COMMANDS*

┌─────────────────────
│ • *.antidelete on* - Enable
│ • *.antidelete off* - Disable
│ • *.antidelete private dm* - Send to DM
│ • *.antidelete private chat* - Send to chat
│ • *.antidelete group chat* - Send to group chat
│ • *.antidelete group dm* - Send to DM
│ • *.antidelete stats* - View stats
└─────────────────────

*📌 NOTE*
• If group is locked, falls back to DM
• All media is recovered immediately
• Works in DMs and Groups

╔══════════════════════╗
║  🔒 WALLYJAYTECH-MD
╚══════════════════════╝`;

            return sock.sendMessage(chatId, {
                text: settingsText
            }, { quoted: message });
        }

        // Handle different actions
        if (action === 'on') {
            config.enabled = true;
            saveConfig(config);
            return sock.sendMessage(chatId, {
                text: '✅ *Anti-delete ENABLED*\n\nI will now recover all deleted messages instantly.'
            }, { quoted: message });
        }

        if (action === 'off') {
            config.enabled = false;
            saveConfig(config);
            return sock.sendMessage(chatId, {
                text: '❌ *Anti-delete DISABLED*\n\nI will ignore deleted messages.'
            }, { quoted: message });
        }

        if (action === 'private') {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'dm') {
                config.route.private = 'dm';
                saveConfig(config);
                return sock.sendMessage(chatId, {
                    text: '✅ *Private messages will be sent to BOT DM*'
                }, { quoted: message });
            }
            if (subAction === 'chat') {
                config.route.private = 'chat';
                saveConfig(config);
                return sock.sendMessage(chatId, {
                    text: '✅ *Private messages will be sent to ORIGINAL CHAT*'
                }, { quoted: message });
            }
        }

        if (action === 'group') {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'chat') {  // Changed from 'group' to 'chat'
                config.route.group = 'chat';
                saveConfig(config);
                return sock.sendMessage(chatId, {
                    text: '✅ *Group messages will be sent to GROUP CHAT (falls back to DM if locked)*'
                }, { quoted: message });
            }
            if (subAction === 'dm') {
                config.route.group = 'dm';
                saveConfig(config);
                return sock.sendMessage(chatId, {
                    text: '✅ *Group messages will be sent to BOT DM*'
                }, { quoted: message });
            }
        }

        if (action === 'stats') {
            const storedCount = messageStore.size;
            const deletedCount = deletedLog.size;
            const tempSize = getFolderSizeInMB(TEMP_MEDIA_DIR).toFixed(2);
            
            return sock.sendMessage(chatId, {
                text: `*📊 ANTI-DELETE STATS*\n\n` +
                      `• Stored Messages: ${storedCount}\n` +
                      `• Recovered Messages: ${deletedCount}\n` +
                      `• Temp Folder Size: ${tempSize} MB\n` +
                      `• Max Temp Size: ${MAX_TEMP_SIZE_MB} MB\n\n` +
                      `*Status:* ${config.enabled ? '✅ Active' : '❌ Inactive'}`
            }, { quoted: message });
        }

        // Invalid command
        return sock.sendMessage(chatId, {
            text: '❌ *Invalid command!*\n\nUse *.antidelete* to see available commands.'
        }, { quoted: message });

    } catch (err) {
        console.error('❌ Command error:', err.message);
        return sock.sendMessage(chatId, {
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
