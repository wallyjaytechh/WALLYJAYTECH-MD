const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map();
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Ensure tmp dir exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// Function to get folder size in MB
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

        return totalSize / (1024 * 1024); // Convert bytes to MB
    } catch (err) {
        console.error('Error getting folder size:', err);
        return 0;
    }
};

// Function to clean temp folder if size exceeds 200MB
const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);

        if (sizeMB > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error('Temp cleanup error:', err);
    }
};

// Start periodic cleanup check every 1 minute
setInterval(cleanTempFolderIfLarge, 60 * 1000);

// Load config
function loadAntideleteConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false, sendToBotDM: true };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch {
        return { enabled: false, sendToBotDM: true };
    }
}

// Save config
function saveAntideleteConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error('Config save error:', err);
    }
}

const isOwnerOrSudo = require('../lib/isOwner');

// Simple Command Handler
async function handleAntideleteCommand(sock, chatId, message, match) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

    if (!message.key.fromMe && !isOwner) {
        return sock.sendMessage(chatId, { text: '*Only the bot owner can use this command.*' }, { quoted: message });
    }

    const config = loadAntideleteConfig();

    if (!match) {
        const status = config.enabled ? '✅ ON' : '❌ OFF';
        const location = config.sendToBotDM ? 'Bot DM' : 'Original Chat';

        return sock.sendMessage(chatId, {
            text: `*🚨 ANTI-DELETE SETTINGS* 🚨\n\n` +
                `*Status:* ${status}\n` +
                `*Location:* ${location}\n\n` +
                `*Commands:*\n` +
                `• .antidelete on - Enable\n` +
                `• .antidelete off - Disable\n` +
                `• .antidelete dm - Send to bot DM\n` +
                `• .antidelete chat - Send to original chat`
        }, { quoted: message });
    }

    const action = match.toLowerCase();

    if (action === 'on') {
        config.enabled = true;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, {
            text: '✅ *Anti-delete ENABLED!*\n\nI will now recover deleted messages.'
        }, { quoted: message });
    }

    if (action === 'off') {
        config.enabled = false;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, {
            text: '❌ *Anti-delete DISABLED!*\n\nI will ignore deleted messages.'
        }, { quoted: message });
    }

    if (action === 'dm') {
        config.sendToBotDM = true;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, {
            text: '✅ *Recovery messages will be sent to BOT DM*'
        }, { quoted: message });
    }

    if (action === 'chat') {
        config.sendToBotDM = false;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, {
            text: '✅ *Recovery messages will be sent to ORIGINAL CHAT*'
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: '*❌ Invalid command!*\n\nUse *.antidelete* to see available commands.'
    }, { quoted: message });
}

// Store incoming messages
async function storeMessage(sock, message) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        if (!message.key?.id) return;

        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';

        const sender = message.key.participant || message.key.remoteJid;

        // Detect content
        if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            const buffer = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            const mime = message.message.audioMessage.mimetype || '';
            const ext = mime.includes('mpeg') ? 'mp3' : (mime.includes('ogg') ? 'ogg' : 'mp3');
            const buffer = await downloadContentFromMessage(message.message.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
            await writeFile(mediaPath, buffer);
        }

        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString()
        });

        // Log stored message for debugging
        console.log(`📝 Stored message ${messageId} from ${sender}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);

    } catch (err) {
        console.error('storeMessage error:', err);
    }
}

// Handle message deletion
async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        // FIXED: Get the correct message ID from protocolMessage.key
        const revokedMessageKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedMessageKey?.id) {
            console.log('❌ No valid revocation message key found');
            return;
        }

        const messageId = revokedMessageKey.id;
        const deletedBy = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const targetChat = config.sendToBotDM ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : revocationMessage.key.remoteJid;

        // Don't notify if bot deleted the message
        if (deletedBy.includes(sock.user.id)) return;

        const original = messageStore.get(messageId);
        if (!original) {
            console.log(`❌ Original message not found for ID: ${messageId}`);
            console.log(`📋 Currently stored messages:`, Array.from(messageStore.keys()));
            return;
        }

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const deleterName = deletedBy.split('@')[0];

        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Lagos',
            hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Get group name if it's a group
        let groupName = '';
        if (original.group) {
            try {
                const metadata = await sock.groupMetadata(original.group);
                groupName = metadata.subject || '';
            } catch (err) {
                console.error('Error getting group metadata:', err);
            }
        }

        // Send notification
        let text = `🚨 *DELETED MESSAGE RECOVERED* 🚨\n\n` +
            `🗑️ *Deleted By:* @${deleterName}\n` +
            `👤 *Original Sender:* @${senderName}\n` +
            `📱 *Sender Number:* ${sender}\n` +
            `🕒 *Time:* ${time}\n`;

        if (groupName) {
            text += `👥 *Group:* ${groupName}\n`;
        }

        if (original.content) {
            text += `\n💬 *Message:*\n${original.content}`;
        } else if (original.mediaType) {
            text += `\n📄 *Media Type:* ${original.mediaType.toUpperCase()}`;
        }

        await sock.sendMessage(targetChat, {
            text,
            mentions: [deletedBy, sender]
        });

        // Send media if exists
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `📄 *Deleted ${original.mediaType.toUpperCase()}*\nFrom: @${senderName}`,
                mentions: [sender]
            };

            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, {
                            image: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(targetChat, {
                            sticker: { url: original.mediaPath }
                        });
                        // Send caption separately for stickers
                        await sock.sendMessage(targetChat, { text: mediaOptions.caption });
                        break;
                    case 'video':
                        await sock.sendMessage(targetChat, {
                            video: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'audio':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: 'audio/mpeg',
                            ptt: false
                        });
                        // Send caption separately for audio
                        await sock.sendMessage(targetChat, { text: mediaOptions.caption });
                        break;
                }
            } catch (err) {
                console.error('Error sending media:', err);
                await sock.sendMessage(targetChat, {
                    text: `⚠️ Error sending ${original.mediaType}: ${err.message}`
                });
            }

            // Cleanup media file
            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {
                console.error('Media cleanup error:', err);
            }
        }

        // Cleanup from memory
        messageStore.delete(messageId);
        console.log(`✅ Successfully recovered deleted message ${messageId}`);

    } catch (err) {
        console.error('handleMessageRevocation error:', err);
    }
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
