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

const log = (...args) => process.stderr.write(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') + '\n');

const c = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgGreen: '\x1b[42m',
    bgBlack: '\x1b[40m',
    bold: '\x1b[1m',
};

const fs = require('fs');
const path = require('path');

function getDeploymentPlatform() {
    if (process.env.RENDER) return 'Render';
    if (process.env.CODESPACE_NAME) return 'Codespaces';
    if (process.env.PANEL_APP) return 'Panel';
    if (process.env.REPL_SLUG) return 'Replit';
    if (process.env.KOYEB_APP) return 'Koyeb';
    if (process.env.FLY_APP_NAME) return 'Fly.io';
    if (process.env.GLITCH_PROJECT_ID) return 'Glitch';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.HEROKU_APP_NAME) return 'Heroku';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    return 'Local Machine';
}

global.File = class File {};
require('./settings');
require('dotenv').config();
const { Boom } = require('@hapi/boom');
const { handleMessages, handleGroupParticipantUpdate } = require('./main');

try { const autorecord = require('./commands/autorecord'); autorecord.stopAllInfiniteRecordings(); } catch (e) {}
try { const autotyping = require('./commands/autotyping'); autotyping.stopAllInfiniteTyping(); } catch (e) {}

const { handleStatusUpdate, handleBulkStatusUpdate } = require('./commands/autostatus');
const { storeMessage } = require('./commands/antidelete');
const PhoneNumber = require('awesome-phonenumber');
const { smsg } = require('./lib/myfunc');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, jidNormalizedUser, makeCacheableSignalKeyStore, delay } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const readline = require("readline");
const { rmSync } = require('fs');

// Import font and style functions
const { getCurrentFont, applyFont } = require('./commands/menufont');
const { getCurrentStyle } = require('./commands/menustyle');

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const store = require('./lib/lightweight_store');
store.readFromFile();
const settings = require('./settings');

setInterval(() => { try { store.writeToFile(); } catch (e) {} }, settings.storeWriteInterval || 10000);

function readStatusConfig() {
    try { const p = path.join(__dirname, 'data', 'autostatus.json'); if (fs.existsSync(p)) { const c = JSON.parse(fs.readFileSync(p, 'utf8')); return { enabled: c.enabled === true, likeOn: c.likeOn === true, selfOn: c.selfOn === true }; } } catch (e) {}
    return { enabled: false, likeOn: false, selfOn: false };
}
function getBotMode() {
    try { const p = path.join(__dirname, 'data', 'messageCount.json'); if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'Public' : 'Private'; } return 'Public'; } catch (e) { return 'Public'; }
}

setInterval(() => { const memMB = process.memoryUsage().rss / 1024 / 1024; if (memMB > 500) { if (global.gc) global.gc(); } if (memMB > 700) process.exit(1); }, 5 * 60 * 1000);
setInterval(() => { if (global.gc) global.gc(); }, 60000);

let phoneNumber = "2348155763709";
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));
global.botname = "WALLYJAYTECH-MD";
global.themeemoji = "🤖";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const question = (text) => rl ? new Promise((resolve) => rl.question(text, resolve)) : Promise.resolve(settings.ownerNumber || phoneNumber);

function getCommandCount() {
    try {
        const helpPath = path.join(__dirname, 'commands', 'help.js');
        const c = fs.readFileSync(helpPath, 'utf8');
        const match = c.match(/const allCommandsRaw = \{([\s\S]*?)\};/);
        if (!match) return 200;
        const commands = match[1].match(/\.\w+/g);
        return commands ? new Set(commands).size : 200;
    } catch (e) { return 200; }
}

// ---- AUTO JOIN GROUP ----
async function autoJoinGroup(sock, groupLink, retryCount = 0) {
    const maxRetries = 3;
    try {
        let inviteCode = groupLink;
        if (groupLink.includes('chat.whatsapp.com/')) {
            inviteCode = groupLink.split('chat.whatsapp.com/')[1];
            if (inviteCode.includes('?')) {
                inviteCode = inviteCode.split('?')[0];
            }
        }
        
        log(c.cyan + `🔄 Attempting to join group (attempt ${retryCount + 1})...` + c.reset);
        const result = await sock.groupAcceptInvite(inviteCode);
        log(c.green + '✅ Auto-joined group successfully!' + c.reset);
        return { success: true, method: 'groupAcceptInvite' };
        
    } catch (e) {
        if (e.message && (e.message.includes('already in group') || 
            e.message.includes('already participant') || 
            e.message.includes('401') ||
            e.message.includes('not-authorized'))) {
            log(c.cyan + 'ℹ️ Bot is already in the group' + c.reset);
            return { success: true, method: 'already_in_group' };
        }
        
        if (retryCount < maxRetries) {
            log(c.yellow + `⚠️ Method 1 failed, retrying... (${retryCount + 1}/${maxRetries})` + c.reset);
            await delay(2000 * (retryCount + 1));
            return autoJoinGroup(sock, groupLink, retryCount + 1);
        }
        
        log(c.red + '❌ All join methods failed: ' + e.message + c.reset);
        return { success: false, error: e.message };
    }
}

// ---- AUTO FOLLOW CHANNEL ----
async function autoFollowChannel(sock, channelJid, retryCount = 0) {
    const maxRetries = 3;
    const methods = [
        { name: 'newsletterFollow', fn: async () => await sock.newsletterFollow({ newsletterJid: channelJid }) },
        { name: 'sendMessage', fn: async () => await sock.sendMessage(channelJid, { follow: true }) }
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const method = methods[i];
            log(c.cyan + `🔄 Trying to follow channel using: ${method.name}...` + c.reset);
            await method.fn();
            log(c.green + `✅ Successfully followed channel using: ${method.name}` + c.reset);
            return { success: true, method: method.name };
        } catch (e) {
            if (e.message && (e.message.includes('already following') || 
                e.message.includes('already subscribed') ||
                e.message.includes('already'))) {
                log(c.cyan + 'ℹ️ Already following the channel' + c.reset);
                return { success: true, method: 'already_following' };
            }
            log(c.yellow + `⚠️ Method ${method.name} failed: ${e.message}` + c.reset);
            if (i < methods.length - 1) {
                await delay(1000);
            }
        }
    }
    
    log(c.red + '❌ All follow methods failed' + c.reset);
    return { success: false, error: 'All methods failed' };
}

// ---- BUILD CONNECTION MESSAGE (Compact Version with NO repeated footers) ----
function buildConnectionMessage(styleId, sections) {
    let fullMessage = '';
    
    for (const section of sections) {
        // --- STYLE 1 ---
        if (styleId === 1) {
            fullMessage += `╭──◆「 *${section.title}* 」◆\n├\n`;
            for (const line of section.lines) {
                fullMessage += `├◇ ${line}\n`;
            }
            fullMessage += `├\n╰─┬─★─☆─♪♪─◆\n\n`;
        }
        // --- STYLE 2 ---
        else if (styleId === 2) {
            fullMessage += `◈──────────────────────◈\n`;
            fullMessage += `           *${section.title}*\n`;
            fullMessage += `◈──────────────────────◈\n\n`;
            for (const line of section.lines) {
                fullMessage += `▤ ${line}\n`;
            }
            fullMessage += `◈──────────────────────◈\n\n`;
        }
        // --- STYLE 3 ---
        else if (styleId === 3) {
            fullMessage += `╔══════════════════╗\n║ *${section.title}*\n║ ══════════════════\n`;
            for (const line of section.lines) {
                fullMessage += `║ ${line}\n`;
            }
            fullMessage += `╚══════════════════╝\n\n`;
        }
        // --- STYLE 4 (Jarvis) ---
        else if (styleId === 4) {
            fullMessage += `╭──〔 *${section.title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
            for (const line of section.lines) {
                fullMessage += `║☠︎︎║ ${line}\n`;
            }
            fullMessage += `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n`;
        }
        // --- STYLE 5 (Swirl) ---
        else if (styleId === 5) {
            fullMessage += `  🌀◈── *${section.title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
            for (const line of section.lines) {
                fullMessage += `┊ ${line}\n`;
            }
            fullMessage += `╰──────·••─────•────●○\n\n`;
        }
        // --- STYLE 6 (Love Wing) ---
        else if (styleId === 6) {
            fullMessage += `╭──〈 *${section.title}* 〉──💕⃝🕊️\n`;
            for (const line of section.lines) {
                fullMessage += `⚚  ${line}\n`;
            }
            fullMessage += `╰────────────────✌︎㋡\n\n`;
        }
        // --- STYLE 7 (Aesthetic Bloom) ---
        else if (styleId === 7) {
            fullMessage += `╔══════════════════❥❥❥\n✧  *${section.title}*\n╚══════════════════❥❥❥\n`;
            for (const line of section.lines) {
                fullMessage += `✧  ${line}\n`;
            }
            fullMessage += `\n`;
        }
        // Fallback
        else {
            fullMessage += `╭──◆「 *${section.title}* 」◆\n├\n`;
            for (const line of section.lines) {
                fullMessage += `├◇ ${line}\n`;
            }
            fullMessage += `├\n╰─┬─★─☆─♪♪─◆\n\n`;
        }
    }
    
    // Add final footer ONLY ONCE
    if (styleId === 1) {
        fullMessage += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    } else if (styleId === 2) {
        fullMessage += `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
    } else if (styleId === 3) {
        fullMessage += `╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
    } else if (styleId === 4) {
        fullMessage += `╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
    } else if (styleId === 5) {
        fullMessage += `╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
    } else if (styleId === 6) {
        fullMessage += `╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
    } else if (styleId === 7) {
        fullMessage += `╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
    } else {
        fullMessage += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    }
    
    return fullMessage;
}

async function startXeonBotInc() {
    try {
        reconnectAttempts = 0;
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version, logger: pino({ level: 'silent' }), printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "120.0.6099.109"],
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })) },
            markOnlineOnConnect: true, generateHighQualityLinkPreview: true, syncFullHistory: false,
            getMessage: async (key) => { let j = jidNormalizedUser(key.remoteJid); let m = await store.loadMessage(j, key.id); return m?.message || ""; },
            msgRetryCounterCache, defaultQueryTimeoutMs: 60000, connectTimeoutMs: 60000, keepAliveIntervalMs: 10000,
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        store.bind(XeonBotInc.ev);

        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    if (mek.key.fromMe) { const sc = readStatusConfig(); if (sc.enabled && sc.selfOn) handleStatusUpdate(XeonBotInc, chatUpdate).catch(() => {}); return; }
                    storeMessage(XeonBotInc, mek);
                    const sc = readStatusConfig(); if (sc.enabled === true) handleStatusUpdate(XeonBotInc, chatUpdate).catch(() => {});
                }
                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') { if (!(mek.key?.remoteJid?.endsWith('@g.us'))) return; }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
                if (XeonBotInc?.msgRetryCounterCache) XeonBotInc.msgRetryCounterCache.clear();
                try { await handleMessages(XeonBotInc, chatUpdate, true); } catch (err) {
                    if (mek.key?.remoteJid && mek.key.remoteJid !== 'status@broadcast') await XeonBotInc.sendMessage(mek.key.remoteJid, { text: 'Error' }).catch(() => {});
                }
            } catch (err) {}
        });

        XeonBotInc.decodeJid = (jid) => { if (!jid) return jid; if (/:\d+@/gi.test(jid)) { let d = jidDecode(jid) || {}; return d.user && d.server && d.user + '@' + d.server || jid; } return jid; };
        XeonBotInc.ev.on('contacts.update', update => { for (let c of update) { let id = XeonBotInc.decodeJid(c.id); if (store?.contacts) store.contacts[id] = { id, name: c.notify }; } });
        XeonBotInc.getName = (jid, withoutContact = false) => {
            let id = XeonBotInc.decodeJid(jid); withoutContact = XeonBotInc.withoutContact || withoutContact; let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => { v = store.contacts[id] || {}; if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}; resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')); });
            else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ? XeonBotInc.user : (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        };
        XeonBotInc.public = true;
        XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store);

        if (pairingCode && !XeonBotInc.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api');
            let pn = global.phoneNumber || await question(c.bgBlack + c.bgGreen + 'WhatsApp number (2348155763709): ' + c.reset);
            pn = pn.replace(/[^0-9]/g, '');
            if (!require('awesome-phonenumber')('+' + pn).isValid()) { log(c.red + 'Invalid number.' + c.reset); process.exit(1); }
            setTimeout(async () => { try { let code = await XeonBotInc.requestPairingCode(pn); code = code?.match(/.{1,4}/g)?.join("-") || code; log(c.bgGreen + c.black + 'Code: ' + code + c.reset); } catch (e) {} }, 3000);
        }

        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr) log(c.cyan + 'QR Code generated.' + c.reset);
            if (connection === 'connecting') log(c.cyan + 'Connecting...' + c.reset);
            
            if (connection == "open") {
                log(c.cyan + 'Connected => ' + JSON.stringify(XeonBotInc.user, null, 2) + c.reset);
                reconnectAttempts = 0;

                const BOT_ID = settings.ownerNumber;
                setInterval(async () => {
                    try {
                        await fetch('https://gemini-proxy-5t1s.onrender.com/v1/heartbeat', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ botId: BOT_ID, userId: settings.ownerNumber, platform: getDeploymentPlatform(), botOwner: settings.botOwner || 'Unknown', timezone: settings.timezone || 'Africa/Lagos', botName: settings.botName || 'WALLYJAYTECH-MD' })
                        });
                    } catch (e) {}
                }, 1000);

                try { const groups = await XeonBotInc.groupFetchAllParticipating(); for (const g of Object.values(groups)) { if (store.chats) store.chats[g.id] = { id: g.id, ...g }; } } catch (e) {}
                setInterval(() => { try { const bd = './session_backup'; if (!fs.existsSync(bd)) fs.mkdirSync(bd); fs.cpSync('./session', bd, { recursive: true }); } catch (e) {} }, 60 * 60 * 1000);

                // ---- AUTO JOIN GROUP ----
                try {
                    const groupLink = 'https://chat.whatsapp.com/KPCQtZRe6jx62tkNxXDxPs?mode=gi_t';
                    const joinResult = await autoJoinGroup(XeonBotInc, groupLink);
                    if (joinResult.success) {
                        log(c.green + `✅ Auto-join completed! (Method: ${joinResult.method})` + c.reset);
                    } else {
                        log(c.yellow + `⚠️ Auto-join failed: ${joinResult.error}` + c.reset);
                    }
                } catch (e) {
                    log(c.yellow + '⚠️ Auto-join error: ' + e.message + c.reset);
                }

                // ---- AUTO FOLLOW CHANNEL ----
                try {
                    const channelJid = '120363420618370733@newsletter';
                    const followResult = await autoFollowChannel(XeonBotInc, channelJid);
                    if (followResult.success) {
                        log(c.green + `✅ Auto-follow completed! (Method: ${followResult.method})` + c.reset);
                    } else {
                        log(c.yellow + `⚠️ Auto-follow failed: ${followResult.error}` + c.reset);
                    }
                } catch (e) {
                    log(c.yellow + '⚠️ Auto-follow error: ' + e.message + c.reset);
                }

                // ---- SEND CONNECTION MESSAGE ----
                try {
                    const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                    const time = new Date().toLocaleString('en-US', { 
                        timeZone: settings.timezone || 'Africa/Lagos', 
                        hour12: true, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    
                    // Get current font and style
                    const fontId = getCurrentFont();
                    const styleId = getCurrentStyle();
                    
                    // Define sections
                    const sections = [
                        {
                            title: 'BOT CONNECTED',
                            lines: [
                                `📅 Date: ${time.split(',')[0] || time}`,
                                `⌚ Time: ${time.split(', ')[1] || time}`,
                                `✅ Status: Online`,
                                `💻 Version: ${settings.version}`,
                                `👤 Owner: Sir Wally Jay`,
                                `📞 Contact: +2348144317152`,
                                `🌐 Prefix: ${settings.prefix}`,
                                `🔒 Mode: ${getBotMode()}`,
                                `💡 Commands: ${getCommandCount()}+`
                            ]
                        },
                        {
                            title: 'QUICK START',
                            lines: [
                                `📂 .menu    → All commands`,
                                `📖 .help    → Bot guide`,
                                `📞 .owner   → Contact owner`,
                                `⚙️ .settings → Bot settings`,
                                `📶 .ping    → Check speed`,
                                `🔄 .update  → Update bot`
                            ]
                        },
                        {
                            title: 'CONNECT',
                            lines: [
                                `💬 Support Group`,
                                `📺 YouTube Channel`,
                                `⭐ GitHub Repo`,
                                `🔔 Channel Updates`
                            ]
                        },
                        {
                            title: 'LINKS',
                            lines: [
                                `🔗 WhatsApp Channel:`,
                                `https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I`,
                                ``,
                                `💬 Support group:`,
                                `https://chat.whatsapp.com/KPCQtZRe6jx62tkNxXDxPs?mode=gi_t`,
                                ``,
                                `📺 YouTube: WALLY JAY TECH`,
                                ``,
                                `⭐ GitHub:`,
                                `https://github.com/wallyjaytechh`
                            ]
                        },
                        {
                            title: 'COPYRIGHT',
                            lines: [
                                `©️ 2025-2026`,
                                `WALLYJAYTECH-MD`,
                                `All Rights Reserved.`
                            ]
                        }
                    ];
                    
                    // Build the full message
                    let fullMessage = buildConnectionMessage(styleId, sections);
                    
                    // Apply font to entire message
                    let finalMessage = applyFont(fullMessage, fontId);
                    
                    // Protect URLs from font (keep them clickable)
                    finalMessage = finalMessage.replace(/(https?:\/\/[^\s]+)/g, (url) => url);
                    
                    let img; 
                    const ip = path.join(__dirname, 'assets', 'bot_image.jpg');
                    if (fs.existsSync(ip)) img = fs.readFileSync(ip); 
                    else { 
                        try { 
                            const r = await fetch('https://raw.githubusercontent.com/wallyjaytechh/WALLYJAYTECH-MD/main/assets/bot_image.jpg'); 
                            if (r.ok) img = await r.buffer(); 
                        } catch (e) {} 
                    }
                    
                    if (img) {
                        await XeonBotInc.sendMessage(botNumber, { 
                            image: img, 
                            caption: finalMessage,
                            contextInfo: { 
                                forwardingScore: 999, 
                                isForwarded: true, 
                                forwardedNewsletterMessageInfo: { 
                                    newsletterJid: '120363420618370733@newsletter', 
                                    newsletterName: '\u200E', 
                                    serverMessageId: -1 
                                } 
                            } 
                        });
                    } else {
                        await XeonBotInc.sendMessage(botNumber, { 
                            text: finalMessage,
                            contextInfo: { 
                                forwardingScore: 999, 
                                isForwarded: true, 
                                forwardedNewsletterMessageInfo: { 
                                    newsletterJid: '120363420618370733@newsletter', 
                                    newsletterName: '\u200E', 
                                    serverMessageId: -1 
                                } 
                            } 
                        });
                    }
                } catch (e) {
                    log(c.red + 'Error sending connection message: ' + e.message + c.reset);
                }
                log(c.green + 'Bot Connected!' + c.reset);
            }
            if (connection === 'close') {
                if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut || lastDisconnect?.error?.output?.statusCode === 401) { try { rmSync('./session', { recursive: true, force: true }); } catch (e) {} return; }
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; setTimeout(startXeonBotInc, Math.min(5000 * reconnectAttempts, 30000)); }
                else process.exit(1);
            }
        });

        const { handleAnticall } = require('./commands/anticall');
        XeonBotInc.ev.on('call', async (calls) => { await handleAnticall(XeonBotInc, calls); });
        XeonBotInc.ev.on('group-participants.update', async (update) => { await handleGroupParticipantUpdate(XeonBotInc, update); });
        XeonBotInc.ev.on('messages.upsert', async (m) => {
            if (!m.messages || m.messages.length <= 1) return;
            const sm = m.messages.filter(msg => msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe && msg.key.participant);
            if (sm.length > 0) { const sc = readStatusConfig(); if (sc.enabled === true) handleBulkStatusUpdate(XeonBotInc, sm).catch(() => {}); }
        });
        return XeonBotInc;
    } catch (error) { if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; await delay(5000 * reconnectAttempts); startXeonBotInc(); } }
}

log(c.cyan + 'Starting WALLYJAYTECH-MD Bot...' + c.reset);
startXeonBotInc().catch(error => { log(c.red + 'Fatal error: ' + error.message + c.reset); process.exit(1); });

process.on('SIGINT', async () => { try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {} try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });
process.on('SIGTERM', async () => { try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {} try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });
process.on('uncaughtException', (err) => { log(c.red + 'Uncaught Exception: ' + err.message + c.reset); });
process.on('unhandledRejection', (err) => { log(c.red + 'Unhandled Rejection: ' + err.message + c.reset); });

let file = require.resolve(__filename);
fs.watchFile(file, () => { fs.unwatchFile(file); log(c.red + 'Update ' + __filename + c.reset); delete require.cache[file]; require(file); });
