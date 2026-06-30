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
const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');

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

function updateUserStats(userJid, platform) {
    try {
        const userPhone = userJid.split('@')[0];
        const statsPath = path.join(__dirname, '../data/userStats.json');
        const dataDir = path.dirname(statsPath);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        let stats = { totalUsers: 0, activeUsers: {}, platforms: {}, users: {}, lastUpdated: Date.now(), botName: settings.botName || 'WALLYJAYTECH-MD', version: settings.version || '1.0.0' };
        if (fs.existsSync(statsPath)) { try { stats = JSON.parse(fs.readFileSync(statsPath, 'utf8')); } catch (e) {} }
        const userKey = `user_${userPhone}`;
        const isNewUser = !stats.users[userKey];
        const currentTime = Date.now();
        stats.users[userKey] = { phone: userPhone, platform: platform, lastActive: currentTime, firstSeen: isNewUser ? currentTime : (stats.users[userKey]?.firstSeen || currentTime), totalUses: (stats.users[userKey]?.totalUses || 0) + 1 };
        if (isNewUser) { stats.platforms[platform] = (stats.platforms[platform] || 0) + 1; stats.totalUsers = Object.keys(stats.users).length; }
        stats.activeUsers[userKey] = currentTime;
        const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
        Object.keys(stats.activeUsers).forEach(key => { if (stats.activeUsers[key] < thirtyMinutesAgo) delete stats.activeUsers[key]; });
        stats.lastUpdated = currentTime;
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
        return { totalUsers: stats.totalUsers, activeUsers: Object.keys(stats.activeUsers).length, platforms: stats.platforms };
    } catch (error) { return { totalUsers: 1, activeUsers: 1, platforms: { [platform]: 1 } }; }
}

function getUserStats() {
    try {
        const statsPath = path.join(__dirname, '../data/userStats.json');
        if (!fs.existsSync(statsPath)) return { totalUsers: 0, activeUsers: 0, platforms: {} };
        const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        const currentTime = Date.now();
        const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
        let activeCount = 0;
        for (const [key, user] of Object.entries(stats.users || {})) {
            if (user.lastActive && user.lastActive >= fiveMinutesAgo) {
                activeCount++;
            }
        }
        return {
            totalUsers: stats.totalUsers || Object.keys(stats.users || {}).length,
            activeUsers: activeCount,
            platforms: stats.platforms || {}
        };
    } catch (error) { return { totalUsers: 0, activeUsers: 0, platforms: {} }; }
}

function getPrefix() { return settings.prefix || '.'; }

function getBotMode() {
    try {
        const p = path.join(__dirname, '../data/messageCount.json');
        if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'Public' : 'Private'; }
        return 'Public';
    } catch (e) { return 'Public'; }
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

function getPlatformEmoji(platform) {
    const map = { 'Render': '☁️', 'Codespaces': '💻', 'Panel': '🛠️', 'Local Machine': '🏠', 'Replit': '⚡', 'Koyeb': '🚀', 'Fly.io': '✈️', 'Glitch': '🌀', 'Vercel': '▲', 'Heroku': '⚙️', 'Railway': '🚂' };
    return map[platform] || '❓';
}

function countTotalCommands() {
    try { const p = path.join(__dirname, '../main.js'); if (!fs.existsSync(p)) return 157; const c = fs.readFileSync(p, 'utf8'); const re = /case\s+userMessage\s*(===|\.startsWith\(|\.includes\(|\.match\()\s*['"`]\.([^'"`]+)['"`]/g; let m, count = 0; while ((m = re.exec(c)) !== null) { if (m[2]) count++; } return count || 157; }
    catch (e) { return 157; }
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
    const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const usedGB = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const totalGB = os.totalmem() / 1024 / 1024 / 1024;
    const usagePercent = ((usedMem / totalMem) * 100).toFixed(1);
    const barLength = 10;
    const filled = Math.round((usagePercent / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return {
        uptime: uptimeFormatted,
        usedGB: usedGB.toFixed(2),
        totalGB: totalGB.toFixed(2),
        usagePercent: usagePercent,
        bar: bar
    };
}

async function sendMenuAudio(sock, chatId, message) {
    try { const audioPath = path.join(__dirname, '../assets/menu_audio.mp3'); if (fs.existsSync(audioPath)) { await sock.sendMessage(chatId, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: false }, { quoted: message }); return true; } return false; }
    catch (e) { return false; }
}

function buildMenu(styleId, data) {
    const { userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, mediaDisplay, userPlatform, getLocalizedTime, fontId, styleId: styleNum, systemStats, ping } = data;

    // ✅ All info lines with emojis
    const infoLines = [
        `*👤 User:* ${userName}`,
        `*🤖 BotName:* ${settings.botName || 'WALLYJAYTECH-MD'}`,
        `*🧠 Version:* ${settings.version || '1.0.0'}`,
        `*👑 BotOwner:* ${settings.botOwner || 'Wally Jay'}`,
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
        `*💾 Ram:* ${systemStats.usedGB} GB of ${systemStats.totalGB} GB`,
        `*🌐 Users by Platform:*`,
        `  🏠 ${userPlatform === 'Local Machine' ? 'Panel' : userPlatform}: ${stats.platforms?.[userPlatform] || 1} users`,
        `*📡 Tracking:* Local Storage`
    ];

    // ✅ All command categories with their commands
    const allCommandsRaw = {
        '🧠 AI': [`.gemini`, `.gpt`, `.generate`, `.removebg`, `.sora`],
        '🦹 ANIME': [`.cry`, `.facepalm`, `.hug`, `.kiss`, `.nom`, `.pat`, `.poke`, `.wink`],
        '📥 DOWNLOAD': [`.facebook`, `.instagram`, `.play`, `.song`, `.spotify`, `.tiktok`, `.video`, `.ytmp4`],
        '🔤 EPHOTO': [`.1917`, `.arena`, `.blackpink`, `.devil`, `.fire`, `.glitch`, `.hacker`, `.ice`, `.impressive`, `.leaves`, `.light`, `.matrix`, `.metallic`, `.neon`, `.purple`, `.sand`, `.snow`, `.thunder`],
        '😁 FUN': [`.character`, `.compliment`, `.flirt`, `.goodnight`, `.insult`, `.poet`, `.roseday`, `.simp`, `.wasted`],
        '🎮 GAMES': [`.answer`, `.buychips`, `.coindaily`, `.coinflip`, `.coinhelp`, `.coinleaderboard`, `.coinstats`, `.dare`, `.guess`, `.hangman`, `.tictactoe`, `.trivia`, `.truth`],
        '🌐 GENERAL': [`.8ball`, `.alive`, `.attp`, `.clear`, `.fact`, `.getjid`, `.help`, `.joke`, `.lyrics`, `.menu`, `.news`, `.owner`, `.ping`, `.quote`, `.ss`, `.trt`, `.tts`, `.url`, `.vv`, `.weather`],
        '💻 GITHUB': [`.git`, `.github`, `.repo`, `.sc`, `.script`],
        '👥 GROUP': [`.admins`, `.antibadword`, `.antibot`, `.antilink`, `.antitag`, `.ban`, `.chatbot`, `.delete`, `.demote`, `.goodbye`, `.groupinfo`, `.hidetag`, `.jid`, `.kick`, `.mute`, `.promote`, `.resetlink`, `.setgdesc`, `.setgname`, `.setgpp`, `.ship`, `.stupid`, `.tag`, `.tagall`, `.tagnotadmin`, `.unban`, `.unmute`, `.warn`, `.warnings`, `.welcome`],
        '🧩 MISC': [`.circle`, `.comrade`, `.gay`, `.glass`, `.heart`, `.horny`, `.its-so-stupid`, `.jail`, `.lgbt`, `.lolice`, `.namecard`, `.oogway`, `.oogway2`, `.passed`, `.tonikawa`, `.triggered`, `.tweet`, `.ytcomment`],
        '🔒 OWNER': [`.anticall`, `.antidelete`, `.antiforeign`, `.autoreact`, `.autoread`, `.autorecord`, `.autorecordtype`, `.autostatus`, `.autotyping`, `.block`, `.botinfo`, `.checkupdate`, `.clearsession`, `.cleartmp`, `.confighelp`, `.getpp`, `.join`, `.leave`, `.mention`, `.menufont`, `.menustyle`, `.mode`, `.pmblocker`, `.poll`, `.restart`, `.setauthor`, `.setbotname`, `.setbotowner`, `.setmention`, `.setownernumber`, `.setpackname`, `.setpp`, `.setprefix`, `.settings`, `.settimezone`, `.setytchannel`, `.sudo`, `.tempfile`, `.unblock`, `.update`, `.vote`],
        '🎨 STICKER': [`.blur`, `.crop`, `.emojimix`, `.igsc`, `.igs`, `.meme`, `.removebg`, `.remini`, `.simage`, `.sticker`, `.take`, `.tgsticker`]
    };

    // ✅ Sort categories alphabetically by name
    const sortedCategoryNames = Object.keys(allCommandsRaw).sort((a, b) => {
        const nameA = a.replace(/^[^\s]+\s/, ''); // Remove emoji for sorting
        const nameB = b.replace(/^[^\s]+\s/, '');
        return nameA.localeCompare(nameB);
    });

    const allCommands = sortedCategoryNames.map(name => [name, allCommandsRaw[name]]);

    const styles = {
        2: { top: '╭──❍「 USER INFO 」❍', line: '├•', secHdr: (s) => `╰─┬─★─☆─♪♪─❍\n╭─┴❍「 ${s} 」❍`, bot: '╰─┬─★─☆─♪♪─❍', bul: '├• ' },
        3: { top: '╭──✤「 USER PANEL 」✤', line: '├•', secHdr: (s) => `╰─✤─✤─✤─✤─✤─✤─✤─✤\n╭──✤「 ${s} 」✤`, bot: '╰─✤─✤─✤─✤─✤─✤─✤─✤', bul: '├• ' },
        4: { top: '╭──⍟「 BOT STATUS 」⍟', line: '⤚', secHdr: (s) => `╰─⍟─⍟─⍟─⍟─⍟─⍟─⍟─⍟\n╭──⍟「 ${s} 」⍟`, bot: '╰─⍟─⍟─⍟─⍟─⍟─⍟─⍟─⍟', bul: '⤚ ' },
        5: { top: '━━━❖━⦿━❖━⦿━❖━⦿━❖━⦿━━━\n╭──❖「 USER INFO 」❖', line: '⤚', secHdr: (s) => `╰─❖─❖─❖─❖─❖─❖─❖─❖\n╭──❖「 ${s} 」❖`, bot: '╰─❖─❖─❖─❖─❖─❖─❖─❖', bul: '⤚ ' },
        6: { top: '╭──⌬「 MAIN MENU 」⌬', line: '⤚', secHdr: (s) => `╰─⌬─⌬─⌬─⌬─⌬─⌬─⌬─⌬\n╭──⌬「 ${s} 」⌬`, bot: '╰─⌬─⌬─⌬─⌬─⌬─⌬─⌬─⌬', bul: '⤚ ' },
        7: { top: '╭──⏣「 DASHBOARD 」⏣', line: '⤷', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '⤷ ' },
        8: { top: '╭──⏣「 STATUS 」⏣', line: '▶', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▶ ' },
        9: { top: '╭──⨁「 SYSTEM 」⨁', line: '⤷', secHdr: (s) => `╰─⨁─⨁─⨁─⨁─⨁─⨁─⨁─⨁\n╭──⨁「 ${s} 」⨁`, bot: '╰─⨁─⨁─⨁─⨁─⨁─⨁─⨁─⨁', bul: '⤷ ' },
        10: { top: '╭──⏣「 MENU HEADER 」⏣', line: '▸', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▸ ' },
        11: { top: '╭──⏣「 PROFILE 」⏣', line: '▸', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▸ ' },
        12: { top: '╭──⍋「 BOT INFO 」⍋', line: '▶', secHdr: (s) => `╰─⍋─⍋─⍋─⍋─⍋─⍋─⍋─⍋\n╭──⍋「 ${s} 」⍋`, bot: '╰─⍋─⍋─⍋─⍋─⍋─⍋─⍋─⍋', bul: '▶ ' }
    };

    // 🟢 STYLE 1 (DEFAULT) — New Diamond Design
    if (styleId === 1) {
        let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
        menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
        menu += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n`;
        menu += `├\n`;
        for (const l of infoLines) menu += `├◇ ${l}\n`;
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n`;
        for (const [title, cmds] of allCommands) {
            menu += `╭─┴◆「 *${title}* 」◆\n`;
            menu += `├\n`;
            for (const cmd of cmds.sort()) menu += `├◇ ${cmd}\n`;
            menu += `├\n╰─┬─★─☆─♪♪─★\n\n`;
        }
        menu += `              *© 2025 - 2026*\n\n`;
        menu += `╭──「 *WALLYJAYTECH-MD* 」◆\n`;
        menu += `╰───★─☆─♪♪─◆`;
        return menu;
    }

    // 🟡 STYLES 2–12 — Keep original
    const s = styles[styleId] || styles[2];
    let menu = `👋 Hello *${userName.split('@')[0]}*! ${greeting.message}\n\n`;
    menu += `*${greeting.greeting}!* Here's your menu:\n\n`;
    menu += s.top + '\n';
    for (const l of infoLines) menu += s.line + ' ' + l + '\n';
    for (const [title, cmds] of allCommands) {
        menu += s.secHdr(title) + '\n';
        for (const cmd of cmds) menu += s.bul + cmd + '\n';
    }
    menu += s.bot + '\n\n';
    menu += `📊 Total Commands: ${totalCommands}\n\n`;
    menu += `📊 Local Stats: ${stats.activeUsers} active now, ${stats.totalUsers} total users\n\n`;
    menu += `${greeting.emoji} *${greeting.greeting}*, *${userName.split('@')[0]}*! ${greeting.message}`;
    return menu;
}

async function helpCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;

    // Resolve LID to real JID for proper channel button rendering
    let sendChatId = chatId;
    let realSenderJid = senderId;
    if (chatId.endsWith('@lid')) {
        const realJid = message.key.remoteJidAlt;
        if (realJid?.includes('@s.whatsapp.net')) {
            sendChatId = realJid;
            realSenderJid = realJid;
            console.log(`✅ Resolved LID ${chatId} → ${sendChatId}`);
        }
    }
    
    const userName = await getUserName(sock, senderId, message);
    const greeting = getTimeBasedGreeting();
    const dayInfo = getDayWithEmoji();
    const currentBotMode = getBotMode();
    const prefix = getPrefix();
    const userPlatform = getDeploymentPlatform();
    const totalCommands = countTotalCommands();
    const stats = getUserStats();
    updateUserStats(senderId, userPlatform);
    const fontId = getCurrentFont();
    const styleId = getCurrentStyle();
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

    // ✅ Fix: Show "GIF & Audio" in menu info
    const mediaDisplay = menuType === 'GIF' ? 'GIF & Audio' : menuType === 'Image' ? 'Image & Audio' : 'Text & Audio';

    const getLocalizedTime = () => {
        try { return new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
        catch (e) { return new Date().toLocaleString(); }
    };

    let platformStatsText = '';
    const platforms = stats.platforms || {};
    const platformEntries = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
    platformStatsText = platformEntries.length > 0 ? platformEntries.map(([p, c]) => `║     ${getPlatformEmoji(p)} ${p}: ${c} users`).join('\n') : '║     📊 No platform data yet';

    let helpMessage = buildMenu(styleId, {
        userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, mediaDisplay, userPlatform, getLocalizedTime, styleId, fontId, systemStats, ping
    });

    // ✅ Channel button using newsletter approach
    const channelCtx = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: '‎', // ← invisible zero‑width character
            serverMessageId: -1
        }
    };

    const finalMessage = applyFont(helpMessage, fontId);

    try {
        if (menuType === 'Image') {
            await sock.sendMessage(sendChatId, {
                image: fs.readFileSync(imagePath),
                caption: finalMessage,
                mentions: [realSenderJid],
                contextInfo: channelCtx
            }, { quoted: message });
        } else if (menuType === 'GIF') {
            await sock.sendMessage(sendChatId, {
                video: fs.readFileSync(gifPath),
                mimetype: 'video/mp4',
                gifPlayback: true,
                caption: finalMessage,
                mentions: [realSenderJid],
                contextInfo: channelCtx
            }, { quoted: message });
        } else {
            await sock.sendMessage(sendChatId, {
                text: finalMessage,
                mentions: [realSenderJid],
                contextInfo: channelCtx
            }, { quoted: message });
        }
        await new Promise(r => setTimeout(r, 1000));
        await sendMenuAudio(sock, sendChatId, message);
    } catch (error) {
        console.error('❌ Error in help command:', error);
        await sock.sendMessage(sendChatId, {
            text: finalMessage,
            mentions: [realSenderJid]
        }, { quoted: message });
    }
}

module.exports = helpCommand;
