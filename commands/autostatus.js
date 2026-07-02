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
 * Auto Status Viewer with Likes (💚 Green Heart)
 * Professional Version with Include/Exclude & Self-View
 * FULLY FIXED: Self-View now works by comparing bot's own JID/LID
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

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
    likeOn: false,
    selfOn: false,
    includeMode: false,
    numberList: []
};

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        
        const configHash = JSON.stringify(defaultConfig);
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ ...defaultConfig, _hash: configHash }, null, 2));
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        let needsUpdate = false;
        
        for (const [key, value] of Object.entries(defaultConfig)) {
            if (config[key] === undefined) { config[key] = value; needsUpdate = true; }
        }
        if (config._hash !== configHash) needsUpdate = true;
        
        if (needsUpdate) {
            config._hash = configHash;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('📝 Autostatus config migrated');
        }
        
        return config;
    } catch (error) { 
        console.error('❌ Error reading config:', error);
        return { ...defaultConfig }; 
    }
}

function readConfig() {
    return initConfig();
}

function writeConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Failed to write config:', e.message);
        return false;
    }
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function extractPhoneNumber(jid) {
    if (!jid) return null;
    if (jid.endsWith('@lid')) return null;
    let phone = jid.split('@')[0];
    if (phone.includes(':')) phone = phone.split(':')[0];
    phone = phone.replace(/[^0-9]/g, '');
    return phone.length > 0 ? phone : null;
}

function isNumberInList(message) {
    const config = readConfig();
    if (!config.numberList || config.numberList.length === 0) return null;

    const isStatus = message.key.remoteJid === 'status@broadcast';
    let phone = null;

    if (isStatus) {
        const participant = message.key.participant;
        if (!participant) return null;

        if (participant.endsWith('@lid')) {
            if (message.key.remoteJidAlt?.includes('@s.whatsapp.net')) {
                phone = extractPhoneNumber(message.key.remoteJidAlt);
            }
        } else {
            phone = extractPhoneNumber(participant);
        }
    } else {
        const chatId = message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        let senderJid = isGroup ? (message.key.participant || message.participant) : chatId;
        if (!senderJid) return null;

        if (senderJid.endsWith('@lid')) {
            if (message.key.remoteJidAlt?.includes('@s.whatsapp.net')) {
                phone = extractPhoneNumber(message.key.remoteJidAlt);
            } else if (message.key.participantAlt?.includes('@s.whatsapp.net')) {
                phone = extractPhoneNumber(message.key.participantAlt);
            }
        } else {
            phone = extractPhoneNumber(senderJid);
        }
    }

    if (!phone || phone.length < 7) return null;

    const found = config.numberList.some(num => {
        const normalizedNum = num.replace(/[^0-9]/g, '');
        return phone === normalizedNum || phone.endsWith(normalizedNum) || normalizedNum.endsWith(phone);
    });

    return config.includeMode ? found : !found;
}

// ✅ FIXED: Detects self-status by comparing participant LID to bot's own number
function shouldViewStatus(message, botJid) {
    try {
        const config = readConfig();
        if (!config.enabled) return false;
        if (!message.key || message.key.remoteJid !== 'status@broadcast') return false;

        const participant = message.key.participant || '';
        const participantNumber = participant.split('@')[0];
        const botNumber = botJid ? botJid.split('@')[0] : null;

        // Detect self-status: fromMe OR participant number matches bot's own number
        const isSelf = message.key.fromMe === true || 
                       (botNumber && participantNumber === botNumber);

        // Self-view check
        if (isSelf && !config.selfOn) return false;

        // Skip number filter for own status (always view own)
        if (!isSelf) {
            const listResult = isNumberInList(message);
            if (listResult !== null && !listResult) return false;
        }

        return true;
    } catch (e) { return false; }
}

async function isAutoStatusEnabled() { 
    return readConfig().enabled; 
}

async function isStatusLikeEnabled() { 
    return readConfig().likeOn; 
}

// ═══════════════════════════════════════
// STATUS HANDLERS
// ═══════════════════════════════════════

async function likeStatus(sock, msgKey) {
    try {
        const config = readConfig();
        if (!config.enabled || !config.likeOn) return;

        const participant = msgKey.participant || msgKey.remoteJid;
        if (!participant) return;

        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: msgKey.id,
                    participant: participant,
                    fromMe: false
                },
                text: '💚'
            }
        }, {
            messageId: msgKey.id,
            statusJidList: [participant, myJid]
        });

        console.log(`💚 Liked: ${msgKey.id}`);
    } catch (error) {
        console.error('❌ Like error:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        if (!status.messages || status.messages.length === 0) return;
        
        const msg = status.messages[0];
        const config = readConfig();
        const botJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;

        // Debug log
        console.log(`📱 Status received | from: ${msg.key.participant} | fromMe: ${msg.key.fromMe} | id: ${msg.key.id}`);

        if (!shouldViewStatus(msg, botJid)) {
            console.log('⏭️ Status skipped (filtered)');
            return;
        }

        console.log(`👁️ Viewing status: ${msg.key.id} from ${msg.key.participant?.split('@')[0] || 'unknown'}`);
        
        try {
            await sock.readMessages([msg.key]);
            console.log('✅ Viewed:', msg.key.id);

            // Send receipt for Android view count
            try {
                await sock.sendReceipt({
                    key: {
                        remoteJid: 'status@broadcast',
                        id: msg.key.id,
                        participant: msg.key.participant
                    },
                    receipt: {
                        userJid: sock.user.id,
                        readTimestamp: Date.now()
                    }
                });
            } catch (receiptErr) {
                // Ignore receipt errors
            }

            // Like if enabled
            if (config.likeOn) {
                await likeStatus(sock, msg.key);
            }
        } catch (err) {
            if (err.message?.includes('rate-overlimit')) {
                console.log('⚠️ Rate limit, waiting...');
                await new Promise(r => setTimeout(r, 2000));
                await sock.readMessages([msg.key]);
            } else {
                console.error('❌ View error:', err.message);
            }
        }
    } catch (e) {
        console.error('❌ Status error:', e.message);
    }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const config = readConfig();
        if (!config.enabled) return;

        const botJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;

        console.log(`\n📦 Processing ${statusMessages.length} status updates...`);

        for (const msg of statusMessages) {
            if (!shouldViewStatus(msg, botJid)) continue;

            try {
                await sock.readMessages([msg.key]);
                console.log('✅ Viewed:', msg.key.id);

                try {
                    await sock.sendReceipt({
                        key: { 
                            remoteJid: 'status@broadcast', 
                            id: msg.key.id, 
                            participant: msg.key.participant
                        },
                        receipt: { 
                            userJid: sock.user.id, 
                            readTimestamp: Date.now() 
                        }
                    });
                } catch (e) {
                    // Ignore receipt errors
                }

                if (config.likeOn) {
                    await likeStatus(sock, msg.key);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) { 
                    await new Promise(r => setTimeout(r, 2000)); 
                }
            }
        }
    } catch (e) {
        console.error('❌ Bulk status error:', e.message);
    }
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const config = readConfig();

        if (!args || args.length === 0) {
            const status = config.enabled ? '✅ ON' : '❌ OFF';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const likeStatus = config.likeOn ? '✅ ON' : '❌ OFF';
            const selfStatus = config.selfOn ? '✅ ON' : '❌ OFF';
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';

            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS VIEWER SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status Viewing:* ${status}\n` +
                      `💚 *Likes:* ${likeStatus}\n` +
                      `👤 *Self-View:* ${selfStatus}\n` +
                      `🔢 *Filter:* ${filterMode} (${config.numberList.length} numbers)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autostatus on - Enable auto-view\n` +
                      `└ .autostatus off - Disable everything\n` +
                      `└ .autostatuslike on - Enable likes (💚)\n` +
                      `└ .autostatuslike off - Disable likes\n` +
                      `└ .autostatus self on - View own status\n` +
                      `└ .autostatus self off - Skip own status\n` +
                      `└ .autostatus include add <numbers>\n` +
                      `└ .autostatus include remove <numbers>\n` +
                      `└ .autostatus exclude add <numbers>\n` +
                      `└ .autostatus exclude remove <numbers>\n` +
                      `└ .autostatus includelist / excludelist\n` +
                      `└ .autostatus includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .autostatus on\n` +
                      `└ .autostatuslike on\n` +
                      `└ .autostatus self on\n` +
                      `└ .autostatus include add 2347012345678`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const cmd = args[0].toLowerCase();
        
        if (cmd === 'on') {
            if (config.enabled) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status Viewer is already *ON*.`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            config.enabled = true;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *AUTO-STATUS VIEWER ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Bot will now automatically view all status updates.`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        } 
        else if (cmd === 'off') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status Viewer is already *OFF*.`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            config.enabled = false;
            config.likeOn = false;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: `❌ *AUTO-STATUS VIEWER DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Bot will no longer view or like statuses.`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        } 
        else if (cmd === 'autostatuslike') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatuslike <on/off>\n\n💡 *Example:* .autostatuslike on`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            const likeState = args[1].toLowerCase();
            if (likeState === 'on') {
                if (config.likeOn) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Likes are already *ON*.`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.likeOn = true;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `💚 *LIKES ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Bot will like viewed statuses with 💚.`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            } else if (likeState === 'off') {
                if (!config.likeOn) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Likes are already *OFF*.`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.likeOn = false;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *LIKES DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Bot will view but not like statuses.`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
        }
        else if (cmd === 'self') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus self <on/off>\n\n💡 *Example:* .autostatus self on`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            const selfState = args[1].toLowerCase();
            if (selfState === 'on') {
                if (config.selfOn) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👤 Self-View is already *ON*.`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.selfOn = true;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `👤 *SELF-VIEW ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👤 Bot will now view its own status updates.`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            } else if (selfState === 'off') {
                if (!config.selfOn) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👤 Self-View is already *OFF*.`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.selfOn = false;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *SELF-VIEW DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👤 Bot will skip its own status updates.`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
        }
        else if (cmd === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus include add <numbers>`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.includeMode = true;
                for (const num of numbers) { if (!config.numberList.includes(num)) config.numberList.push(num); }
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `✅ *INCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Include Only\n🔢 Added ${numbers.length} number(s)`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus include remove <numbers>`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `✅ *INCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s)`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
            else {
                await sock.sendMessage(chatId, { 
                    text: `📋 *INCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Numbers: ${config.numberList.length}`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        }
        else if (cmd === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus exclude add <numbers>`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                config.includeMode = false;
                for (const num of numbers) { if (!config.numberList.includes(num)) config.numberList.push(num); }
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `✅ *EXCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Exclude\n🔢 Added ${numbers.length} number(s)`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus exclude remove <numbers>`, 
                        ...channelInfo 
                    }, { quoted: message });
                    return;
                }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `✅ *EXCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s)`, 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
            else {
                await sock.sendMessage(chatId, { 
                    text: `📋 *EXCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Numbers: ${config.numberList.length}`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        }
        else if (cmd === 'includelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { 
                text: `📋 *INCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Include Only\n📊 Total: ${nums.length}\n\n${nums.length > 0 ? nums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, 
                ...channelInfo 
            }, { quoted: message });
        }
        else if (cmd === 'excludelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { 
                text: `📋 *EXCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Exclude\n📊 Total: ${nums.length}\n\n${nums.length > 0 ? nums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, 
                ...channelInfo 
            }, { quoted: message });
        }
        else if (cmd === 'includeclear') {
            if (config.numberList.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY EMPTY*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Include list is already empty.`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            config.numberList = [];
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *INCLUDE LIST CLEARED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All numbers removed.\n🌍 Will view all statuses.`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        }
        else if (cmd === 'excludeclear') {
            if (config.numberList.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY EMPTY*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Exclude list is already empty.`, 
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            config.numberList = [];
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *EXCLUDE LIST CLEARED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All numbers removed.\n🌍 Will view all statuses.`, 
                    ...channelInfo 
                }, { quoted: message });
            }
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .autostatus to see all options.`, 
                ...channelInfo 
            }, { quoted: message });
        }
    } catch (e) {
        console.error('❌ Command error:', e.message);
    }
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusLikeEnabled,
    readConfig,
    writeConfig
};
