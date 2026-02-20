//══════════════════════════════════════════════════════════════════════════════//
//                      PROFESSIONAL ANTI-DELETE SYSTEM v2.0                    //
//              Recovers deleted messages instantly with smart routing          //
//══════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

// ==================== CONFIGURATION ====================
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp/antidelete');

// Message storage
const messageStore = new Map();

// Ensure directories exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

// ==================== CONFIG FUNCTIONS ====================

// Load configuration
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    
    // Default config
    return {
        enabled: false,
        route: {
            private: 'dm',    // 'dm' or 'chat'
            group: 'chat'      // 'chat' or 'dm'
        }
    };
}

// Save configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (e) {}
}

// ==================== UTILITY FUNCTIONS ====================

// Format timestamp
function formatTimestamp() {
    const date = new Date();
    return date.toLocaleString('en-US', {
        timeZone: 'Africa/Lagos',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Get message type
function getMessageType(msg) {
    if (!msg) return { type: 'unknown', emoji: '❓' };
    
    if (msg.conversation || msg.extendedTextMessage) return { type: 'text', emoji: '💬' };
    if (msg.imageMessage) return { type: 'image', emoji: '📷' };
    if (msg.videoMessage) return { type: 'video', emoji: '🎥' };
    if (msg.audioMessage) {
        const isVoice = msg.audioMessage.ptt === true;
        return { type: isVoice ? 'voice' : 'audio', emoji: isVoice ? '🎤' : '🎵' };
    }
    if (msg.stickerMessage) return { type: 'sticker', emoji: '🎨' };
    if (msg.documentMessage) return { type: 'document', emoji: '📄' };
    if (msg.contactMessage) return { type: 'contact', emoji: '👤' };
    
    return { type: 'unknown', emoji: '❓' };
}

// ==================== STORE MESSAGES ====================

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        // Skip status broadcasts
        if (message.key?.remoteJid === 'status@broadcast') return;

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

        const msg = message.message || {};
        const msgType = getMessageType(msg);

        // Extract content based on type
        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.imageMessage) {
            mediaType = 'image';
            content = msg.imageMessage.caption || '';
            fileName = msg.imageMessage.fileName || `image_${Date.now()}.jpg`;
            
            try {
                const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
            } catch (err) {}
        } else if (msg.videoMessage) {
            mediaType = 'video';
            content = msg.videoMessage.caption || '';
            fileName = msg.videoMessage.fileName || `video_${Date.now()}.mp4`;
            
            try {
                const stream = await downloadContentFromMessage(msg.videoMessage, 'video');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
            } catch (err) {}
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            const ext = msg.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
            fileName = msg.audioMessage.fileName || `audio_${Date.now()}.${ext}`;
            
            try {
                const stream = await downloadContentFromMessage(msg.audioMessage, 'audio');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
                await writeFile(mediaPath, buffer);
            } catch (err) {}
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            fileName = `sticker_${Date.now()}.webp`;
            
            try {
                const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
                await writeFile(mediaPath, buffer);
            } catch (err) {}
        } else if (msg.documentMessage) {
            mediaType = 'document';
            content = msg.documentMessage.caption || '';
            fileName = msg.documentMessage.fileName || `document_${Date.now()}.bin`;
            
            try {
                const stream = await downloadContentFromMessage(msg.documentMessage, 'document');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`);
                await writeFile(mediaPath, buffer);
            } catch (err) {}
        }

        // Store message
        messageStore.set(messageId, {
            id: messageId,
            content,
            mediaType,
            mediaPath,
            fileName,
            sender,
            group: groupJid,
            remoteJid: message.key.remoteJid,
            timestamp: Date.now(),
            type: msgType.type,
            emoji: msgType.emoji
        });

    } catch (err) {
        console.error('Store error:', err.message);
    }
}

// ==================== HANDLE DELETION ====================

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        // Skip status broadcasts
        if (revocationMessage.key?.remoteJid === 'status@broadcast') return;

        // Get deleted message ID
        const revokedKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedKey?.id) return;

        const messageId = revokedKey.id;
        const deletedBy = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const originalChat = revokedKey.remoteJid;
        const isGroup = originalChat?.endsWith('@g.us');

        // Get original message
        const original = messageStore.get(messageId);
        if (!original) return;

        // Don't recover bot's own deletions
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (deletedBy === botJid) return;

        // Determine where to send recovery
        let targetChat;
        if (!isGroup) {
            // Private chat
            targetChat = config.route.private === 'dm' 
                ? botJid  // Bot DM
                : originalChat;  // Original chat
        } else {
            // Group chat
            if (config.route.group === 'chat') {
                targetChat = originalChat; // Send to group
            } else {
                targetChat = botJid; // Send to bot DM
            }
        }

        // Format sender numbers
        const senderNum = original.sender.split('@')[0];
        const deleterNum = deletedBy.split('@')[0];

        // Create recovery message
        const time = formatTimestamp();
        let recoveryText = `┌──═━┈ *MESSAGE RECOVERED* ┈━═──┐\n\n`;
        recoveryText += `${original.emoji} *Type:* ${original.type.toUpperCase()}\n`;
        recoveryText += `👤 *Sender:* @${senderNum}\n`;
        recoveryText += `🗑️ *Deleted by:* @${deleterNum}\n`;
        recoveryText += `🕒 *Time:* ${time}\n`;
        
        if (original.fileName) {
            recoveryText += `📎 *File:* ${original.fileName}\n`;
        }
        
        if (original.content) {
            recoveryText += `\n💬 *Message:*\n${original.content}\n`;
        }

        recoveryText += `\n└──═━┈ *WALLYJAYTECH-MD* ┈━═──┘`;

        // Send recovery message
        await sock.sendMessage(targetChat, {
            text: recoveryText,
            mentions: [original.sender, deletedBy]
        });

        // Send media if exists
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            try {
                const caption = `📎 Recovered ${original.mediaType} from @${senderNum}`;
                
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, {
                            image: { url: original.mediaPath },
                            caption,
                            mentions: [original.sender]
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(targetChat, {
                            video: { url: original.mediaPath },
                            caption,
                            mentions: [original.sender]
                        });
                        break;
                    case 'audio':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: 'audio/mpeg'
                        });
                        break;
                    case 'voice':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: 'audio/ogg; codecs=opus',
                            ptt: true
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
                            caption,
                            mentions: [original.sender]
                        });
                        break;
                }
            } catch (err) {}

            // Cleanup media
            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {}
        }

        console.log(`✅ Recovered ${original.type} from ${senderNum}`);
        
        // Remove from store
        messageStore.delete(messageId);

    } catch (err) {
        console.error('Recovery error:', err.message);
    }
}

// ==================== COMMAND HANDLER ====================

async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const config = loadConfig();
        
        // Ensure args is array
        if (!Array.isArray(args)) {
            args = args ? [args] : [];
        }

        const cmd = args[0]?.toLowerCase();

        // Show settings
        if (!cmd) {
            const status = config.enabled ? '✅ ON' : '❌ OFF';
            const privateRoute = config.route.private === 'dm' ? 'Bot DM' : 'Original Chat';
            const groupRoute = config.route.group === 'chat' ? 'Group Chat' : 'Bot DM';

            const text = `┌──═━┈ *ANTI-DELETE* ┈━═──┐\n\n` +
                `*Status:* ${status}\n` +
                `*Private:* ${privateRoute}\n` +
                `*Group:* ${groupRoute}\n\n` +
                `*Commands:*\n` +
                `• .antidelete on\n` +
                `• .antidelete off\n` +
                `• .antidelete private dm\n` +
                `• .antidelete private chat\n` +
                `• .antidelete group chat\n` +
                `• .antidelete group dm\n\n` +
                `└──═━┈ *WALLYJAYTECH-MD* ┈━═──┘`;

            await sock.sendMessage(chatId, { text }, { quoted: message });
            return;
        }

        // Handle commands
        if (cmd === 'on') {
            config.enabled = true;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: '✅ *Anti-delete ENABLED*' }, { quoted: message });
        }
        else if (cmd === 'off') {
            config.enabled = false;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: '❌ *Anti-delete DISABLED*' }, { quoted: message });
        }
        else if (cmd === 'private') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'dm') {
                config.route.private = 'dm';
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Private messages → Bot DM' }, { quoted: message });
            }
            else if (sub === 'chat') {
                config.route.private = 'chat';
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Private messages → Original Chat' }, { quoted: message });
            }
        }
        else if (cmd === 'group') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'chat') {
                config.route.group = 'chat';
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Group messages → Group Chat' }, { quoted: message });
            }
            else if (sub === 'dm') {
                config.route.group = 'dm';
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Group messages → Bot DM' }, { quoted: message });
            }
        }
        else {
            await sock.sendMessage(chatId, { text: '❌ Unknown command' }, { quoted: message });
        }

    } catch (err) {
        console.error('Command error:', err);
        await sock.sendMessage(chatId, { text: '❌ Error' }, { quoted: message });
    }
}

// ==================== EXPORTS ====================
module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
