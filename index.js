//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                            //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//                                                                                                                                                            //
//                                                                  𝐕 : 1.0.0                                                                                 //
//                                                                                                                                                            //
//                                                                                                                                                            //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                    //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                   //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                   //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                   //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                   //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                    //
//                                                                                                                                                            //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                            //
//                                                                                                                                                            //
//                                                                                                                                                            //
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

global.File = class File {};
require('./settings');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
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

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const store = require('./lib/lightweight_store');
store.readFromFile();
const settings = require('./settings');
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);

function readStatusConfig() {
    try {
        const p = path.join(__dirname, 'data', 'autostatus.json');
        if (fs.existsSync(p)) { const c = JSON.parse(fs.readFileSync(p, 'utf8')); return { enabled: c.enabled === true, reactOn: c.reactOn === true }; }
    } catch (e) {}
    return { enabled: false, reactOn: false };
}

function getBotMode() {
    try {
        const p = path.join(__dirname, 'data', 'messageCount.json');
        if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'PUBLIC 🌐' : 'PRIVATE 🔒'; }
        return 'PUBLIC 🌐';
    } catch (e) { return 'PUBLIC 🌐'; }
}

setInterval(() => { if (global.gc) global.gc(); }, 60000);
setInterval(() => { if (process.memoryUsage().rss / 1024 / 1024 > 400) process.exit(1); }, 30000);

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
        const c = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
        const re = /case\s+userMessage\s*(===|\.startsWith\(|\.includes\(|\.match\()\s*['"`]\.([^'"`]+)['"`]/g;
        let m, count = 0; while ((m = re.exec(c)) !== null) { if (m[2]) count++; }
        return count || 150;
    } catch (e) { return 150; }
}

async function startXeonBotInc() {
    try {
        reconnectAttempts = 0;
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version, logger: pino({ level: 'silent' }), printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
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
                    if (mek.key.fromMe) return;
                    storeMessage(XeonBotInc, mek);
                    const statusConfig = readStatusConfig();
                    if (statusConfig.enabled === true) {
                        handleStatusUpdate(XeonBotInc, chatUpdate).catch(err => console.error("Status view error:", err.message));
                    }
                }

                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') { if (!(mek.key?.remoteJid?.endsWith('@g.us'))) return; }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
                if (XeonBotInc?.msgRetryCounterCache) XeonBotInc.msgRetryCounterCache.clear();

                try { await handleMessages(XeonBotInc, chatUpdate, true); } catch (err) {
                    if (mek.key?.remoteJid && mek.key.remoteJid !== 'status@broadcast') {
                        await XeonBotInc.sendMessage(mek.key.remoteJid, { text: '❌ Error processing message.', contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } }).catch(() => {});
                    }
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
            let pn = global.phoneNumber || await question(chalk.bgBlack(chalk.greenBright(`WhatsApp number (2348155763709): `)));
            pn = pn.replace(/[^0-9]/g, '');
            if (!require('awesome-phonenumber')('+' + pn).isValid()) { console.log(chalk.red('Invalid number.')); process.exit(1); }
            setTimeout(async () => { try { let code = await XeonBotInc.requestPairingCode(pn); code = code?.match(/.{1,4}/g)?.join("-") || code; console.log(chalk.black(chalk.bgGreen(`Code: `)), chalk.black(chalk.white(code))); } catch (e) { console.error('Error:', e); } }, 3000);
        }

        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr) console.log(chalk.cyan('📱 QR Code generated.'));
            if (connection === 'connecting') console.log(chalk.cyan('🔄 Connecting...'));
            if (connection == "open") {
                console.log(chalk.cyan(`🌿Connected => ` + JSON.stringify(XeonBotInc.user, null, 2)));
                reconnectAttempts = 0;
                try {
                    const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                    const time = new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const activationMessage = `╭──❍「 *BOT ACTIVATED* 」❍\n├• 📅 ${time}\n├• ✅ Status: ONLINE & READY\n├• 💻 Version: ${settings.version}\n├• 👤 Owner: ${settings.botOwner}\n├• 📞 Contact: ${settings.ownerNumber}\n├• 🌐 Prefix: ${settings.prefix}\n├• 💻 Mode: ${getBotMode()}\n├• 💡 ${getCommandCount()}+ Commands\n╰─┬─★─☆─♪♪─❍\n╭─┴❍「 *QUICK START* 」❍\n◈ • .menu - All commands\n◈ • .help - Bot guide\n◈ • .owner - Contact owner\n◈ • .settings - Settings\n◈ • .ping - Check speed\n◈ • .update - Update bot\n╰─┬─★─☆─♪♪─❍\n╭─┴❍「 *CONNECT* 」❍\n◈ • 💬 Support Group\n◈ • 📺 YouTube Channel\n◈ • ⭐ GitHub Repo\n◈ • 🔔 Channel Updates\n╰───★─☆─♪♪─❍\n\n*🔗 Channel:* ${global.channelLink}\n*💬 Support:* https://chat.whatsapp.com/HggBPlh2UEMEHaGwOcaVkE?mode=hqrt1\n*📺 YouTube:* https://youtube.com/@wallyjaytechy\n*💻 GitHub:* https://github.com/wallyjaytechh\n\n🤖 WALLYJAYTECH-MD - Professional WhatsApp Bot`;
                    await XeonBotInc.sendMessage(botNumber, { text: activationMessage, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } });
                } catch (e) { console.error('Error sending activation:', e.message); }
                await delay(1999);
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'WALLYJAYTECH-MD'} ]`)}\n\n`));
                console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected! ✅`));
            }
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) { try { rmSync('./session', { recursive: true, force: true }); } catch (e) {} return; }
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; await delay(5000 * reconnectAttempts); startXeonBotInc(); }
            }
        });

        const { handleAnticall } = require('./commands/anticall');
        XeonBotInc.ev.on('call', async (calls) => { await handleAnticall(XeonBotInc, calls); });
        XeonBotInc.ev.on('group-participants.update', async (update) => { await handleGroupParticipantUpdate(XeonBotInc, update); });

        XeonBotInc.ev.on('messages.upsert', async (m) => {
            if (!m.messages || m.messages.length <= 1) return;
            const statusMessages = m.messages.filter(msg => msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe && msg.key.participant);
            if (statusMessages.length > 0) {
                const statusConfig = readStatusConfig();
                if (statusConfig.enabled === true) { handleBulkStatusUpdate(XeonBotInc, statusMessages).catch(err => console.error("Bulk status error:", err.message)); }
            }
        });

        return XeonBotInc;
    } catch (error) {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; await delay(5000 * reconnectAttempts); startXeonBotInc(); }
    }
}

process.on('SIGINT', async () => { try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });
process.on('SIGTERM', async () => { try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });

console.log(chalk.cyan('🚀 Starting WALLYJAYTECH-MD Bot...'));
startXeonBotInc().catch(error => { console.error('Fatal error:', error); process.exit(1); });

process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); });

let file = require.resolve(__filename);
fs.watchFile(file, () => { fs.unwatchFile(file); console.log(chalk.redBright(`Update ${__filename}`)); delete require.cache[file]; require(file); });
