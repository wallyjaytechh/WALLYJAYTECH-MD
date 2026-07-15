/**
 * WALLYJAYTECH-MD - ULTIMATE HELP COMMAND
 * Supports: Text Mode + Button Mode (Interactive)
 * Supports: 100 Fonts + 7 Styles
 */

const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');
const { getMenuType } = require('./menutype'); // Import the switcher

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
        const res = await fetch('https://gemini-proxy-10a1.onrender.com/v1/stats');
        const data = await res.json();
        return { totalUsers: data.totalUsers || 0, activeUsers: data.activeUsers || 0, platforms: {} };
    } catch (e) { return { totalUsers: 0, activeUsers: 0, platforms: {} }; }
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
        const res = await fetch(`https://gemini-proxy-10a1.onrender.com/v1/premium/check/${ownerNumber}`);
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
    } catch (e) { return { day: 'Today', month: 'Month', year: 2025, date: '12/22/2026', emoji: '📅' }; }
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
    return { uptime: uptimeFormatted, usedGB: usedGB.toFixed(2), totalGB: totalGB.toFixed(2), usagePercent: usagePercent, bar: bar };
}

async function sendMenuAudio(sock, chatId, message) {
    try { const audioPath = path.join(__dirname, '../assets/menu_audio.mp3'); if (fs.existsSync(audioPath)) { await sock.sendMessage(chatId, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: false }, { quoted: message }); return true; } return false; }
    catch (e) { return false; }
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
    '🌐 GENERAL': [`Ⓕ .8ball`, `Ⓕ .alive`, `Ⓕ .attp`, `Ⓕ .clear`, `Ⓕ .fact`, `Ⓕ .getjid`, `Ⓕ .help`, `Ⓕ .joke`, `Ⓕ .lyrics`, `Ⓕ .menu`, `Ⓕ .news`, `Ⓕ .owner`, `Ⓕ .ping`, `Ⓕ .quote`, `Ⓕ .save`, `Ⓕ .ss`, `Ⓕ .topmembers`, `Ⓕ .translate`, `Ⓕ .tts`, `Ⓕ .url`, `Ⓕ .vv`, `Ⓕ .weather`],
    '💻 GITHUB': [`Ⓕ .script`],
    '👥 GROUP': [`Ⓕ .admins`, `Ⓕ .antibadword`, `Ⓕ .antibot`, `Ⓕ .antilink`, `Ⓕ .antitag`, `Ⓕ .ban`, `Ⓕ .delete`, `Ⓕ .demote`, `Ⓕ .goodbye`, `Ⓕ .groupinfo`, `Ⓕ .hidetag`, `Ⓕ .jid`, `Ⓕ .kick`, `Ⓕ .mute`, `Ⓕ .promote`, `Ⓕ .resetlink`, `Ⓕ .setgdesc`, `Ⓕ .setgname`, `Ⓕ .setgpp`, `Ⓕ .ship`, `Ⓕ .staff`, `Ⓕ .tag`, `Ⓕ .tagall`, `Ⓕ .tagnotadmin`, `Ⓕ .unban`, `Ⓕ .unmute`, `Ⓕ .warn`, `Ⓕ .warnings`, `Ⓕ .welcome`],
    '🧩 MISC': [`Ⓕ .china`, `Ⓕ .circle`, `Ⓕ .comrade`, `Ⓕ .gay`, `Ⓕ .glass`, `Ⓕ .heart`, `Ⓕ .hijab`, `Ⓕ .horny`, `Ⓕ .indonesia`, `Ⓕ .its-so-stupid`, `Ⓕ .jail`, `Ⓕ .japan`, `Ⓕ .korea`, `Ⓕ .lgbt`, `Ⓕ .lolice`, `Ⓕ .namecard`, `Ⓕ .oogway`, `Ⓕ .oogway2`, `Ⓕ .passed`, `Ⓕ .pies`, `Ⓕ .simpcard`, `Ⓕ .tonikawa`, `Ⓕ .triggered`, `Ⓕ .tweet`, `Ⓕ .ytcomment`],
    '🔒 OWNER': [`Ⓓ .anticall`, `Ⓓ .antidelete`, `Ⓓ .antiforeign`, `Ⓓ .autoreact`, `Ⓓ .autoread`, `Ⓓ .autorecord`, `Ⓓ .autorecordtype`, `Ⓓ .autostatus`, `Ⓓ .autotyping`, `Ⓓ .block`, `Ⓓ .botinfo`, `Ⓓ .checkupdate`, `Ⓓ .clearsession`, `Ⓓ .cleartmp`, `Ⓓ .confighelp`, `Ⓓ .getpp`, `Ⓓ .join`, `Ⓓ .leave`, `Ⓓ .mention`, `Ⓓ .menufont`, `Ⓓ .menustyle`, `Ⓓ .mode`, `Ⓓ .pmblocker`, `Ⓓ .poll`, `Ⓓ .restart`, `Ⓓ .setauthor`, `Ⓓ .setbotname`, `Ⓓ .setbotowner`, `Ⓓ .setmention`, `Ⓓ .setownernumber`, `Ⓓ .setpackname`, `Ⓓ .setpp`, `Ⓓ .setprefix`, `Ⓓ .settimezone`, `Ⓓ .settings`, `Ⓓ .setytchannel`, `Ⓓ .sudo`, `Ⓓ .tempfile`, `Ⓓ .unavailable`, `Ⓓ .unblock`, `Ⓓ .update`, `Ⓓ .updateinfo`, `Ⓓ .vote`],
    '💎 PREMIUM SUB': [`Ⓕ .subscribe`],
    '🎨 STICKER': [`Ⓕ .blur`, `Ⓕ .crop`, `Ⓕ .emojimix`, `Ⓕ .igsc`, `Ⓕ .igs`, `Ⓕ .meme`, `Ⓕ .remini`, `Ⓕ .simage`, `Ⓕ .sticker`, `Ⓕ .take`, `Ⓕ .tgsticker`],
    '⚙️ TOOLS': [`Ⓕ .removebg`],
};

function countTotalCommands() {
    let count = 0;
    for (const cmds of Object.values(allCommandsRaw)) {
        if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
            for (const sub of cmds) count += sub.cmds.length;
        } else {
            count += cmds.length;
        }
    }
    return count;
}

// ---- MENU BUILDERS ----
function buildTextMenu(styleId, data, allCommands, infoLines) {
    const { userName, greeting } = data;
    
    // --- STYLE 1 ---
    if (styleId === 1) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n├\n`;
        for (const l of infoLines) menu += `├◇ ${l}\n`;
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n`;
        menu += `╭─┴◆「 *✍️ NOTE* 」◆\n├\n`;
        menu += `├◇ Ⓟ  premium commands\n├◇ Ⓕ  free commands\n├◇ Ⓗ  free & premium commands\n├◇ Ⓓ  developer commands\n├◇  use .subscribe to upgrade\n├\n`;
        menu += `╰─┬─★─☆─♪♪─★\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `╭─┴◆「 *${title}* 」◆\n├\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `├\n`;
                    menu += `├◇     *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `├└${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `├${cmd}\n`;
            }
            menu += `├\n╰─┬─★─☆─♪♪─★\n\n`;
        }
        menu += `              *© 2025-2026*\n\n╭──「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }

    // --- STYLE 2 ---
    if (styleId === 2) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `           *WALLYJAYTECH-MD*\n◈──────────────────────◈\n`;
        for (const l of infoLines) menu += `▤ ${l}\n`;
        menu += `◈──────────────────────◈\n\n              *✍️ NOTE*\n\n╭─────────────··◈\n`;
        menu += `┊ Ⓟ  premium commands\n┊ Ⓕ  free commands\n┊ Ⓗ  free & premium commands\n┊ Ⓓ  developer commands\n┊  use .subscribe to upgrade\n╰─────────────··◈\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `              *${title}*\n\n╭─────────────··◈\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `┊\n`;
                    menu += `┊     *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `┊ └${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `┊ ${cmd}\n`;
            }
            menu += `╰─────────────··◈\n\n`;
        }
        menu += `              *© 2025-2026*\n\n╭──「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }

    // --- STYLE 3 ---
    if (styleId === 3) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╔══════════════════╗\n║ ✦ *WALLYJAYTECH-MD* ✦\n║ ══════════════════\n`;
        for (const l of infoLines) menu += `║ ${l}\n`;
        menu += `╚══════════════════╝\n\n`;
        menu += `╔══════════════════╗\n║ *✍️ NOTE*\n║ ══════════════════\n║ Ⓟ premium commands\n║ Ⓕ free commands\n║ Ⓗ free & premium commands\n║ Ⓓ developer commands\n║ use .subscribe to upgrade\n╚══════════════════╝\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `╔══════════════════╗\n║ *${title}*\n║ ══════════════════\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `║\n`;
                    menu += `║     *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `║ ${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `║ ${cmd}\n`;
            }
            menu += `╚══════════════════╝\n\n`;
        }
        menu += `               *© 2025-2026*\n╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
        return menu;
    }

    // --- STYLE 4 (Jarvis) ---
    if (styleId === 4) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╭──〔 *WALLYJAYTECH-MD* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
        for (const l of infoLines) menu += `║☠︎︎║ ${l}\n`;
        menu += `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n`;
        menu += `╭───────────────────┈𓊉꧂\n║    ╭──────────────┈❀\n║☠︎︎║ *✍️ NOTE*\n║    ╰┬─────────────┈❀\n║    ┌┤\n`;
        menu += `║☠︎︎║ Ⓟ premium commands\n║☠︎︎║ Ⓕ free commands\n║☠︎︎║ Ⓗ free & premium commands\n║☠︎︎║ Ⓓ developer commands\n║☠︎︎║ use .subscribe to upgrade\n║    ╰──────────────┈❀\n`;
        for (const [title, cmds] of allCommands) {
            menu += `║\n║    ╭──────────────┈❀\n║☠︎︎║ *${title}*\n║    ╰┬─────────────┈❀\n║    ┌┤\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `║☠︎︎║\n`;
                    menu += `║☠︎︎║     *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `║☠︎︎║ ${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `║☠︎︎║ ${cmd}\n`;
            }
            menu += `║    ╰──────────────┈❀\n`;
        }
        menu += `╰───────────────────┈𓊉꧂\n               *© 2025-2026*\n\n╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
        return menu;
    }

    // --- STYLE 5 (Swirl) ---
    if (styleId === 5) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `🌀◈── *WALLYJAYTECH-MD* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
        for (const l of infoLines) menu += `┊ ${l}\n`;
        menu += `╰──────·••─────•────●○\n\n`;
        menu += `  🌀◈── *✍️ NOTE* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
        menu += `┊ Ⓟ premium commands\n┊ Ⓕ free commands\n┊ Ⓗ free & premium commands\n┊ Ⓓ developer commands\n┊ use .subscribe to upgrade\n╰──────·••─────•────●○\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `  🌀◈── *${title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `┊\n`;
                    menu += `┊     *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `┊ ${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `┊ ${cmd}\n`;
            }
            menu += `╰──────·••─────•────●○\n\n`;
        }
        menu += `               *© 2025-2026*\n\n╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
        return menu;
    }

    // --- STYLE 6 (Love Wing) ---
    if (styleId === 6) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╭───〈 *WALLYJAYTECH-MD* 〉───💕⃝🕊️\n`;
        for (const l of infoLines) menu += `⚚  ${l}\n`;
        menu += `╰────────────────✌︎㋡\n\n`;
        menu += `╭────〈 *✍️ NOTE* 〉────💕⃝🕊️\n⚚  Ⓟ premium commands\n⚚  Ⓕ free commands\n⚚  Ⓗ free & premium commands\n⚚  Ⓓ developer commands\n⚚  use .subscribe to upgrade\n╰────────────────✌︎㋡\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `╭────〈 *${title}* 〉────💕⃝🕊️\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `⚚\n`;
                    menu += `⚚      *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `⚚  ${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `⚚  ${cmd}\n`;
            }
            menu += `╰────────────✌︎㋡\n\n`;
        }
        menu += `               *© 2025-2026*\n\n╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
        return menu;
    }

    // --- STYLE 7 (Aesthetic Bloom) ---
    if (styleId === 7) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╔══════════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════════❥❥❥\n\n`;
        menu += `👹──────────✧✧✧✧✧\n┋  ┋  ┋  ┋  ┋  ┋\n┋  ┋  ☆  ˚ ◡̈  * ｡ ✿\n┋  ☾ ⋆ *\n✧  ୧⍤⃝💐\n`;
        for (const l of infoLines) menu += `✧  ${l}\n`;
        menu += `╰───────────────────⊷\n\n`;
        menu += `╔══════════════════❥❥❥\n✧  *✍️ NOTE*\n╚══════════════════❥❥❥\n`;
        menu += `✧  Ⓟ premium commands\n✧  Ⓕ free commands\n✧  Ⓗ free & premium commands\n✧  Ⓓ developer commands\n✧  use .subscribe to upgrade\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `╔══════════════════❥❥❥\n✧  *${title}*\n╚══════════════════❥❥❥\n`;
            if (cmds.length > 0 && typeof cmds[0] === 'object' && cmds[0].sub) {
                for (let i = 0; i < cmds.length; i++) {
                    const sub = cmds[i];
                    if (i > 0) menu += `✧\n`;
                    menu += `✧      *${sub.sub}*\n`;
                    for (const cmd of sub.cmds) menu += `✧  ${cmd}\n`;
                }
            } else {
                for (const cmd of cmds) menu += `✧  ${cmd}\n`;
            }
            menu += `\n`;
        }
        menu += `               *© 2025-2026*\n╔══════════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════════❥❥❥`;
        return menu;
    }

    return '';
}

// ---- BUTTON MENU BUILDER ----
async function buildButtonMenu(sock, chatId, message, data, allCommands, infoLines) {
    const { userName, greeting, fontId, styleId } = data;
    
    // Header text (formatted with font)
    const headerText = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n*${greeting.greeting}!* Here's your menu:`;
    
    // Prepare categories (max 10 buttons per message)
    const categories = allCommands.map(([title]) => title);
    const buttonRows = [];
    
    // Group into chunks of 10
    for (let i = 0; i < categories.length; i += 10) {
        buttonRows.push(categories.slice(i, i + 10));
    }

    // Send first page
    const buttons = buttonRows[0].map((cat, index) => ({
        buttonId: `menu_cat_${index}`,
        buttonText: { displayText: cat }
    }));

    // Add "Next" button if more pages exist
    if (buttonRows.length > 1) {
        buttons.push({
            buttonId: `menu_next_1`,
            buttonText: { displayText: '➡️ Next Page' }
        });
    }

    await sock.sendMessage(chatId, {
        text: headerText,
        footer: '📌 Choose a category below:',
        buttons: buttons,
        headerType: 1,
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

// ---- MAIN COMMAND ----
async function helpCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
    let sendChatId = chatId;
    let realSenderJid = senderId;
    if (chatId.endsWith('@lid')) {
        const realJid = message.key.remoteJidAlt;
        if (realJid?.includes('@s.whatsapp.net')) { sendChatId = realJid; realSenderJid = realJid; }
    }
    
    // ---- GATHER DATA ----
    const userName = await getUserName(sock, senderId, message);
    const greeting = getTimeBasedGreeting();
    const dayInfo = getDayWithEmoji();
    const currentBotMode = getBotMode();
    const prefix = getPrefix();
    const userPlatform = getDeploymentPlatform();
    const totalCommands = countTotalCommands();
    const stats = await getUserStats();
    const fontId = getCurrentFont();
    const styleId = getCurrentStyle();
    const botPlan = await getBotPlan();
    const systemStats = getSystemStats();
    const start = Date.now();
    await sock.sendPresenceUpdate('composing', chatId);
    const ping = Date.now() - start;
    let menuType = 'Text';
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    const gifPath = path.join(__dirname, '../assets/menu_video.mp4');
    if (fs.existsSync(imagePath) && fs.existsSync(gifPath)) menuType = Math.random() < 0.5 ? 'Image' : 'GIF';
    else if (fs.existsSync(imagePath)) menuType = 'Image';
    else if (fs.existsSync(gifPath)) menuType = 'GIF';
    const mediaDisplay = menuType === 'GIF' ? 'GIF & Audio' : menuType === 'Image' ? 'Image & Audio' : 'Text & Audio';
    const getLocalizedTime = () => {
        try { return new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
        catch (e) { return new Date().toLocaleString(); }
    };

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
        `*💻 Bot Mode:* ${currentBotMode}`,
        `*📊 Total Commands:* ${totalCommands}`,
        `*📡 Platform:* ${userPlatform === 'Local Machine' ? 'Panel' : userPlatform}`,
        `*👥 Active Users:* ${stats.activeUsers}`,
        `*📊 Total Users:* ${stats.totalUsers}`,
        `*🚀 Speed:* ${ping} ms`,
        `*⏱️ Uptime:* ${systemStats.uptime}`,
        `*💾 Usage:* ${systemStats.bar} ${systemStats.usagePercent}%`,
        `*💾 Ram:* ${systemStats.usedGB} GB of ${systemStats.totalGB} GB`
    ];

    const sortedCategoryNames = Object.keys(allCommandsRaw).sort((a, b) => {
        const nameA = a.replace(/^[^\s]+\s/, '');
        const nameB = b.replace(/^[^\s]+\s/, '');
        return nameA.localeCompare(nameB);
    });

    const allCommands = sortedCategoryNames.map(name => [name, allCommandsRaw[name]]);
    
    const dataObj = { userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, mediaDisplay, userPlatform, getLocalizedTime, fontId, styleId, systemStats, ping, botPlan };

    // ---- DETERMINE MENU TYPE ----
    const currentMenuType = getMenuType(); // 'text' or 'button'

    // ---- SEND MENU ----
    try {
        let finalMessage;
        if (currentMenuType === 'button') {
            // Send Button Menu
            await buildButtonMenu(sock, sendChatId, message, dataObj, allCommands, infoLines);
            await new Promise(r => setTimeout(r, 1000));
            await sendMenuAudio(sock, sendChatId, message);
            return; // Stop here, buttons are sent
        } else {
            // Send Text Menu
            const helpMessage = buildTextMenu(styleId, dataObj, allCommands, infoLines);
            finalMessage = applyFont(helpMessage, fontId);
        }

        // Send Text/Image/GIF version
        const channelCtx = { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: '\u200E', serverMessageId: -1 } };
        
        if (menuType === 'Image') {
            await sock.sendMessage(sendChatId, { image: fs.readFileSync(imagePath), caption: finalMessage, mentions: [realSenderJid], contextInfo: channelCtx }, { quoted: message });
        } else if (menuType === 'GIF') {
            await sock.sendMessage(sendChatId, { video: fs.readFileSync(gifPath), mimetype: 'video/mp4', gifPlayback: true, caption: finalMessage, mentions: [realSenderJid], contextInfo: channelCtx }, { quoted: message });
        } else {
            await sock.sendMessage(sendChatId, { text: finalMessage, mentions: [realSenderJid], contextInfo: channelCtx }, { quoted: message });
        }
        await new Promise(r => setTimeout(r, 1000));
        await sendMenuAudio(sock, sendChatId, message);
    } catch (error) {
        console.error('Error in help command:', error);
        // Fallback to plain text
        const fallback = buildTextMenu(styleId, dataObj, allCommands, infoLines);
        await sock.sendMessage(sendChatId, { text: applyFont(fallback, fontId), mentions: [realSenderJid] }, { quoted: message });
    }
}

module.exports = helpCommand;
