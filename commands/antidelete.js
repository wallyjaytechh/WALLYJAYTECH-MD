/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Anti-Delete Command - Recovers deleted messages instantly
 * Professional Version - All fixes applied
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
const isOwnerOrSudo = require('../lib/isOwner');

const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp/antidelete');
const messageStore = new Map();

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

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

function loadConfig() {
    try { if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (e) {}
    return { enabled: false, route: { private: 'dm', group: 'chat' } };
}

function saveConfig(config) { try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); } catch (e) {} }

function formatTimestamp() {
    return new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMessageType(msg) {
    if (!msg) return { type: 'unknown', emoji: '❓' };
    if (msg.conversation || msg.extendedTextMessage) return { type: 'text', emoji: '💬' };
    if (msg.imageMessage) return { type: 'image', emoji: '📷' };
    if (msg.videoMessage) return { type: 'video', emoji: '🎥' };
    if (msg.audioMessage) return { type: msg.audioMessage.ptt ? 'voice' : 'audio', emoji: msg.audioMessage.ptt ? '🎤' : '🎵' };
    if (msg.stickerMessage) return { type: 'sticker', emoji: '🎨' };
    if (msg.documentMessage) return { type: 'document', emoji: '📄' };
    if (msg.contactMessage) return { type: 'contact', emoji: '👤' };
    return { type: 'unknown', emoji: '❓' };
}

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;
        if (message.key?.remoteJid === 'status@broadcast') return;
        if (!message.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const groupJid = isGroup ? message.key.remoteJid : null;
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBot = sender === botJid || sender.includes(botJid.split('@')[0]);

        let content = '', mediaType = '', mediaPath = '', fileName = '';
        const msg = message.message || {};
        const msgType = getMessageType(msg);

        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.imageMessage) {
            mediaType = 'image'; content = msg.imageMessage.caption || '';
            try { const stream = await downloadContentFromMessage(msg.imageMessage, 'image'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`); await writeFile(mediaPath, Buffer.concat(chunks)); } catch (err) {}
        } else if (msg.videoMessage) {
            mediaType = 'video'; content = msg.videoMessage.caption || '';
            try { const stream = await downloadContentFromMessage(msg.videoMessage, 'video'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`); await writeFile(mediaPath, Buffer.concat(chunks)); } catch (err) {}
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            try { const stream = await downloadContentFromMessage(msg.audioMessage, 'audio'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.ogg`); await writeFile(mediaPath, Buffer.concat(chunks)); } catch (err) {}
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            try { const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`); await writeFile(mediaPath, Buffer.concat(chunks)); } catch (err) {}
        } else if (msg.documentMessage) {
            mediaType = 'document'; content = msg.documentMessage.caption || ''; fileName = msg.documentMessage.fileName || 'document';
            try { const stream = await downloadContentFromMessage(msg.documentMessage, 'document'); const chunks = []; for await (const chunk of stream) chunks.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`); await writeFile(mediaPath, Buffer.concat(chunks)); } catch (err) {}
        }

        messageStore.set(messageId, { id: messageId, content, mediaType, mediaPath, fileName, sender, isBot, group: groupJid, remoteJid: message.key.remoteJid, timestamp: Date.now(), type: msgType.type, emoji: msgType.emoji });
    } catch (err) { console.error('Store error:', err.message); }
}

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;
        if (revocationMessage.key?.remoteJid === 'status@broadcast') return;

        const revokedKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedKey?.id) return;

        const messageId = revokedKey.id;
        const isBotDeleting = revocationMessage.key.fromMe === true;
        const rawDeleter = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const originalChat = revokedKey.remoteJid;
        const isGroup = originalChat?.endsWith('@g.us');
        const original = messageStore.get(messageId);
        if (!original) return;

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Correct deleter name
        let deleterName, deleterMention;
        if (isBotDeleting) {
            deleterName = 'WALLYJAYTECH-MD (Bot)';
            deleterMention = botJid;
        } else {
            deleterName = `@${rawDeleter.split('@')[0]}`;
            deleterMention = rawDeleter;
        }

        // Correct sender name
        const isBotSender = original.isBot;
        const senderName = isBotSender ? 'WALLYJAYTECH-MD (Bot)' : `@${original.sender.split('@')[0]}`;
        const senderMention = isBotSender ? botJid : original.sender;

        let targetChat;
        if (!isGroup) {
            targetChat = config.route.private === 'dm' ? botJid : originalChat;
        } else {
            targetChat = config.route.group === 'chat' ? originalChat : botJid;
        }

        const time = formatTimestamp();

        let recoveryText = `┌──═━┈ *RECOVERED* ┈━═──┐\n\n`;
        recoveryText += `📌 *ID:* ${messageId}\n`;
        recoveryText += `👤 *From:* ${senderName}\n`;
        recoveryText += `🗑️ *By:* ${deleterName}\n`;
        recoveryText += `${original.emoji} *Type:* ${original.type.toUpperCase()}${original.content ? ' + caption' : ''}\n`;
        if (original.fileName) recoveryText += `📎 *File:* ${original.fileName}\n`;
        recoveryText += `🕒 *Time:* ${time}\n`;
        recoveryText += `📍 *Chat:* ${isGroup ? 'Group' : 'Private'}\n`;
        if (original.content) recoveryText += `\n💬 *Message:*\n${original.content}\n`;
        recoveryText += `\n🤖 WALLYJAYTECH-MD Antidelete\n`;
        recoveryText += `└──═━┈ *END REPORT* ┈━═──┘`;

        // Send recovery
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            let sentMedia;
            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, { image: { url: original.mediaPath }, caption: recoveryText, mentions: [senderMention, deleterMention] });
                        break;
                    case 'video':
                        await sock.sendMessage(targetChat, { video: { url: original.mediaPath }, caption: recoveryText, mentions: [senderMention, deleterMention] });
                        break;
                    case 'document':
                        await sock.sendMessage(targetChat, { document: { url: original.mediaPath }, fileName: original.fileName || 'document', caption: recoveryText, mentions: [senderMention, deleterMention] });
                        break;
                    case 'audio':
                        sentMedia = await sock.sendMessage(targetChat, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg' });
                        await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia });
                        break;
                    case 'voice':
                        sentMedia = await sock.sendMessage(targetChat, { audio: { url: original.mediaPath }, mimetype: 'audio/ogg; codecs=opus', ptt: true });
                        await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia });
                        break;
                    case 'sticker':
                        sentMedia = await sock.sendMessage(targetChat, { sticker: { url: original.mediaPath } });
                        await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia });
                        break;
                }
            } catch (err) {}
            try { fs.unlinkSync(original.mediaPath); } catch (err) {}
        } else {
            await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] });
        }

        console.log(`✅ Recovered ${original.type} from ${original.sender}`);
        messageStore.delete(messageId);
    } catch (err) { console.error('Recovery error:', err.message); }
}

async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const config = loadConfig();
        if (!Array.isArray(args)) args = args ? [args] : [];
        const cmd = args[0]?.toLowerCase();

        if (!cmd) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const privateRoute = config.route.private === 'dm' ? 'Bot DM' : 'Original Chat';
            const groupRoute = config.route.group === 'chat' ? 'Group Chat' : 'Bot DM';

            await sock.sendMessage(chatId, {
                text: `🛡️ *ANTI-DELETE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `📩 *Private Route:* ${privateRoute}\n` +
                      `👥 *Group Route:* ${groupRoute}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antidelete on - Enable recovery\n` +
                      `└ .antidelete off - Disable recovery\n` +
                      `└ .antidelete private dm - DMs to bot\n` +
                      `└ .antidelete private chat - DMs to chat\n` +
                      `└ .antidelete group chat - Group recovery in group\n` +
                      `└ .antidelete group dm - Group recovery to bot\n` +
                      `└ .antidelete status - Show settings\n` +
                      `└ .antidelete - Show this menu\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .antidelete on\n` +
                      `└ .antidelete group chat`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (cmd === 'on') {
            if (config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛡️ Anti-Delete is already *ON*.\n\n💡 Use .antidelete off to disable.`, ...channelInfo });
                return;
            }
            config.enabled = true; saveConfig(config);
            await sock.sendMessage(chatId, { text: `✅ *ANTI-DELETE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Deleted messages will now be recovered.\n📩 Private: ${config.route.private === 'dm' ? 'Bot DM' : 'Original Chat'}\n👥 Group: ${config.route.group === 'chat' ? 'Group Chat' : 'Bot DM'}\n🤖 Bot messages: Also recovered`, ...channelInfo });
        } else if (cmd === 'off') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛡️ Anti-Delete is already *OFF*.\n\n💡 Use .antidelete on to enable.`, ...channelInfo });
                return;
            }
            config.enabled = false; saveConfig(config);
            await sock.sendMessage(chatId, { text: `❌ *ANTI-DELETE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Deleted messages will no longer be recovered.`, ...channelInfo });
        } else if (cmd === 'private') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'dm') {
                if (config.route.private === 'dm') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n📩 Private route is already *Bot DM*.`, ...channelInfo }); return; }
                config.route.private = 'dm'; saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ *PRIVATE ROUTE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📩 Deleted private messages → *Bot DM*`, ...channelInfo });
            } else if (sub === 'chat') {
                if (config.route.private === 'chat') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n📩 Private route is already *Original Chat*.`, ...channelInfo }); return; }
                config.route.private = 'chat'; saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ *PRIVATE ROUTE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📩 Deleted private messages → *Original Chat*`, ...channelInfo });
            }
        } else if (cmd === 'group') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'chat') {
                if (config.route.group === 'chat') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n👥 Group route is already *Group Chat*.`, ...channelInfo }); return; }
                config.route.group = 'chat'; saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ *GROUP ROUTE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n👥 Deleted group messages → *Group Chat*`, ...channelInfo });
            } else if (sub === 'dm') {
                if (config.route.group === 'dm') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n👥 Group route is already *Bot DM*.`, ...channelInfo }); return; }
                config.route.group = 'dm'; saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ *GROUP ROUTE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n👥 Deleted group messages → *Bot DM*`, ...channelInfo });
            }
        } else if (cmd === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const privateRoute = config.route.private === 'dm' ? 'Bot DM' : 'Original Chat';
            const groupRoute = config.route.group === 'chat' ? 'Group Chat' : 'Bot DM';
            await sock.sendMessage(chatId, {
                text: `🛡️ *ANTI-DELETE STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `📩 *Private:* ${privateRoute}\n` +
                      `👥 *Group:* ${groupRoute}\n` +
                      `🤖 *Bot Messages:* Recovered\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use .antidelete to see all commands.`,
                ...channelInfo
            });
        }
    } catch (err) { console.error('Command error:', err); }
}

module.exports = { handleAntideleteCommand, handleMessageRevocation, storeMessage };
