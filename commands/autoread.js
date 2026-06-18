/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autoread Command - Automatically read all messages
 * Professional Version
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

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

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all' }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (e) { return { enabled: false, mode: 'all' }; }
}

async function autoreadCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const userMessage = message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        const config = initConfig();

        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `📖 *AUTO-READ SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autoread on - Enable auto-read\n` +
                      `└ .autoread off - Disable auto-read\n` +
                      `└ .autoread mode all - Read all messages\n` +
                      `└ .autoread mode dms - DMs only\n` +
                      `└ .autoread mode groups - Groups only\n` +
                      `└ .autoread status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .autoread mode groups\n` +
                      `└ .autoread on`,
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Auto-Read is already *ON*.\n\n💡 Use .autoread off to disable.`, ...channelInfo });
                return;
            }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-READ ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n\n📌 Bot will now automatically read messages in ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        } else if (action === 'off' || action === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Auto-Read is already *OFF*.\n\n💡 Use .autoread on to enable.`, ...channelInfo });
                return;
            }
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `❌ *AUTO-READ DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer automatically read messages.\n\n💡 Use .autoread on to enable.`, ...channelInfo });
        } else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autoread mode <all/dms/groups>\n\n✨ *Example:*\n└ .autoread mode groups`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`, ...channelInfo });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Available: all, dms, groups`, ...channelInfo });
            }
        } else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            await sock.sendMessage(chatId, {
                text: `📖 *AUTO-READ STATUS*\n\n${statusIcon} *Status:* ${status}\n━━━━━━━━━━━━━━━━━━━━\n🎯 *Mode:* ${getModeText(config.mode)}\n\n📌 ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .autoread on/off\n└ .autoread mode all/dms/groups\n└ .autoread status`,
                ...channelInfo
            });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function getModeDescription(mode) { switch(mode) { case 'all': return 'both DMs and groups.'; case 'dms': return 'private messages only.'; case 'groups': return 'group chats only.'; default: return 'both DMs and groups.'; } }
function shouldReadMessage(chatId) { try { const config = initConfig(); if (!config.enabled) return false; const isGroup = chatId.endsWith('@g.us'); switch(config.mode) { case 'all': return true; case 'dms': return !isGroup; case 'groups': return isGroup; default: return true; } } catch (e) { return false; } }
function isAutoreadEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

async function handleAutoread(sock, message) {
    if (shouldReadMessage(message.key.remoteJid)) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.some(jid => jid === botNumber)) return false;
        const key = { remoteJid: message.key.remoteJid, id: message.key.id, participant: message.key.participant };
        await sock.readMessages([key]);
        return true;
    }
    return false;
}

module.exports = { autoreadCommand, isAutoreadEnabled, shouldReadMessage, handleAutoread };
