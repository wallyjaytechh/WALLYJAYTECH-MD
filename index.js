//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//

global.File = class File {};
require('./settings');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { handleMessages, handleGroupParticipantUpdate } = require('./main');
const { handleStatusUpdate, handleBulkStatusUpdate } = require('./commands/autostatus');
const PhoneNumber = require('awesome-phonenumber');
const { smsg } = require('./lib/myfunc');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const readline = require("readline");
const { rmSync } = require('fs');

// Import lightweight store
const store = require('./lib/lightweight_store');
store.readFromFile();
const settings = require('./settings');
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);

// Memory optimization
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection completed');
    }
}, 60000);

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...');
        process.exit(1);
    }
}, 30000);

let phoneNumber = "2348155763709";
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));

global.botname = "WALLYJAYTECH-MD";
global.themeemoji = "🤖";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve));
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber);
    }
};

function getCommandCount() {
    try {
        const mainJsPath = path.join(__dirname, 'main.js');
        const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        const casePattern = /case\s+userMessage\s*(===|\.startsWith\(|\.includes\(|\.match\()\s*['"`]\.([^'"`]+)['"`]/g;
        let match, commandCount = 0;
        while ((match = casePattern.exec(mainJsContent)) !== null) {
            if (match[2]) commandCount++;
        }
        return commandCount || 150;
    } catch (error) {
        return 150;
    }
}

async function startXeonBotInc() {
    try {
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        store.bind(XeonBotInc.ev);

        // Message handling
        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    handleStatusUpdate(XeonBotInc, chatUpdate).catch(err => {
                        console.error("Status view error:", err.message);
                    });
                }
                
                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us');
                    if (!isGroup) return;
                }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

                if (XeonBotInc?.msgRetryCounterCache) {
                    XeonBotInc.msgRetryCounterCache.clear();
                }

                try {
                    await handleMessages(XeonBotInc, chatUpdate, true);
                } catch (err) {
                    console.error("Error in handleMessages:", err);
                    if (mek.key && mek.key.remoteJid) {
                        await XeonBotInc.sendMessage(mek.key.remoteJid, {
                            text: '❌ An error occurred while processing your message.',
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363420618370733@newsletter',
                                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                                    serverMessageId: -1
                                }
                            }
                        }).catch(console.error);
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert:", err);
            }
        });

        XeonBotInc.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        XeonBotInc.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = XeonBotInc.decodeJid(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        });

        XeonBotInc.getName = (jid, withoutContact = false) => {
            let id = XeonBotInc.decodeJid(jid);
            withoutContact = XeonBotInc.withoutContact || withoutContact;
            let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {};
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
            });
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
                XeonBotInc.user :
                (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        };

        XeonBotInc.public = true;
        XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store);

        // Handle pairing code
        if (pairingCode && !XeonBotInc.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api');
            let phoneNumber;
            if (!!global.phoneNumber) {
                phoneNumber = global.phoneNumber;
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 2348155763709 (without + or spaces) : `)));
            }
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            const pn = require('awesome-phonenumber');
            if (!pn('+' + phoneNumber).isValid()) {
                console.log(chalk.red('Invalid phone number. Please enter your full international number.'));
                process.exit(1);
            }
            setTimeout(async () => {
                try {
                    let code = await XeonBotInc.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
                    console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`));
                } catch (error) {
                    console.error('Error requesting pairing code:', error);
                }
            }, 3000);
        }

        // Connection handling
        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            
            if (qr) {
                console.log(chalk.cyan('📱 QR Code generated. Please scan with WhatsApp.'));
            }
            
            if (connection === 'connecting') {
                console.log(chalk.cyan('🔄 Connecting to WhatsApp...'));
            }
            
            if (connection == "open") {
                console.log(chalk.magenta(` `));
                console.log(chalk.cyan(`🌿Connected to => ` + JSON.stringify(XeonBotInc.user, null, 2)));
                
                // Start auto-update checker
                try {
                    const { autoCheckUpdates } = require('./commands/checkupdate');
                    autoCheckUpdates(XeonBotInc);
                } catch (error) {
                    console.error('Failed to start auto-update checker:', error);
                }
                
                try {
                    const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                    await XeonBotInc.sendMessage(botNumber, {
                        text: `╔═══════════════════╗
║   🤖 BOT ACTIVATED!   ║
╠═══════════════════╣
║  📅 ${new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos' })}
║  ✅ Status: ONLINE & READY
║  💻 Version: ${settings.version}
║  👤 Owner: ${settings.botOwner}
║  📞 Contact: ${settings.ownerNumber}
║  🌐 Prefix: ${settings.prefix}
║  💡 ${getCommandCount()}+ Commands
╠═══════════════════╣
║   🚀 GET STARTED   ║
╠═══════════════════╣
║  📖 .menu - All commands
║  ℹ️ .help - Bot guide
║  👑 .owner - Contact
║  🐛 .reportbug - Issues
║  ⚙️ .settings - Settings
║  🔄 .update - Update
║  📊 .ping - Check speed
║  🔍 .mode - Bot status
╠═══════════════════╣
║   📢 IMPORTANT    ║
╠═══════════════════╣
║  💬 Join support group
║  📺 Subscribe YouTube
║  ⭐ Star GitHub repo
║  🔔 Channel notifications
║  📚 Read documentation
║  🛡️ No spam commands
║  ⚠️ Follow WhatsApp ToS
╚═══════════════════╝

*🔗 Channel:* ${global.channelLink}
*💬 Support:* https://chat.whatsapp.com/HggBPlh2UEMEHaGwOcaVkE?mode=hqrt1
*📺 YouTube:* https://youtube.com/@wallyjaytechy
*💻 GitHub:* https://github.com/wallyjaytechh

*🛠️ WALLYJAYTECH-MD - Professional WhatsApp Bot*`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363420618370733@newsletter',
                                newsletterName: 'WALLYJAYTECH-MD BOTS',
                                serverMessageId: -1
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error sending connection message:', error.message);
                }

                await delay(1999);
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'WALLYJAYTECH-MD'} ]`)}\n\n`));
                console.log(chalk.cyan(`< ================================================== >`));
                console.log(chalk.magenta(`\n${global.themeemoji || '•'} YT CHANNEL: WALLY JAY TECH`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: wallyjaytechh`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: WALLY JAY TECH`));
                console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`));
                console.log(chalk.blue(`Bot Version: ${settings.version}`));
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(chalk.red(`Connection closed due to ${lastDisconnect?.error}, reconnecting ${shouldReconnect}`));
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true });
                        console.log(chalk.yellow('Session folder deleted. Please re-authenticate.'));
                    } catch (error) {
                        console.error('Error deleting session:', error);
                    }
                }
                
                if (shouldReconnect) {
                    console.log(chalk.yellow('Reconnecting...'));
                    await delay(5000);
                    startXeonBotInc();
                }
            }
        });

        // Anticall handler
        const { handleAnticall } = require('./commands/anticall');
        XeonBotInc.ev.on('call', async (calls) => {
            await handleAnticall(XeonBotInc, calls);
        });

        // Group participants handler
        XeonBotInc.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(XeonBotInc, update);
        });

        // Bulk status handler
        XeonBotInc.ev.on('messages.upsert', async (m) => {
            if (m.messages && m.messages.length > 1) {
                const statusMessages = m.messages.filter(msg => 
                    msg.key && msg.key.remoteJid === 'status@broadcast'
                );
                if (statusMessages.length > 0) {
                    handleBulkStatusUpdate(XeonBotInc, statusMessages).catch(err => {
                        console.error("Bulk status error:", err.message);
                    });
                }
            }
        });

        return XeonBotInc;
    } catch (error) {
        console.error('Error in startXeonBotInc:', error);
        await delay(5000);
        startXeonBotInc();
    }
}

// Start the bot
startXeonBotInc().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
