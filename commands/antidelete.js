//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
const isOwnerOrSudo = require('../lib/isOwner');

const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp/antidelete');
const messageStore = new Map();
const statusStore = new Map();

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_MEDIA_DIR);
        const now = Date.now();
        for (const file of files) {
            const fp = path.join(TEMP_MEDIA_DIR, file);
            if (now - fs.statSync(fp).mtimeMs > 30000) fs.unlinkSync(fp);
        }
    } catch (e) {}
}, 10000);

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
    return { enabled: false, statusEnabled: false, statusRoute: 'dm', route: { private: 'chat', group: 'chat' } };
}
function saveConfig(config) { try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); } catch (e) {} }

function formatTimestamp() {
    return new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMessageType(msg) {
    if (!msg) return { type: 'UNKNOWN', emoji: '❓' };
    if (msg.conversation || msg.extendedTextMessage) return { type: 'TEXT', emoji: '💬' };
    if (msg.imageMessage) return { type: 'IMAGE', emoji: '📷' };
    if (msg.videoMessage) return { type: 'VIDEO', emoji: '🎥' };
    if (msg.audioMessage) return { type: msg.audioMessage.ptt ? 'VOICE NOTE' : 'AUDIO', emoji: msg.audioMessage.ptt ? '🎤' : '🎵' };
    if (msg.stickerMessage) return { type: 'STICKER', emoji: '🎨' };
    if (msg.documentMessage) return { type: 'DOCUMENT', emoji: '📄' };
    return { type: 'UNKNOWN', emoji: '❓' };
}

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!message.key?.id) return;
        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const isStatus = message.key.remoteJid === 'status@broadcast';
        const groupJid = isGroup ? message.key.remoteJid : null;
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (isStatus && !config.statusEnabled) return;
        if (!isStatus && !config.enabled) return;
        if (isStatus && sender === botJid) return;

        let groupName = '';
        if (isGroup) { try { const m = await sock.groupMetadata(groupJid); groupName = m.subject || 'Group'; } catch (e) {} }

        let content = '', mediaType = '', mediaPath = '', fileName = '';
        const msg = message.message || {};
        const msgType = getMessageType(msg);

        if (msg.conversation) { content = msg.conversation; }
        else if (msg.extendedTextMessage?.text) { content = msg.extendedTextMessage.text; }
        else if (msg.imageMessage) {
            mediaType = 'image'; content = msg.imageMessage.caption || '';
            try { const s = await downloadContentFromMessage(msg.imageMessage, 'image'); const c = []; for await (const chunk of s) c.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`); await writeFile(mediaPath, Buffer.concat(c)); } catch (err) {}
        } else if (msg.videoMessage) {
            mediaType = 'video'; content = msg.videoMessage.caption || '';
            try { const s = await downloadContentFromMessage(msg.videoMessage, 'video'); const c = []; for await (const chunk of s) c.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`); await writeFile(mediaPath, Buffer.concat(c)); } catch (err) {}
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            try { const s = await downloadContentFromMessage(msg.audioMessage, 'audio'); const c = []; for await (const chunk of s) c.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.ogg`); await writeFile(mediaPath, Buffer.concat(c)); } catch (err) {}
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            try { const s = await downloadContentFromMessage(msg.stickerMessage, 'sticker'); const c = []; for await (const chunk of s) c.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`); await writeFile(mediaPath, Buffer.concat(c)); } catch (err) {}
        } else if (msg.documentMessage) {
            mediaType = 'document'; content = msg.documentMessage.caption || ''; fileName = msg.documentMessage.fileName || 'document';
            try { const s = await downloadContentFromMessage(msg.documentMessage, 'document'); const c = []; for await (const chunk of s) c.push(chunk); mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`); await writeFile(mediaPath, Buffer.concat(c)); } catch (err) {}
        }

        const storeData = { id: messageId, content, mediaType, mediaPath, fileName, sender, isGroup, isStatus, group: groupJid, groupName, remoteJid: message.key.remoteJid, timestamp: Date.now(), type: msgType.type, emoji: msgType.emoji };
        (isStatus ? statusStore : messageStore).set(messageId, storeData);
    } catch (err) { console.error('Store error:', err.message); }
}

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled && !config.statusEnabled) return;

        const revokedKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedKey?.id) return;

        const messageId = revokedKey.id;
        const isBotDeleting = revocationMessage.key.fromMe === true;
        const rawDeleter = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const isStatus = revokedKey.remoteJid === 'status@broadcast';
        const isGroup = revokedKey.remoteJid?.endsWith('@g.us');
        
        let original = messageStore.get(messageId);
        if (!original) original = statusStore.get(messageId);
        if (!original) return;

        if (isStatus && !config.statusEnabled) return;
        if (!isStatus && !config.enabled) return;

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const deleterName = isBotDeleting ? 'WALLYJAYTECH-MD (Bot)' : `@${rawDeleter.split('@')[0]}`;
        const deleterMention = isBotDeleting ? botJid : rawDeleter;
        const senderName = `@${original.sender.split('@')[0]}`;
        const senderMention = original.sender;

        // FIX: Use stored remoteJid for correct routing
        let targetChat;
        if (isStatus) {
            targetChat = config.statusRoute === 'owner' ? original.sender : botJid;
        } else if (isGroup) {
            targetChat = config.route.group === 'dm' ? botJid : original.remoteJid;
        } else {
            targetChat = config.route.private === 'dm' ? botJid : original.remoteJid;
        }

        const time = formatTimestamp();
        const chatType = isStatus ? 'Status' : (isGroup ? `Group • ${original.groupName || 'Unknown'}` : 'Private');

        let recoveryText = `╭──❍「 *RECOVERED* 」❍\n├• 👤 From: ${senderName}\n├• 🗑️ By: ${deleterName}\n├• ${original.emoji} Type: ${original.type}${original.content ? ' + caption' : ''}\n`;
        if (original.fileName) recoveryText += `├• 📎 File: ${original.fileName}\n`;
        recoveryText += `├• 🕒 Time: ${time}\n`;
        if (isStatus) recoveryText += `├• 📱 Source: Status\n`;
        recoveryText += `├• 📍 Chat: ${chatType}\n`;
        if (original.content) recoveryText += `├• 💬 "${original.content.substring(0, 100)}${original.content.length > 100 ? '...' : ''}"\n`;
        recoveryText += `╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`;

        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            let sentMedia;
            try {
                switch (original.mediaType) {
                    case 'image': await sock.sendMessage(targetChat, { image: { url: original.mediaPath }, caption: recoveryText, mentions: [senderMention, deleterMention] }); break;
                    case 'video': await sock.sendMessage(targetChat, { video: { url: original.mediaPath }, caption: recoveryText, mentions: [senderMention, deleterMention] }); break;
                    case 'document': await sock.sendMessage(targetChat, { document: { url: original.mediaPath }, fileName: original.fileName || 'document', caption: recoveryText, mentions: [senderMention, deleterMention] }); break;
                    case 'audio': sentMedia = await sock.sendMessage(targetChat, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg' }); await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia }); break;
                    case 'voice': sentMedia = await sock.sendMessage(targetChat, { audio: { url: original.mediaPath }, mimetype: 'audio/ogg; codecs=opus', ptt: true }); await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia }); break;
                    case 'sticker': sentMedia = await sock.sendMessage(targetChat, { sticker: { url: original.mediaPath } }); await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] }, { quoted: sentMedia }); break;
                }
            } catch (err) {}
            try { fs.unlinkSync(original.mediaPath); } catch (err) {}
        } else {
            await sock.sendMessage(targetChat, { text: recoveryText, mentions: [senderMention, deleterMention] });
        }

        console.log(`✅ Recovered ${original.type} → ${targetChat === botJid ? 'Bot DM' : (isGroup ? 'Group' : 'Private Chat')}`);
        messageStore.delete(messageId);
        statusStore.delete(messageId);
    } catch (err) { console.error('Recovery error:', err.message); }
}

async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) { await sock.sendMessage(chatId, { text: '❌ Owner only!', ...channelInfo }); return; }

        const config = loadConfig();
        if (!Array.isArray(args)) args = args ? [args] : [];
        const cmd = args[0]?.toLowerCase();

        if (!cmd) {
            await sock.sendMessage(chatId, {
                text: `🛡️ *ANTI-DELETE SETTINGS*\n\n━━━━━━━━━━━━━━━━━━━━\n${config.enabled ? '🟢' : '🔴'} *Messages:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n${config.statusEnabled ? '🟢' : '🔴'} *Statuses:* ${config.statusEnabled ? '✅ ON' : '❌ OFF'}\n📩 *Private:* ${config.route.private === 'dm' ? 'Bot DM' : 'Original Chat'}\n👥 *Group:* ${config.route.group === 'chat' ? 'Group Chat' : 'Bot DM'}\n📱 *Status:* ${config.statusRoute === 'dm' ? 'Bot DM' : 'Owner DM'}\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antidelete on/off\n📖 .antidelete status on/off\n📖 .antidelete statusroute dm/owner\n📖 .antidelete private dm/chat\n📖 .antidelete group chat/dm`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (cmd === 'on') { if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*`, ...channelInfo }); return; } config.enabled = true; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *MESSAGE RECOVERY ENABLED*`, ...channelInfo }); }
        else if (cmd === 'off') { if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; } config.enabled = false; saveConfig(config); await sock.sendMessage(chatId, { text: `❌ *MESSAGE RECOVERY DISABLED*`, ...channelInfo }); }
        else if (cmd === 'status') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'on') { if (config.statusEnabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*`, ...channelInfo }); return; } config.statusEnabled = true; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *STATUS RECOVERY ENABLED*`, ...channelInfo }); }
            else if (sub === 'off') { if (!config.statusEnabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; } config.statusEnabled = false; saveConfig(config); await sock.sendMessage(chatId, { text: `❌ *STATUS RECOVERY DISABLED*`, ...channelInfo }); }
            else { await sock.sendMessage(chatId, { text: `📱 *STATUS:* ${config.statusEnabled ? '✅ ON' : '❌ OFF'} | 📍 ${config.statusRoute === 'dm' ? 'Bot DM' : 'Owner DM'}`, ...channelInfo }); }
        }
        else if (cmd === 'statusroute') { const sub = args[1]?.toLowerCase(); if (sub === 'dm' || sub === 'owner') { if (config.statusRoute === sub) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*`, ...channelInfo }); return; } config.statusRoute = sub; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *STATUS → ${sub === 'dm' ? 'Bot DM' : 'Owner DM'}*`, ...channelInfo }); } }
        else if (cmd === 'private') { const sub = args[1]?.toLowerCase(); if (sub === 'dm' || sub === 'chat') { if (config.route.private === sub) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*`, ...channelInfo }); return; } config.route.private = sub; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *PRIVATE → ${sub === 'dm' ? 'Bot DM' : 'Original Chat'}*`, ...channelInfo }); } }
        else if (cmd === 'group') { const sub = args[1]?.toLowerCase(); if (sub === 'dm' || sub === 'chat') { if (config.route.group === sub) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*`, ...channelInfo }); return; } config.route.group = sub; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *GROUP → ${sub === 'dm' ? 'Bot DM' : 'Group Chat'}*`, ...channelInfo }); } }
    } catch (err) { console.error('Command error:', err); }
}

module.exports = { handleAntideleteCommand, handleMessageRevocation, storeMessage };
