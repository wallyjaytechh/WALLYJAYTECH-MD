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
/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autoread Command - Automatically read all messages
 * Professional Version with Include/Exclude system
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

const defaultConfig = {
    enabled: false,
    mode: 'all',
    includeMode: false,
    numberList: []
};

// ═══════════════════════════════════════
// CONFIGURATION (Auto-migrate)
// ═══════════════════════════════════════

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        
        const configHash = JSON.stringify(defaultConfig);
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ ...defaultConfig, _hash: configHash }, null, 2));
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        
        // Auto-migrate old configs
        let needsUpdate = false;
        for (const [key, value] of Object.entries(defaultConfig)) {
            if (config[key] === undefined) {
                config[key] = value;
                needsUpdate = true;
            }
        }
        if (config._hash !== configHash) needsUpdate = true;
        
        if (needsUpdate) {
            config._hash = configHash;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        
        return config;
    } catch (e) { return { ...defaultConfig }; }
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function extractPhoneNumber(jid) {
    if (!jid) return null;
    return jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

function isNumberInList(jid, message) {
    const config = initConfig();
    if (!config.numberList || config.numberList.length === 0) return null;

    const chatId = message.key.remoteJid;
    const isGroup = chatId?.endsWith('@g.us');
    let phone = null;

    if (isGroup) {
        const participant = message.key.participant || message.participant;
        if (participant) {
            if (message.key.participantAlt?.includes('@s.whatsapp.net')) {
                phone = extractPhoneNumber(message.key.participantAlt);
            } else if (!participant.endsWith('@lid')) {
                phone = extractPhoneNumber(participant);
            } else {
                try {
                    const store = require('./lightweight_store');
                    const contact = store.contacts[participant];
                    if (contact?.id?.includes('@s.whatsapp.net')) {
                        phone = extractPhoneNumber(contact.id);
                    }
                } catch (e) {}
            }
        }
    } else {
        if (message.key.remoteJidAlt?.includes('@s.whatsapp.net')) {
            phone = extractPhoneNumber(message.key.remoteJidAlt);
        } else {
            phone = extractPhoneNumber(jid);
        }
    }

    if (!phone || phone.length < 7) return null;

    const found = config.numberList.some(num => {
        return phone === num || phone.endsWith(num) || num.endsWith(phone);
    });

    return config.includeMode ? found : !found;
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function getModeDescription(mode) { switch(mode) { case 'all': return 'both DMs and groups.'; case 'dms': return 'private messages only.'; case 'groups': return 'group chats only.'; default: return 'both DMs and groups.'; } }

function shouldReadMessage(chatId, message) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;
        
        const isGroup = chatId.endsWith('@g.us');
        
        // Check mode
        switch(config.mode) {
            case 'all': break;
            case 'dms': if (isGroup) return false; break;
            case 'groups': if (!isGroup) return false; break;
            default: break;
        }
        
        // Check include/exclude list
        const listResult = isNumberInList(chatId, message);
        if (listResult !== null && !listResult) return false;
        
        return true;
    } catch (e) { return false; }
}

function isAutoreadEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

// ═══════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════

async function handleAutoread(sock, message) {
    if (shouldReadMessage(message.key.remoteJid, message)) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.some(jid => jid === botNumber)) return false;
        const key = { remoteJid: message.key.remoteJid, id: message.key.id, participant: message.key.participant };
        await sock.readMessages([key]);
        return true;
    }
    return false;
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

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
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';

            await sock.sendMessage(chatId, {
                text: `📖 *AUTO-READ SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎯 *Mode:* ${getModeText(config.mode)}\n` +
                      `🔢 *Filter:* ${filterMode} (${config.numberList.length} numbers)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autoread on - Enable auto-read\n` +
                      `└ .autoread off - Disable auto-read\n` +
                      `└ .autoread mode all - Read all messages\n` +
                      `└ .autoread mode dms - DMs only\n` +
                      `└ .autoread mode groups - Groups only\n` +
                      `└ .autoread status - Show settings\n` +
                      `└ .autoread include add <numbers> - Read only these\n` +
                      `└ .autoread include remove <numbers>\n` +
                      `└ .autoread exclude add <numbers> - Skip these\n` +
                      `└ .autoread exclude remove <numbers>\n` +
                      `└ .autoread includelist / excludelist\n` +
                      `└ .autoread includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .autoread mode groups\n` +
                      `└ .autoread include add 2347012345678\n` +
                      `└ .autoread exclude add 2348012345678`,
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
        }
        else if (action === 'off' || action === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Auto-Read is already *OFF*.\n\n💡 Use .autoread on to enable.`, ...channelInfo });
                return;
            }
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `❌ *AUTO-READ DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer automatically read messages.\n\n💡 Use .autoread on to enable.`, ...channelInfo });
        }
        else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autoread mode <all/dms/groups>`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                if (config.mode === mode) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode is already *${getModeText(mode)}*.`, ...channelInfo }); return; }
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`, ...channelInfo });
            } else { await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Available: all, dms, groups`, ...channelInfo }); }
        }
        else if (action === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autoread include add 2347012345678`, ...channelInfo }); return; }
                config.includeMode = true;
                const added = [];
                for (const num of numbers) { if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); } }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Include Only\n🔢 Added ${added.length} number(s)\n\n💡 Bot will ONLY read messages from these numbers.`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autoread include remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *INCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}\n\n📖 .autoread include add/remove\n📖 .autoread includelist\n📖 .autoread includeclear`, ...channelInfo }); }
        }
        else if (action === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autoread exclude add 2347012345678`, ...channelInfo }); return; }
                config.includeMode = false;
                const added = [];
                for (const num of numbers) { if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); } }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Exclude\n🔢 Added ${added.length} number(s)\n\n💡 Bot will NOT read messages from these numbers.`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autoread exclude remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *EXCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}\n\n📖 .autoread exclude add/remove\n📖 .autoread excludelist\n📖 .autoread excludeclear`, ...channelInfo }); }
        }
        else if (action === 'includelist') {
            const pageNums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *INCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Include Only\n📊 Total: ${pageNums.length} numbers\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, ...channelInfo });
        }
        else if (action === 'excludelist') {
            const pageNums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *EXCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Exclude\n📊 Total: ${pageNums.length} numbers\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, ...channelInfo });
        }
        else if (action === 'includeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *INCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (action === 'excludeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *EXCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';
            await sock.sendMessage(chatId, {
                text: `📖 *AUTO-READ STATUS*\n\n━━━━━━━━━━━━━━━━━━━━\n${config.enabled ? '🟢' : '🔴'} *Status:* ${status}\n🎯 *Mode:* ${getModeText(config.mode)}\n🔢 *Filter:* ${filterMode} (${config.numberList.length})\n\n📌 ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        }
        else { await sock.sendMessage(chatId, { text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .autoread to see all options.`, ...channelInfo }); }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = { autoreadCommand, isAutoreadEnabled, shouldReadMessage, handleAutoread };
