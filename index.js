//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                      //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//

const log = (...args) => process.stderr.write(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') + '\n');

const c = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
    white: '\x1b[37m', bgGreen: '\x1b[42m', bgBlack: '\x1b[40m', bold: '\x1b[1m', black: '\x1b[30m',
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

const { getCurrentStyle } = require('./commands/menustyle');
const { getCurrentFont, applyFont } = require('./commands/menufont');

try { const autorecord = require('./commands/autorecord'); autorecord.stopAllInfiniteRecordings(); } catch (e) {}
try { const autotyping = require('./commands/autotyping'); autotyping.stopAllInfiniteTyping(); } catch (e) {}

const { handleStatusUpdate, handleBulkStatusUpdate } = require('./commands/autostatus');
const { storeMessage } = require('./commands/antidelete');
const PhoneNumber = require('awesome-phonenumber');
const { smsg } = require('./lib/myfunc');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, jidNormalizedUser, makeCacheableSignalKeyStore, delay } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { rmSync } = require('fs');

const store = require('./lib/lightweight_store');
store.readFromFile();
const settings = require('./settings');

setInterval(() => { try { store.writeToFile(); } catch (e) {} }, settings.storeWriteInterval || 10000);

function getServerId() {
    if (process.env.SERVER_ID) return process.env.SERVER_ID;
    const fullUuid = process.env.P_SERVER_UUID;
    return fullUuid ? fullUuid.split('-')[0] : null;
}

async function appendSlotLog(slotNumber, message, tier = null) {
    const tierTag = tier ? `[${String(tier).toUpperCase()}] ` : '';
    const formatted = typeof message === 'string' && message.startsWith(`[Bot ${slotNumber}]`)
        ? message
        : `[Bot ${slotNumber}] ${tierTag}${message}`;
    log(formatted);

    const serverId = getServerId();
    if (!serverId || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;

    try {
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/deploy_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
                server_id: serverId,
                slot_number: slotNumber,
                log: formatted,
            }),
        });
    } catch (e) {}
}

async function patchSlotRow(userId, tier, slotNumber, patchBody) {
    if (!userId || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;
    const normalizedTier = String(tier || process.env.BOT_TIER || 'free').toLowerCase();
    try {
        await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/bot_slots?user_id=eq.${encodeURIComponent(userId)}&tier=eq.${encodeURIComponent(normalizedTier)}&slot_number=eq.${slotNumber}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                },
                body: JSON.stringify({
                    ...patchBody,
                    updated_at: new Date().toISOString(),
                }),
            }
        );
    } catch (e) {}
}

async function markOfflineInSupabase(userId, tier, slotNumber) {
    try {
        if (userId && slotNumber) {
            await patchSlotRow(userId, tier, slotNumber, { bot_status: 'offline' });
        }

        const serverId = getServerId();
        if (serverId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
            await fetch(`${process.env.SUPABASE_URL}/rest/v1/user_settings?server_id=eq.${serverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({ bot_status: 'offline' })
            });
            await appendSlotLog(slotNumber || 1, c.yellow + '🛑 Bot marked offline in database' + c.reset, tier);
        }
    } catch (e) { log(c.red + 'Failed to update DB offline status: ' + e.message + c.reset); }
}

async function markConnectedInSupabase(userId, tier, slotNumber) {
    try {
        if (userId && slotNumber) {
            await patchSlotRow(userId, tier, slotNumber, { bot_status: 'connected', pairing_code: null });
        }

        const serverId = getServerId();
        if (serverId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
            await fetch(`${process.env.SUPABASE_URL}/rest/v1/user_settings?server_id=eq.${serverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({ bot_status: 'connected', pairing_code: null, restart_started_at: null })
            });
            await appendSlotLog(slotNumber || 1, c.green + '✅ Bot is connected!' + c.reset, tier);
        }
    } catch (e) { log(c.red + 'Failed to update DB status: ' + e.message + c.reset); }
}

function readStatusConfig() {
    try { const p = path.join(__dirname, 'data', 'autostatus.json'); if (fs.existsSync(p)) { const c = JSON.parse(fs.readFileSync(p, 'utf8')); return { enabled: c.enabled === true, likeOn: c.likeOn === true, selfOn: c.selfOn === true }; } } catch (e) {}
    return { enabled: false, likeOn: false, selfOn: false };
}
function getBotMode() {
    try { const p = path.join(__dirname, 'data', 'messageCount.json'); if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'Public' : 'Private'; } return 'Public'; } catch (e) { return 'Public'; }
}

setInterval(() => {
    const memMB = process.memoryUsage().rss / 1024 / 1024;
    if (memMB > 500 && global.gc) {
        global.gc();
    }
}, 60 * 1000);

let owner = JSON.parse(fs.readFileSync('./data/owner.json'));
global.botname = "WALLYJAYTECH-MD";
global.themeemoji = "🤖";
const useMobile = process.argv.includes("--mobile");

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

async function sendMenuAudio(sock, chatId, message) {
    try {
        const audioPath = path.join(__dirname, 'assets', 'menu_audio.mp3');
        if (fs.existsSync(audioPath)) {
            const opts = message ? { quoted: message } : {};
            await sock.sendMessage(chatId, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mpeg',
                ptt: false
            }, opts);
            return true;
        }
        return false;
    } catch (e) {
        log(c.yellow + '⚠️ Menu audio send failed: ' + e.message + c.reset);
        return false;
    }
}

async function autoJoinGroup(sock, groupLink, slotNumber, tier, retryCount = 0) {
    const maxRetries = 3;
    try {
        let inviteCode = groupLink;
        if (groupLink.includes('chat.whatsapp.com/')) {
            inviteCode = groupLink.split('chat.whatsapp.com/')[1];
            if (inviteCode.includes('?')) {
                inviteCode = inviteCode.split('?')[0];
            }
        }

        await appendSlotLog(slotNumber, c.cyan + `🔄 Attempting to join group (attempt ${retryCount + 1})...` + c.reset, tier);
        await sock.groupAcceptInvite(inviteCode);
        await appendSlotLog(slotNumber, c.green + '✅ Auto-joined group successfully!' + c.reset, tier);
        return { success: true, method: 'groupAcceptInvite' };
    } catch (e) {
        if (e.message && (e.message.includes('already in group') || e.message.includes('already participant') || e.message.includes('401') || e.message.includes('not-authorized'))) {
            await appendSlotLog(slotNumber, c.cyan + 'ℹ️ Bot is already in the group' + c.reset, tier);
            return { success: true, method: 'already_in_group' };
        }

        if (retryCount < maxRetries) {
            await appendSlotLog(slotNumber, c.yellow + `⚠️ Join failed, retrying... (${retryCount + 1}/${maxRetries})` + c.reset, tier);
            await delay(2000 * (retryCount + 1));
            return autoJoinGroup(sock, groupLink, slotNumber, tier, retryCount + 1);
        }

        await appendSlotLog(slotNumber, c.red + '❌ All join methods failed: ' + e.message + c.reset, tier);
        return { success: false, error: e.message };
    }
}

async function autoFollowChannel(sock, channelJid, slotNumber, tier) {
    const methods = [
        { name: 'newsletterFollow', fn: async () => await sock.newsletterFollow({ newsletterJid: channelJid }) },
        { name: 'sendMessage', fn: async () => await sock.sendMessage(channelJid, { follow: true }) }
    ];

    for (let i = 0; i < methods.length; i++) {
        try {
            const method = methods[i];
            await appendSlotLog(slotNumber, c.cyan + `🔄 Trying to follow channel using: ${method.name}...` + c.reset, tier);
            await method.fn();
            await appendSlotLog(slotNumber, c.green + `✅ Successfully followed channel using: ${method.name}` + c.reset, tier);
            return { success: true, method: method.name };
        } catch (e) {
            if (e.message && (e.message.includes('already following') || e.message.includes('already subscribed') || e.message.includes('already'))) {
                await appendSlotLog(slotNumber, c.cyan + 'ℹ️ Already following the channel' + c.reset, tier);
                return { success: true, method: 'already_following' };
            }
            await appendSlotLog(slotNumber, c.yellow + `⚠️ Method ${method.name} failed: ${e.message}` + c.reset, tier);
            if (i < methods.length - 1) {
                await delay(1000);
            }
        }
    }

    await appendSlotLog(slotNumber, c.red + '❌ All follow methods failed' + c.reset, tier);
    return { success: false, error: 'All methods failed' };
}

async function sendCodeToSupabase(code, method, userId, tier, slotNumber) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        await appendSlotLog(slotNumber, c.yellow + '⚠️ Supabase credentials missing.' + c.reset, tier);
        return;
    }

    if (userId && slotNumber) {
        await patchSlotRow(userId, tier, slotNumber, {
            pairing_code: code,
            connection_method: method,
        });
    }

    const serverId = getServerId();
    if (!serverId) return;

    for (let attempt = 1; attempt <= 15; attempt++) {
        try {
            const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/user_settings?server_id=eq.${serverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ pairing_code: code, connection_method: method })
            });
            const rows = res.ok ? await res.json() : [];
            if (rows.length > 0) {
                await appendSlotLog(slotNumber, c.green + `✅ ${method} code saved (attempt ${attempt})` + c.reset, tier);
                return;
            }
            await appendSlotLog(slotNumber, c.yellow + `⏳ No row for ${serverId} yet (attempt ${attempt}), retrying...` + c.reset, tier);
        } catch (err) {
            await appendSlotLog(slotNumber, c.red + `❌ Supabase error: ${err.message}` + c.reset, tier);
        }
        await delay(4000);
    }
}

function buildConnectionMessage(styleId, sections) {
    let fullMessage = '';
    for (const section of sections) {
        if (styleId === 1) {
            fullMessage += `╭──◆「 *${section.title}* 」◆\n├\n`;
            for (const line of section.lines) fullMessage += `├◇ ${line}\n`;
            fullMessage += `├\n╰─┬─★─☆─♪♪─◆\n\n`;
        } else if (styleId === 2) {
            fullMessage += `◈──────────────────────◈\n           *${section.title}*\n◈──────────────────────◈\n\n`;
            for (const line of section.lines) fullMessage += `▤ ${line}\n`;
            fullMessage += `◈──────────────────────◈\n\n`;
        } else if (styleId === 3) {
            fullMessage += `╔══════════════════╗\n║ *${section.title}*\n║ ══════════════════\n`;
            for (const line of section.lines) fullMessage += `║ ${line}\n`;
            fullMessage += `╚══════════════════╝\n\n`;
        } else if (styleId === 4) {
            fullMessage += `╭──〔 *${section.title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
            for (const line of section.lines) fullMessage += `║☠║ ${line}\n`;
            fullMessage += `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n`;
        } else if (styleId === 5) {
            fullMessage += `  🌀◈── *${section.title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
            for (const line of section.lines) fullMessage += `┊ ${line}\n`;
            fullMessage += `╰──────·••─────•────●○\n\n`;
        } else if (styleId === 6) {
            fullMessage += `╭──〈 *${section.title}* 〉──💕⃝🕊️\n`;
            for (const line of section.lines) fullMessage += `⚚  ${line}\n`;
            fullMessage += `╰────────────────✌︎㋡\n\n`;
        } else if (styleId === 7) {
            fullMessage += `╔══════════════════❥❥❥\n✧  *${section.title}*\n╚══════════════════❥❥❥\n`;
            for (const line of section.lines) fullMessage += `✧  ${line}\n`;
            fullMessage += `\n`;
        } else {
            fullMessage += `◈──────────────────────◈\n           *${section.title}*\n◈──────────────────────◈\n\n`;
            for (const line of section.lines) fullMessage += `▤ ${line}\n`;
            fullMessage += `◈──────────────────────◈\n\n`;
        }
    }
    if (styleId === 1) fullMessage += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    else if (styleId === 2 || !styleId) fullMessage += `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
    else if (styleId === 3) fullMessage += `╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
    else if (styleId === 4) fullMessage += `╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
    else if (styleId === 5) fullMessage += `╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
    else if (styleId === 6) fullMessage += `╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
    else if (styleId === 7) fullMessage += `╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
    else fullMessage += `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;

    try {
        const fontId = getCurrentFont();
        fullMessage = fullMessage.split(/(https?:\/\/\S+)/g).map((part, i) => (i % 2 === 1 ? part : applyFont(part, fontId))).join('');
    } catch (e) {}
    return fullMessage;
}

function createSlotRunner(slotConfig) {
    const slotNumber = Number(slotConfig.slot_number || 1);
    const tier = String(slotConfig.tier || process.env.BOT_TIER || 'free').toLowerCase();
    const userId = slotConfig.user_id || process.env.USER_ID || null;
    const phoneNumber = slotConfig.whatsapp_number || process.env.WHATSAPP_NUMBER || "2348155763709";
    const connectionMethod = slotConfig.connection_method || process.env.CONNECTION_METHOD || "pairing";
    const pairingCode = connectionMethod === 'pairing';
    const sessionDir = `./session_slot_${tier}_${slotNumber}`;
    const backupDir = `./session_backup_slot_${tier}_${slotNumber}`;

    let stopped = false;
    let reconnectAttempts = 0;
    let startupTasksDone = false;
    let currentSock = null;
    let backupTimer = null;
    const MAX_RECONNECT_ATTEMPTS = 5;

    async function startSocket() {
        if (stopped) return null;
        try {
            reconnectAttempts = 0;
            let { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            const msgRetryCounterCache = new NodeCache();

            const XeonBotInc = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: !pairingCode && slotNumber === 1,
                browser: ["Ubuntu", "Chrome", "120.0.6099.109"],
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                getMessage: async (key) => {
                    let j = jidNormalizedUser(key.remoteJid);
                    let m = await store.loadMessage(j, key.id);
                    return m?.message || "";
                },
                msgRetryCounterCache,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
            });

            currentSock = XeonBotInc;
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
                let pn = phoneNumber.replace(/[^0-9]/g, '');
                if (!require('awesome-phonenumber')('+' + pn).isValid()) {
                    await appendSlotLog(slotNumber, c.red + 'Invalid WhatsApp number.' + c.reset, tier);
                    return XeonBotInc;
                }
                setTimeout(async () => {
                    if (stopped) return;
                    try {
                        let code = await XeonBotInc.requestPairingCode(pn);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        await appendSlotLog(slotNumber, c.bgGreen + c.black + 'Code: ' + code + c.reset, tier);
                        await sendCodeToSupabase(code, 'pairing', userId, tier, slotNumber);
                    } catch (e) {}
                }, 3000);
            }

            XeonBotInc.ev.on('connection.update', async (s) => {
                if (stopped) return;
                const { connection, lastDisconnect, qr } = s;

                if (qr && !pairingCode) {
                    await appendSlotLog(slotNumber, c.cyan + 'QR Code generated.' + c.reset, tier);
                    await sendCodeToSupabase(qr, 'qr', userId, tier, slotNumber);
                }

                if (connection === 'connecting') {
                    await appendSlotLog(slotNumber, c.cyan + 'Connecting...' + c.reset, tier);
                }

                if (connection == "open") {
                    await appendSlotLog(slotNumber, c.cyan + 'Connected => ' + JSON.stringify(XeonBotInc.user, null, 2) + c.reset, tier);
                    reconnectAttempts = 0;

                    if (startupTasksDone) {
                        await markConnectedInSupabase(userId, tier, slotNumber);
                        await appendSlotLog(slotNumber, c.green + 'Reconnected (startup tasks skipped)' + c.reset, tier);
                        return;
                    }
                    startupTasksDone = true;

                    try { const groups = await XeonBotInc.groupFetchAllParticipating(); for (const g of Object.values(groups)) { if (store.chats) store.chats[g.id] = { id: g.id, ...g }; } } catch (e) {}
                    if (!backupTimer) {
                        backupTimer = setInterval(() => {
                            if (stopped) return;
                            try {
                                if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
                                fs.cpSync(sessionDir, backupDir, { recursive: true });
                            } catch (e) {}
                        }, 60 * 60 * 1000);
                    }

                    try {
                        const groupLink = 'https://chat.whatsapp.com/BBfGgXmLwUd7F1EinwDAOr?s=cl&p=i&ilr=2';
                        await autoJoinGroup(XeonBotInc, groupLink, slotNumber, tier);
                    } catch (e) {}

                    try {
                        const channelJid = '0029Vb8XUSaISTkPmArfme11@newsletter';
                        await autoFollowChannel(XeonBotInc, channelJid, slotNumber, tier);
                    } catch (e) {}

                    try {
                        const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                        const time = new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                        const modeText = getBotMode();
                        const currentStyle = getCurrentStyle() || 2;
                        const currentFont = getCurrentFont() || 1;
                        const imagePath = path.join(__dirname, 'assets', 'bot_image.jpg');
                        const gifPath = path.join(__dirname, 'assets', 'menu_video.mp4');
                        const audioPath = path.join(__dirname, 'assets', 'menu_audio.mp3');
                        const hasImage = fs.existsSync(imagePath);
                        const hasGif = fs.existsSync(gifPath);
                        const hasAudio = fs.existsSync(audioPath);

                        let menuType = 'Text';
                        if (hasImage && hasGif) menuType = Math.random() < 0.5 ? 'Image' : 'GIF';
                        else if (hasImage) menuType = 'Image';
                        else if (hasGif) menuType = 'GIF';

                        let mediaDisplay = hasAudio ? `${menuType} & Audio` : menuType;

                        const sections = [
                            { title: 'BOT CONNECTED', lines: [`📅 Date: ${time.split(',')[0] || time}`, `⌚ Time: ${time.split(', ')[1] || time}`, `✅ Status: Online`, `💻 Version: ${settings.version}`, `👤 Owner: Wally Jay`, `📞 Contact: +2348144317152`, `🌐 Prefix: ${settings.prefix}`, `🔒 Mode: ${modeText}`, `🎨 Style: ${currentStyle}`, `🖋️ Font: ${currentFont}`, `🎬 Media: ${mediaDisplay}`, `💡 Commands: ${getCommandCount()}+`] },
                            { title: 'QUICK START', lines: [`📂 .fullmenu    → All commands`, `📞 .owner   → Contact owner`, `⚙️ .settings → Bot settings`, `📶 .ping    → Check speed`, `🔄 .update  → Update bot`] },
                            { title: 'CONNECT', lines: [`💬 Support Group`, `📺 YouTube Channel`, `⭐ GitHub Repo`, `🔔 Channel Updates`] },
                            { title: 'LINKS', lines: [`🔗 WhatsApp Channel:`, `https://whatsapp.com/channel/0029Vb8XUSaISTkPmArfme11`, ``, `💬 Support group:`, `https://chat.whatsapp.com/BBfGgXmLwUd7F1EinwDAOr?s=cl&p=i&ilr=2`, ``, `📺 YouTube: WALLY JAY TECH`, ``, `⭐ GitHub:`, `https://github.com/wallyjaytechh`] },
                            { title: 'COPYRIGHT', lines: [`© 2025-2026`, `WALLYJAYTECH-MD`, `All Rights Reserved.`] }
                        ];

                        const fullMessage = buildConnectionMessage(currentStyle, sections);
                        const channelCtx = { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: '\u200E', serverMessageId: -1 } };

                        if (menuType === 'GIF') {
                            await XeonBotInc.sendMessage(botNumber, { video: fs.readFileSync(gifPath), mimetype: 'video/mp4', gifPlayback: true, caption: fullMessage, contextInfo: channelCtx });
                        } else if (menuType === 'Image') {
                            await XeonBotInc.sendMessage(botNumber, { image: fs.readFileSync(imagePath), caption: fullMessage, contextInfo: channelCtx });
                        } else {
                            let img;
                            try { const r = await fetch('https://raw.githubusercontent.com/wallyjaytechh/WALLYJAYTECH-MD/main/assets/bot_image.jpg'); if (r.ok) img = await r.buffer(); } catch (e) {}
                            if (img) await XeonBotInc.sendMessage(botNumber, { image: img, caption: fullMessage, contextInfo: channelCtx });
                            else await XeonBotInc.sendMessage(botNumber, { text: fullMessage, contextInfo: channelCtx });
                        }

                        await new Promise(r => setTimeout(r, 1000));
                        await sendMenuAudio(XeonBotInc, botNumber, null);
                    } catch (e) { await appendSlotLog(slotNumber, c.red + 'Error sending connection message: ' + e.message + c.reset, tier); }

                    await markConnectedInSupabase(userId, tier, slotNumber);
                    await appendSlotLog(slotNumber, c.green + 'Bot Connected!' + c.reset, tier);
                }

                if (connection === 'close') {
                    await markOfflineInSupabase(userId, tier, slotNumber);
                    if (stopped) return;

                    if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut || lastDisconnect?.error?.output?.statusCode === 401) {
                        try { rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}
                        return;
                    }
                    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttempts++;
                        setTimeout(startSocket, Math.min(5000 * reconnectAttempts, 30000));
                    }
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
        } catch (error) {
            if (!stopped && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                await delay(5000 * reconnectAttempts);
                return startSocket();
            }
            return null;
        }
    }

    return {
        start: startSocket,
        stop: async () => {
            stopped = true;
            if (backupTimer) {
                clearInterval(backupTimer);
                backupTimer = null;
            }
            try { currentSock?.ws?.close?.(); } catch (e) {}
            await markOfflineInSupabase(userId, tier, slotNumber);
        },
    };
}

const activeRunners = new Map();

async function fetchUserSlotsFromSupabase(userId) {
    if (!userId || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
    try {
        const res = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/bot_slots?user_id=eq.${encodeURIComponent(userId)}&order=tier.asc,slot_number.asc`,
            {
                headers: {
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                },
            }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

async function syncBotSlots() {
    const userId = process.env.USER_ID;
    const rows = await fetchUserSlotsFromSupabase(userId);

    const desiredSlots = (Array.isArray(rows) && rows.length > 0)
        ? rows
        : [{
            tier: String(process.env.BOT_TIER || 'free').toLowerCase(),
            slot_number: Number(process.env.BOT_SLOT || 1),
            user_id: userId || null,
            whatsapp_number: process.env.WHATSAPP_NUMBER || "2348155763709",
            connection_method: process.env.CONNECTION_METHOD || "pairing",
        }];

    const desiredKeys = new Set(
        desiredSlots.map(s => `${String(s.tier || process.env.BOT_TIER || 'free').toLowerCase()}:${Number(s.slot_number || 1)}`)
    );

    for (const [key, entry] of activeRunners.entries()) {
        if (!desiredKeys.has(key)) {
            await entry.runner.stop();
            activeRunners.delete(key);
        }
    }

    for (const slot of desiredSlots) {
        const slotTier = String(slot.tier || process.env.BOT_TIER || 'free').toLowerCase();
        const num = Number(slot.slot_number || 1);
        const key = `${slotTier}:${num}`;
        const signature = `${slot.connection_method || 'pairing'}|${slot.whatsapp_number || ''}`;
        const existing = activeRunners.get(key);

        if (!existing) {
            const runner = createSlotRunner({ ...slot, tier: slotTier, slot_number: num });
            activeRunners.set(key, { runner, signature });
            runner.start();
        } else if (existing.signature !== signature) {
            await existing.runner.stop();
            const runner = createSlotRunner({ ...slot, tier: slotTier, slot_number: num });
            activeRunners.set(key, { runner, signature });
            runner.start();
        }
    }
}

log(c.cyan + 'Starting WALLYJAYTECH-MD Bot Manager...' + c.reset);
syncBotSlots().catch(error => {
    log(c.red + 'Fatal error: ' + error.message + c.reset);
    process.exit(1);
});
setInterval(syncBotSlots, 4000);

process.on('SIGINT', async () => {
    for (const [, entry] of activeRunners.entries()) {
        await entry.runner.stop();
    }
    try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {}
    try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {}
    try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {}
    process.exit(0);
});

process.on('SIGTERM', async () => {
    for (const [, entry] of activeRunners.entries()) {
        await entry.runner.stop();
    }
    try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {}
    try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {}
    try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {}
    process.exit(0);
});

process.on('uncaughtException', (err) => { log(c.red + 'Uncaught Exception: ' + err.message + c.reset); });
process.on('unhandledRejection', (err) => { log(c.red + 'Unhandled Rejection: ' + err.message + c.reset); });
