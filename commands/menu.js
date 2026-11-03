/**
 * WALLYJAYTECH-MD - MENU COMMAND (FINAL)
 * - `.menu` : numbered picker (❶–⓯), reply-to-quote opens category sub-menu
 * - `.fullmenu` : full command list
 * - All 7 styles, user's current font, media random (image/video, no audio)
 * - Only the LATEST `.menu` message per chat is valid — old ones expire
 * - Sub-menus do NOT become active sessions
 * - Total commands read directly from help.js so they always match
 */

const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');

// ---- MENU SESSIONS STORE ----
// Key: chatId → { menuMessageId, senderJid, styleId, fontId, timestamp }
// ONLY the .menu message is registered. Sub-menus are NOT registered.
if (!global.__menuSessions) global.__menuSessions = new Map();
const menuSessions = global.__menuSessions;

// ---- CIRCLED NUMBERS ----
const CIRCLED = ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','⓫','⓬','⓭','⓮','⓯'];

// ---- CATEGORY ORDER (must match allCommandsRaw keys) ----
const CATEGORY_ORDER = [
    '🧠 AI',
    '🦹 ANIME',
    '👨‍💻 DEVELOPER',
    '📥 DOWNLOAD',
    '🔤 EPHOTO',
    '😁 FUN',
    '🎮 GAMES',
    '🌐 GENERAL',
    '💻 GITHUB',
    '👥 GROUP',
    '🧩 MISC',
    '🔒 OWNER',
    '💎 PREMIUM SUB',
    '🎨 STICKER',
    '⚙️ TOOLS'
];

// ---- Title-case: first letter of first word only ("AI" → "Ai", "ANIME" → "Anime") ----
function titleCase(name) {
    const cleaned = name.replace(/^[^\s]+\s/, '').trim();
    const lower = cleaned.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ---- READ TOTAL COMMANDS FROM help.js (single source of truth) ----
let cachedHelpCommandsRaw = null;
function loadHelpCommandsRaw() {
    if (cachedHelpCommandsRaw) return cachedHelpCommandsRaw;
    try {
        const helpPath = path.join(__dirname, 'help.js');
        if (!fs.existsSync(helpPath)) return null;
        const src = fs.readFileSync(helpPath, 'utf8');
        const match = src.match(/const\s+allCommandsRaw\s*=\s*\{([\s\S]*?)\n\};/);
        if (!match) return null;
        const vm = require('vm');
        const objLiteral = '({' + match[1] + '\n})';
        const parsed = vm.runInNewContext(objLiteral, {});
        cachedHelpCommandsRaw = parsed;
        return parsed;
    } catch (e) {
        return null;
    }
}

function countTotalCommandsFromHelp() {
    const raw = loadHelpCommandsRaw();
    if (!raw) return 0;
    let count = 0;
    for (const cmds of Object.values(raw)) {
        if (!Array.isArray(cmds)) continue;
        if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
            for (const sub of cmds) count += (sub.cmds?.length || 0);
        } else {
            count += cmds.length;
        }
    }
    return count;
}

// ---- UTILITY FUNCTIONS ----
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

async function getUserStats() {
    try {
        const res = await fetch('https://gemini-proxy-5t1s.onrender.com/v1/stats');
        const data = await res.json();
        return { totalUsers: data.totalUsers || 0, activeUsers: data.activeUsers || 0 };
    } catch (e) { return { totalUsers: 0, activeUsers: 0 }; }
}

function getPrefix() { return settings.prefix || '.'; }

function getBotMode() {
    try {
        const p = path.join(__dirname, '../data/messageCount.json');
        if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'Public' : 'Private'; }
        return 'Public';
    } catch (e) { return 'Public'; }
}

async function getBotPlan() {
    try {
        const ownerNumber = settings.ownerNumber || '';
        const res = await fetch(`https://gemini-proxy-5t1s.onrender.com/v1/premium/check/${ownerNumber}`);
        const data = await res.json();
        if (data.premium && data.remainingDays > 0) return 'Premium';
        return 'Free';
    } catch (e) { return 'Free'; }
}

function getTimeBasedGreeting() {
    try {
        const now = new Date();
        const tz = settings.timezone || 'Africa/Lagos';
        const hour = parseInt(now.toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' }));
        const time = now.toLocaleString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (hour >= 5 && hour < 12) return { greeting: '🌅 Good Morning', emoji: '🌅', time, message: 'Have a wonderful day ahead!' };
        if (hour >= 12 && hour < 17) return { greeting: '☀️ Good Afternoon', emoji: '☀️', time, message: 'Hope you\'re having a great day!' };
        if (hour >= 17 && hour < 21) return { greeting: '🌇 Good Evening', emoji: '🌇', time, message: 'Hope you had a productive day!' };
        return { greeting: '🌙 Good Night', emoji: '🌙', time, message: 'Have a peaceful night!' };
    } catch (e) { return { greeting: '👋 Hello', emoji: '👋', time: new Date().toLocaleTimeString(), message: 'Nice to see you!' }; }
}

function getDayWithEmoji() {
    try {
        const now = new Date();
        const tz = settings.timezone || 'Africa/Lagos';
        const day = now.toLocaleString('en-US', { timeZone: tz, weekday: 'long' });
        const month = now.toLocaleString('en-US', { timeZone: tz, month: 'long' });
        const year = now.getFullYear();
        const date = now.toLocaleString('en-US', { timeZone: tz, month: '2-digit', day: '2-digit', year: 'numeric' });
        const map = { 'Monday': '📅', 'Tuesday': '🔥', 'Wednesday': '🌎', 'Thursday': '🚀', 'Friday': '🎉', 'Saturday': '🌈', 'Sunday': '☀️' };
        return { day, month, year, date, emoji: map[day] || '📅' };
    } catch (e) { return { day: 'Today', month: 'Month', year: 2025, date: '01/01/2026', emoji: '📅' }; }
}

async function getUserName(sock, userId, message) {
    try { const n = message.pushName || message.key?.pushName; if (n) return n; const name = await sock.getName(userId); if (name && name !== userId) return name; return userId.split('@')[0] || 'User'; }
    catch (e) { return userId.split('@')[0] || 'User'; }
}

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;
    return time.trim();
}

function getSystemStats() {
    const uptimeInSeconds = process.uptime();
    const uptimeFormatted = formatTime(uptimeInSeconds);
    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    const usedGB = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const totalGB = os.totalmem() / 1024 / 1024 / 1024;
    const usagePercent = ((usedGB / totalMem) * 100).toFixed(1);
    const barLength = 10;
    const filled = Math.round((usagePercent / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return { uptime: uptimeFormatted, usedGB: usedGB.toFixed(2), totalGB: totalGB.toFixed(2), usagePercent, bar };
}

// ---- COMMAND DATA ----
const allCommandsRaw = {
    '🧠 AI': [`Ⓟ .aivideo`, `Ⓟ .chatbot`, `Ⓟ .code`, `Ⓟ .gemini`, `Ⓗ .generate`, `Ⓟ .gpt`, `Ⓕ .summarise`],
    '🦹 ANIME': [`Ⓕ .animu`, `Ⓕ .animuquote`, `Ⓕ .cry`, `Ⓕ .facepalm`, `Ⓕ .hug`, `Ⓕ .kiss`, `Ⓕ .nom`, `Ⓕ .pat`, `Ⓕ .poke`, `Ⓕ .wink`],
    '👨‍💻 DEVELOPER': [`Ⓓ .checkplan`, `Ⓓ .listpremium`, `Ⓓ .rmpremium`, `Ⓓ .setpremium`, `Ⓓ .totalusers`, `Ⓓ .userinfo`],
    '📥 DOWNLOAD': [`Ⓕ .facebook`, `Ⓕ .instagram`, `Ⓕ .music`, `Ⓕ .play`, `Ⓕ .song`, `Ⓕ .spotify`, `Ⓕ .tiktok`, `Ⓕ .video`],
    '🔤 EPHOTO': [`Ⓕ .1917`, `Ⓕ .arena`, `Ⓕ .blackpink`, `Ⓕ .devil`, `Ⓕ .fire`, `Ⓕ .glitch`, `Ⓕ .hacker`, `Ⓕ .ice`, `Ⓕ .impressive`, `Ⓕ .leaves`, `Ⓕ .light`, `Ⓕ .matrix`, `Ⓕ .metallic`, `Ⓕ .neon`, `Ⓕ .purple`, `Ⓕ .sand`, `Ⓕ .snow`, `Ⓕ .thunder`],
    '😁 FUN': [`Ⓕ .character`, `Ⓕ .compliment`, `Ⓕ .flirt`, `Ⓕ .goodnight`, `Ⓕ .insult`, `Ⓕ .poet`, `Ⓕ .roseday`, `Ⓕ .simp`, `Ⓕ .stupid`, `Ⓕ .waste`],
    '🎮 GAMES': [
        { sub: '💰 CHIPS', cmds: [`Ⓟ .addchips`, `Ⓟ .buychips`, `Ⓟ .checkbalance`, `Ⓟ .resetchips`, `Ⓟ .transactions`, `Ⓟ .unlimitedchips`, `Ⓟ .coinflip`, `Ⓟ .coinhelp`, `Ⓟ .coinleaderboard`, `Ⓟ .coinstats`, `Ⓟ .coindaily`] },
        { sub: '🔥 HOT', cmds: [`Ⓟ .checktruth`, `Ⓕ .dare`, `Ⓕ .truth`] },
        { sub: '🎯 TTT', cmds: [`Ⓕ .surrender`, `Ⓕ .tictactoe`] },
        { sub: '🎲 DICE', cmds: [`Ⓕ .dice`] },
        { sub: '🧠 TRIVIA', cmds: [`Ⓕ .answer`, `Ⓕ .trivia`] },
        { sub: '💀 HANGMAN', cmds: [`Ⓕ .guess`, `Ⓕ .hangman`] },
        { sub: '🪦 TRAGIC', cmds: [`Ⓕ .takeout`] },
    ],
    '🌐 GENERAL': [`Ⓕ .8ball`, `Ⓕ .alive`, `Ⓕ .attp`, `Ⓕ .clear`, `Ⓕ .fact`, `Ⓕ .getjid`, `Ⓕ .joke`, `Ⓕ .language`, `Ⓕ .lyrics`, `Ⓕ .fullmenu`, `Ⓕ .news`, `Ⓕ .owner`, `Ⓕ .ping`, `Ⓕ .quote`, `Ⓕ .save`, `Ⓕ .ss`, `Ⓕ .topmembers`, `Ⓕ .translate`, `Ⓕ .tts`, `Ⓕ .url`, `Ⓕ .vv`, `Ⓕ .weather`],
    '💻 GITHUB': [`Ⓕ .script`],
    '👥 GROUP': [`Ⓕ .admins`, `Ⓕ .antibadword`, `Ⓕ .antibot`, `Ⓕ .antilink`, `Ⓕ .antitag`, `Ⓕ .ban`, `Ⓕ .delete`, `Ⓕ .demote`, `Ⓕ .goodbye`, `Ⓕ .groupinfo`, `Ⓕ .hidetag`, `Ⓕ .jid`, `Ⓕ .kick`, `Ⓕ .mute`, `Ⓕ .promote`, `Ⓕ .resetlink`, `Ⓕ .setgdesc`, `Ⓕ .setgname`, `Ⓕ .setgpp`, `Ⓕ .ship`, `Ⓕ .staff`, `Ⓕ .tag`, `Ⓕ .tagall`, `Ⓕ .tagnotadmin`, `Ⓕ .unban`, `Ⓕ .unmute`, `Ⓕ .warn`, `Ⓕ .warnings`, `Ⓕ .welcome`],
    '🧩 MISC': [`Ⓕ .china`, `Ⓕ .circle`, `Ⓕ .comrade`, `Ⓕ .gay`, `Ⓕ .glass`, `Ⓕ .heart`, `Ⓕ .hijab`, `Ⓕ .horny`, `Ⓕ .indonesia`, `Ⓕ .its-so-stupid`, `Ⓕ .jail`, `Ⓕ .japan`, `Ⓕ .korea`, `Ⓕ .lgbt`, `Ⓕ .lolice`, `Ⓕ .namecard`, `Ⓕ .oogway`, `Ⓕ .oogway2`, `Ⓕ .passed`, `Ⓕ .pies`, `Ⓕ .simpcard`, `Ⓕ .tonikawa`, `Ⓕ .triggered`, `Ⓕ .tweet`, `Ⓕ .ytcomment`],
    '🔒 OWNER': [`Ⓓ .anticall`, `Ⓓ .antidelete`, `Ⓓ .antiforeign`, `Ⓓ .autoreact`, `Ⓓ .autoread`, `Ⓓ .autorecord`, `Ⓓ .autorecordtype`, `Ⓓ .autostatus`, `Ⓓ .autotyping`, `Ⓓ .block`, `Ⓓ .botinfo`, `Ⓓ .checkupdate`, `Ⓓ .clearsession`, `Ⓓ .cleartmp`, `Ⓓ .confighelp`, `Ⓓ .getpp`, `Ⓓ .join`, `Ⓓ .leave`, `Ⓓ .mention`, `Ⓓ .menufont`, `Ⓓ .menustyle`, `Ⓓ .mode`, `Ⓓ .pmblocker`, `Ⓓ .poll`, `Ⓓ .restart`, `Ⓓ .setauthor`, `Ⓓ .setbotname`, `Ⓓ .setbotowner`, `Ⓓ .setmention`, `Ⓓ .setownernumber`, `Ⓓ .setpackname`, `Ⓓ .setpp`, `Ⓓ .setprefix`, `Ⓓ .settimezone`, `Ⓓ .settings`, `Ⓓ .setytchannel`, `Ⓓ .sudo`, `Ⓓ .tempfile`, `Ⓓ .unavailable`, `Ⓓ .unblock`, `Ⓓ .update`, `Ⓓ .updateinfo`, `Ⓓ .vote`],
    '💎 PREMIUM SUB': [`Ⓕ .subscribe`],
    '🎨 STICKER': [`Ⓕ .blur`, `Ⓕ .crop`, `Ⓕ .emojimix`, `Ⓕ .igsc`, `Ⓕ .igs`, `Ⓕ .meme`, `Ⓕ .remini`, `Ⓕ .simage`, `Ⓕ .sticker`, `Ⓕ .take`, `Ⓕ .tgsticker`],
    '⚙️ TOOLS': [`Ⓕ .removebg`],
};

// ---- MEDIA PICKER (random image or video, NO audio) ----
function pickMedia() {
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    const gifPath = path.join(__dirname, '../assets/menu_video.mp4');
    const hasImage = fs.existsSync(imagePath);
    const hasGif = fs.existsSync(gifPath);

    let mediaType = 'Text';
    if (hasImage && hasGif) mediaType = Math.random() < 0.5 ? 'Image' : 'GIF';
    else if (hasImage) mediaType = 'Image';
    else if (hasGif) mediaType = 'GIF';

    return { mediaType, imagePath, gifPath };
}

async function sendWithMediaType(sock, chatId, text, message, mentions, mediaType, imagePath, gifPath) {
    const ctx = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: '\u200E',
            serverMessageId: -1
        }
    };
    if (mentions && mentions.length) ctx.mentionedJid = mentions;

    try {
        if (mediaType === 'Image') {
            return await sock.sendMessage(chatId, {
                image: fs.readFileSync(imagePath),
                caption: text,
                contextInfo: ctx
            }, { quoted: message });
        } else if (mediaType === 'GIF') {
            return await sock.sendMessage(chatId, {
                video: fs.readFileSync(gifPath),
                mimetype: 'video/mp4',
                gifPlayback: true,
                caption: text,
                contextInfo: ctx
            }, { quoted: message });
        } else {
            return await sock.sendMessage(chatId, { text, contextInfo: ctx }, { quoted: message });
        }
    } catch (e) {
        return await sock.sendMessage(chatId, { text }, { quoted: message });
    }
}

// ---- STYLE HELPERS ----
function styleTop(styleId, title) {
    if (styleId === 1) return `╭──◆「 *${title}* 」◆\n├\n`;
    if (styleId === 2) return `◈──────────────────────◈\n           *${title}*\n◈──────────────────────◈\n\n`;
    if (styleId === 3) return `╔══════════════════╗\n║ *${title}*\n║ ══════════════════\n`;
    if (styleId === 4) return `╭──〔 *${title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
    if (styleId === 5) return `  🌀◈── *${title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
    if (styleId === 6) return `╭──〈 *${title}* 〉──💕⃝🕊️\n`;
    if (styleId === 7) return `╔══════════════════❥❥❥\n✧  *${title}*\n╚══════════════════❥❥❥\n`;
    return `◈──────────────────────◈\n           *${title}*\n◈──────────────────────◈\n\n`;
}

function styleLine(styleId, content) {
    if (styleId === 1) return `├◇ ${content}\n`;
    if (styleId === 2) return `▤ ${content}\n`;
    if (styleId === 3) return `║ ${content}\n`;
    if (styleId === 4) return `║☠︎︎║ ${content}\n`;
    if (styleId === 5) return `┊ ${content}\n`;
    if (styleId === 6) return `⚚  ${content}\n`;
    if (styleId === 7) return `✧  ${content}\n`;
    return `▤ ${content}\n`;
}

function styleBottom(styleId) {
    if (styleId === 1) return `├\n╰─┬─★─☆─♪♪─◆\n\n`;
    if (styleId === 2) return `◈──────────────────────◈\n\n`;
    if (styleId === 3) return `╚══════════════════╝\n\n`;
    if (styleId === 4) return `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n`;
    if (styleId === 5) return `╰──────·••─────•────●○\n\n`;
    if (styleId === 6) return `╰────────────────✌︎㋡\n\n`;
    if (styleId === 7) return `\n`;
    return `◈──────────────────────◈\n\n`;
}

function styleFooter(styleId) {
    if (styleId === 1) return `╭──「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    if (styleId === 2) return `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
    if (styleId === 3) return `╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
    if (styleId === 4) return `╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
    if (styleId === 5) return `╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
    if (styleId === 6) return `╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
    if (styleId === 7) return `╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
    return `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
}

function buildInfoSection(styleId, infoLines) {
    let out = styleTop(styleId, 'WALLYJAYTECH-MD');
    for (const l of infoLines) out += styleLine(styleId, l);
    out += styleBottom(styleId);
    return out;
}

function buildNoteSection(styleId) {
    let out = styleTop(styleId, '✍️ NOTE');
    const notes = [
        `Ⓟ  premium commands`,
        `Ⓕ  free commands`,
        `Ⓗ  free & premium commands`,
        `Ⓓ  developer commands`,
        ` use .subscribe to upgrade`
    ];
    for (const n of notes) out += styleLine(styleId, n);
    out += styleBottom(styleId);
    return out;
}

function buildMenuList(styleId) {
    let out = styleTop(styleId, 'ℹ️ INFO');
    out += styleLine(styleId, 'Reply with a number');
    out += styleLine(styleId, 'to open a menu');
    out += styleBottom(styleId);

    out += styleTop(styleId, 'MENU LIST');
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
        const name = titleCase(CATEGORY_ORDER[i]);
        out += styleLine(styleId, `${CIRCLED[i]} ${name} Menu`);
    }
    out += styleBottom(styleId);
    return out;
}

function buildCategoryMenu(styleId, categoryKey) {
    let out = styleTop(styleId, 'WALLYJAYTECH-MD');
    out += styleBottom(styleId);

    out += buildNoteSection(styleId);

    const displayName = titleCase(categoryKey);
    const emoji = categoryKey.split(' ')[0] || '';
    const headerTitle = `${emoji} ${displayName} Menu`.trim();

    out += styleTop(styleId, headerTitle);
    const cmds = allCommandsRaw[categoryKey] || [];

    if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
        for (let i = 0; i < cmds.length; i++) {
            const sub = cmds[i];
            if (i > 0) out += styleLine(styleId, '');
            out += styleLine(styleId, `*${sub.sub}*`);
            for (const c of sub.cmds) out += styleLine(styleId, c);
        }
    } else {
        for (const c of cmds) out += styleLine(styleId, c);
    }
    out += styleBottom(styleId);

    out += `              *© 2025-2026*\n\n`;
    out += styleFooter(styleId);
    return out;
}

function buildMainMenu(styleId, data, infoLines) {
    const { greeting, userName } = data;
    let out = `👋 Hello *${userName}*! ${greeting.message}\n\n`;
    out += `*${greeting.greeting}!* Here's your menu:\n\n`;
    out += buildInfoSection(styleId, infoLines);
    out += buildMenuList(styleId);
    out += `              *© 2025-2026*\n\n`;
    out += styleFooter(styleId);
    return out;
}

function buildFullMenu(styleId, data, infoLines) {
    const { greeting, userName } = data;
    let out = `👋 Hello *${userName}*! ${greeting.message}\n\n`;
    out += `*${greeting.greeting}!* Here's your full menu:\n\n`;
    out += buildInfoSection(styleId, infoLines);
    out += buildNoteSection(styleId);

    for (const catKey of CATEGORY_ORDER) {
        const cmds = allCommandsRaw[catKey];
        if (!cmds) continue;
        out += styleTop(styleId, catKey);
        if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
            for (let i = 0; i < cmds.length; i++) {
                const sub = cmds[i];
                if (i > 0) out += styleLine(styleId, '');
                out += styleLine(styleId, `*${sub.sub}*`);
                for (const c of sub.cmds) out += styleLine(styleId, c);
            }
        } else {
            for (const c of cmds) out += styleLine(styleId, c);
        }
        out += styleBottom(styleId);
    }

    out += `              *© 2025-2026*\n\n`;
    out += styleFooter(styleId);
    return out;
}

async function gatherData(sock, senderId, message, pingMs, mediaType) {
    const userName = await getUserName(sock, senderId, message);
    const greeting = getTimeBasedGreeting();
    const dayInfo = getDayWithEmoji();
    const modeText = getBotMode();
    const prefix = getPrefix();
    // USE help.js AS SOURCE OF TRUTH
    const totalCommands = countTotalCommandsFromHelp();
    const stats = await getUserStats();
    const fontId = getCurrentFont();
    const styleId = getCurrentStyle() || 2;
    const botPlan = await getBotPlan();
    const sysStats = getSystemStats();
    const platform = getDeploymentPlatform();

    const mediaDisplay = mediaType === 'GIF' ? 'GIF' : mediaType === 'Image' ? 'Image' : 'Text';

    const infoLines = [
        `*👤 User:* ${userName}`,
        `*🤖 BotName:* ${settings.botName || 'WALLYJAYTECH-MD'}`,
        `*🧠 Version:* ${settings.version || '1.0.0'}`,
        `*👑 BotOwner:* ${settings.botOwner || 'Wally Jay'}`,
        `*💳 BotPlan:* ${botPlan || 'Free'}`,
        `*📺 YT Channel:* ${global.ytch || 'WALLY JAY TECH'}`,
        `*📞 BotNumber:* ${settings.ownerNumber}`,
        `*📥 Prefix:* ${prefix}`,
        `*🎨 Menu Style:* ${styleId}`,
        `*🖋️ Menu Font:* ${fontId}`,
        `*🎬 Menu Media:* ${mediaDisplay}`,
        `*🌍 TimeZone:* ${settings.timezone}`,
        `*⏰ Current Time:* ${greeting.time}`,
        `*📅 Date:* ${dayInfo.date}`,
        `*📆 Day:* ${dayInfo.day}`,
        `*📆 Month:* ${dayInfo.month}`,
        `*📆 Year:* ${dayInfo.year}`,
        `*💻 Bot Mode:* ${modeText}`,
        `*📊 Total Commands:* ${totalCommands}`,
        `*📡 Platform:* ${platform === 'Local Machine' ? 'Panel' : platform}`,
        `*👥 Active Users:* ${stats.activeUsers}`,
        `*📊 Total Users:* ${stats.totalUsers}`,
        `*🚀 Speed:* ${pingMs} ms`,
        `*⏱️ Uptime:* ${sysStats.uptime}`,
        `*💾 Usage:* ${sysStats.bar} ${sysStats.usagePercent}%`,
        `*💾 Ram:* ${sysStats.usedGB} GB of ${sysStats.totalGB} GB`
    ];

    return { userName, greeting, dayInfo, styleId, fontId, infoLines };
}

// ---- Register session (replaces any prior session for this chat) ----
function registerMenuSession(chatId, menuMessageId, senderJid, styleId, fontId) {
    menuSessions.set(chatId, {
        menuMessageId,
        senderJid,
        styleId,
        fontId,
        timestamp: Date.now()
    });
}

// =============================================================
// ---- MAIN COMMAND ENTRY ----
// =============================================================
async function menuCommand(sock, chatId, message, args) {
    const senderId = message.key.participant || message.key.remoteJid;
    let sendChatId = chatId;
    let realSenderJid = senderId;
    if (chatId.endsWith('@lid')) {
        const realJid = message.key.remoteJidAlt;
        if (realJid?.includes('@s.whatsapp.net')) { sendChatId = realJid; realSenderJid = realJid; }
    }

    const start = Date.now();
    await sock.sendPresenceUpdate('composing', chatId);

    const media = pickMedia();
    const pingMs = Date.now() - start;
    const data = await gatherData(sock, realSenderJid, message, pingMs, media.mediaType);

    const isFull = Array.isArray(args) && args[0] === 'fullmenu';

    let helpMessage;
    if (isFull) {
        helpMessage = buildFullMenu(data.styleId, data, data.infoLines);
    } else {
        helpMessage = buildMainMenu(data.styleId, data, data.infoLines);
    }

    const finalMessage = applyFont(helpMessage, data.fontId);

    const sent = await sendWithMediaType(
        sock, sendChatId, finalMessage, message, [realSenderJid],
        media.mediaType, media.imagePath, media.gifPath
    );

    // ONLY .menu registers a session (not .fullmenu)
    // Each .menu REPLACES the previous session for this chat
    if (!isFull && sent && sent.key && sent.key.id) {
        registerMenuSession(sendChatId, sent.key.id, realSenderJid, data.styleId, data.fontId);
        console.log('📌 Menu session registered:', sendChatId, '→', sent.key.id);
    }
}

// =============================================================
// ---- NUMBER REPLY HANDLER ----
// Rules:
//   • Must quote-reply the LATEST `.menu` message in this chat
//   • Sender must be the one who triggered `.menu`
//   • Text must be a number 1–15
//   • Sub-menus do NOT become sessions — you must reply to `.menu` each time
// =============================================================
async function handleMenuNumberReply(sock, message, chatId) {
    try {
        const senderJid = message.key.participant || message.key.remoteJid;
        const msg = message.message;
        if (!msg) return false;

        // Extract text
        let text = '';
        if (msg.conversation) text = msg.conversation;
        else if (msg.extendedTextMessage?.text) text = msg.extendedTextMessage.text;
        else if (msg.imageMessage?.caption) text = msg.imageMessage.caption;
        else if (msg.videoMessage?.caption) text = msg.videoMessage.caption;
        if (!text) return false;

        // Must be a plain number 1–15
        const trimmed = text.trim();
        if (!/^\d{1,2}$/.test(trimmed)) return false;
        const num = parseInt(trimmed, 10);
        if (num < 1 || num > 15) return false;

        // Must be a QUOTE-REPLY
        const ctx = msg.extendedTextMessage?.contextInfo
            || msg.imageMessage?.contextInfo
            || msg.videoMessage?.contextInfo;
        if (!ctx || !ctx.stanzaId) return false;

        // Look up session for THIS chat
        const session = menuSessions.get(chatId);
        if (!session) {
            console.log('🔍 No menu session for chat:', chatId);
            return false;
        }

        // CRITICAL: must quote-reply THE .menu MESSAGE ONLY
        if (ctx.stanzaId !== session.menuMessageId) {
            console.log('🔍 Quoted message is not the latest .menu — ignoring');
            return false;
        }

        // Only the sender (or bot owner) can trigger
        const senderMatches = senderJid === session.senderJid
            || senderJid === session.senderJid.replace('@s.whatsapp.net', '@lid')
            || message.key.fromMe;
        if (!senderMatches) {
            console.log('🔍 Not the original menu sender — ignoring');
            return false;
        }

        // Build category sub-menu
        const categoryKey = CATEGORY_ORDER[num - 1];
        if (!categoryKey) return false;

        const styleId = getCurrentStyle() || session.styleId || 2;
        const fontId = getCurrentFont() || session.fontId || 1;

        const subMenu = buildCategoryMenu(styleId, categoryKey);
        const finalMessage = applyFont(subMenu, fontId);

        // Fresh random media for this sub-menu
        const media = pickMedia();

        // Send sub-menu WITHOUT registering a new session
        await sendWithMediaType(
            sock, chatId, finalMessage, message, [senderJid],
            media.mediaType, media.imagePath, media.gifPath
        );

        console.log('✅ Menu number reply handled — sub-menu sent, session unchanged');
        return true;
    } catch (e) {
        console.error('handleMenuNumberReply error:', e.message);
        return false;
    }
}

// =============================================================
// ---- EXPORTS ----
// =============================================================
module.exports = menuCommand;
module.exports.handleMenuNumberReply = handleMenuNumberReply;
module.exports.menuSessions = menuSessions;
