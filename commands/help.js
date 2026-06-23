const settings = require('../settings');
const fs = require('fs');
const path = require('path');
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
        const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
        Object.keys(stats.activeUsers || {}).forEach(key => { if (stats.activeUsers[key] < thirtyMinutesAgo) delete stats.activeUsers[key]; });
        return { totalUsers: stats.totalUsers || Object.keys(stats.users || {}).length, activeUsers: Object.keys(stats.activeUsers || {}).length, platforms: stats.platforms || {} };
    } catch (error) { return { totalUsers: 0, activeUsers: 0, platforms: {} }; }
}

function getPrefix() { return settings.prefix || '.'; }

function getBotMode() {
    try {
        const p = path.join(__dirname, '../data/messageCount.json');
        if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'PUBLIC 🌐' : 'PRIVATE 🔒'; }
        return 'PUBLIC 🌐';
    } catch (e) { return 'PUBLIC 🌐'; }
}

function getTimeBasedGreeting() {
    try {
        const now = new Date();
        const tz = settings.timezone || 'Africa/Lagos';
        const hour = parseInt(now.toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' }));
        const time = now.toLocaleString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit' });
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
        const map = { 'Monday': '📅', 'Tuesday': '🔥', 'Wednesday': '🌎', 'Thursday': '🚀', 'Friday': '🎉', 'Saturday': '🌈', 'Sunday': '☀️' };
        return { day, emoji: map[day] || '📅' };
    } catch (e) { return { day: 'Today', emoji: '📅' }; }
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

async function sendMenuAudio(sock, chatId, message) {
    try { const audioPath = path.join(__dirname, '../assets/menu_audio.mp3'); if (fs.existsSync(audioPath)) { await sock.sendMessage(chatId, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: false }, { quoted: message }); return true; } return false; }
    catch (e) { return false; }
}

function buildMenu(styleId, data) {
    const { userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, menuType, userPlatform, getLocalizedTime } = data;

    const infoLines = [
        `User  : @${userName}`,
        `Bot   : ${settings.botName || 'WALLYJAYTECH-MD'}`,
        `Owner : ${settings.botOwner || 'Wally Jay'}`,
        `Prefix: ${prefix}`,
        `Style : ${styleId}`,
        `Media : ${menuType}`,
        `TZone : ${settings.timezone}`,
        `Time  : ${greeting.time}`,
        `Day   : ${dayInfo.day}`,
        `Mode  : ${currentBotMode}`,
        `Cmds  : ${totalCommands}`,
        `Date  : ${getLocalizedTime()}`,
        `Active: ${stats.activeUsers}`,
        `Total : ${stats.totalUsers}`
    ];

    const allCommands = [
        ['🧠 AI', [`.flux`, `.gemini`, `.gpt`, `.imagine`, `.sora`]],
        ['🦹 ANIME', [`.cry`, `.facepalm`, `.hug`, `.kiss`, `.nom`, `.pat`, `.poke`, `.wink`]],
        ['📥 DOWNLOAD', [`.facebook`, `.instagram`, `.play`, `.song`, `.spotify`, `.tiktok`, `.video`, `.ytmp4`]],
        ['🔤 EPHOTO', [`.1917`, `.arena`, `.blackpink`, `.devil`, `.fire`, `.glitch`, `.hacker`, `.ice`, `.impressive`, `.leaves`, `.light`, `.matrix`, `.metallic`, `.neon`, `.purple`, `.sand`, `.snow`, `.thunder`]],
        ['😁 FUN', [`.character`, `.compliment`, `.flirt`, `.goodnight`, `.insult`, `.poet`, `.roseday`, `.simp`, `.wasted`]],
        ['🎮 GAMES', [`.answer`, `.buychips`, `.coindaily`, `.coinflip`, `.coinhelp`, `.coinleaderboard`, `.coinstats`, `.dare`, `.guess`, `.hangman`, `.tictactoe`, `.trivia`, `.truth`]],
        ['🌐 GENERAL', [`.8ball`, `.alive`, `.attp`, `.clear`, `.fact`, `.getjid`, `.help`, `.joke`, `.lyrics`, `.menu`, `.news`, `.owner`, `.ping`, `.quote`, `.ss`, `.trt`, `.tts`, `.url`, `.vv`, `.weather`]],
        ['💻 GITHUB', [`.git`, `.github`, `.repo`, `.sc`, `.script`]],
        ['👥 GROUP', [`.admins`, `.antibadword`, `.antibot`, `.antilink`, `.antitag`, `.ban`, `.chatbot`, `.delete`, `.demote`, `.goodbye`, `.groupinfo`, `.hidetag`, `.jid`, `.kick`, `.mute`, `.promote`, `.resetlink`, `.setgdesc`, `.setgname`, `.setgpp`, `.ship`, `.stupid`, `.tag`, `.tagall`, `.tagnotadmin`, `.unban`, `.unmute`, `.warn`, `.warnings`, `.welcome`]],
        ['🧩 MISC', [`.circle`, `.comrade`, `.gay`, `.glass`, `.heart`, `.horny`, `.its-so-stupid`, `.jail`, `.lgbt`, `.lolice`, `.namecard`, `.oogway`, `.oogway2`, `.passed`, `.tonikawa`, `.triggered`, `.tweet`, `.ytcomment`]],
        ['🔒 OWNER', [`.anticall`, `.antidelete`, `.antiforeign`, `.autoreact`, `.autoread`, `.autorecord`, `.autorecordtype`, `.autostatus`, `.autotyping`, `.block`, `.botinfo`, `.checkupdate`, `.clearsession`, `.cleartmp`, `.confighelp`, `.getpp`, `.join`, `.leave`, `.mention`, `.menufont`, `.menustyle`, `.mode`, `.pmblocker`, `.poll`, `.restart`, `.setauthor`, `.setbotname`, `.setbotowner`, `.setmention`, `.setownernumber`, `.setpackname`, `.setpp`, `.setprefix`, `.settings`, `.settimezone`, `.setytchannel`, `.sudo`, `.tempfile`, `.unblock`, `.update`, `.vote`]],
        ['🎨 STICKER', [`.blur`, `.crop`, `.emojimix`, `.igsc`, `.igs`, `.meme`, `.removebg`, `.remini`, `.simage`, `.sticker`, `.take`, `.tgsticker`]]
    ];

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

    const s = styles[styleId] || styles[2];

    let menu = `👋 Hello @${userName}! ${greeting.message}\n\n`;
    menu += `${greeting.greeting}! Here's your menu:\n\n`;
    menu += s.top + '\n';
    for (const l of infoLines) menu += s.line + ' ' + l + '\n';
    
    for (const [title, cmds] of allCommands) {
        menu += s.secHdr(title) + '\n';
        for (const cmd of cmds) menu += s.bul + cmd + '\n';
    }
    menu += s.bot + '\n\n';
    menu += `    🟡 Copyright wallyjaytech 2025 🟡\n\n`;
    menu += `📊 Total Commands: ${totalCommands}\n\n`;
    menu += `📊 Local Stats: ${stats.activeUsers} active now, ${stats.totalUsers} total users\n\n`;
    menu += `${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}\n\n`;
    menu += `⬇️Join our channel below for updates⬇️`;

    return menu;
}

async function helpCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
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

    let menuType = 'TEXT';
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    const videoPath = path.join(__dirname, '../assets/menu_video.mp4');
    if (fs.existsSync(imagePath) && fs.existsSync(videoPath)) menuType = Math.random() < 0.5 ? 'IMAGE' : 'VIDEO';
    else if (fs.existsSync(imagePath)) menuType = 'IMAGE';
    else if (fs.existsSync(videoPath)) menuType = 'VIDEO';

    const getLocalizedTime = () => {
        try { return new Date().toLocaleString('en-US', { timeZone: settings.timezone || 'Africa/Lagos', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
        catch (e) { return new Date().toLocaleString(); }
    };

    let platformStatsText = '';
    const platforms = stats.platforms || {};
    const platformEntries = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
    platformStatsText = platformEntries.length > 0 ? platformEntries.map(([p, c]) => `║     ${getPlatformEmoji(p)} ${p}: ${c} users`).join('\n') : '║     📊 No platform data yet';

    const userUsageInfo = stats.users?.[`user_${senderId.split('@')[0]}`] ? `║     📈 Your Usage: ${stats.users[`user_${senderId.split('@')[0]}`].totalUses || 1} commands` : '║     📈 Your Usage: First time user';

    let helpMessage;
    
    if (styleId === 1) {
        helpMessage = `
👋 Hello @${userName}! ${greeting.message}

${greeting.greeting}! Here's your menu:

╔❖🔹 WALLYJAYTECH-MD MENU 🔹❖
║
║   👤 User: [ @${userName} ]
║   🤖 BotName: [ ${settings.botName || 'WALLYJAYTECH-MD'} ]
║   🧠 Version: [ ${stats.version || settings.version || '1.0.0'} ]
║   👑 BotOwner: [ ${settings.botOwner || 'Wally Jay Tech'} ]
║   📺 YT Channel: [ ${global.ytch} ]
║   📞 OwnerNumber: [ ${settings.ownerNumber} ]
║   📥 Prefix: [ ${prefix} ]
║   🎨 Menu Style: [ ${styleId} ]
║   🎬 Menu Media: [ ${menuType} & AUDIO ]
║   🌍 TimeZone: [ ${settings.timezone} ]
║   ⏰ Current Time: [ ${greeting.time} ]
║   ${dayInfo.emoji} Day: [ ${dayInfo.day} ]
║   💻 Bot Mode: [ ${currentBotMode} ]
║   📊 Total Commands: [ ${totalCommands} ]
║   📅 Date: [ ${getLocalizedTime()} ]
║   📡 Your Platform: [ ${userPlatform} ]
║   👥 Active Users Now: [ ${stats.activeUsers} ]
║   📊 Total Users All Time: [ ${stats.totalUsers} ]
${userUsageInfo}
║   🌐 Users by Platform:
${platformStatsText}
║   📡 Tracking: Local Storage ✅
║
╚═══════════════════╝

   ⬇️ ALL COMMANDS ⬇️

╔═══════════════════╗
║
║    🔒OWNER CMDS🔒
║
║ 🔺${prefix}anticall <on/off>
║ 🔺${prefix}antidelete
║ 🔺${prefix}antiforeign
║ 🔺${prefix}autoreact <on/off>
║ 🔺${prefix}autoread <on/off>
║ 🔺${prefix}autorecord
║ 🔺${prefix}autorecordtype
║ 🔺${prefix}autostatus <on/off>
║ 🔺${prefix}autostatus react <on/off>
║ 🔺${prefix}autotyping
║ 🔺${prefix}block
║ 🔺${prefix}botinfo
║ 🔺${prefix}checkupdate
║ 🔺${prefix}clearsession
║ 🔺${prefix}cleartmp
║ 🔺${prefix}confighelp
║ 🔺${prefix}getpp
║ 🔺${prefix}join
║ 🔺${prefix}leave
║ 🔺${prefix}mention <on/off>
║ 🔺${prefix}menufont <1-12>
║ 🔺${prefix}menustyle <1-12>
║ 🔺${prefix}mode <public/private>
║ 🔺${prefix}pmblocker <on/off/status>
║ 🔺${prefix}pmblocker setmsg <text>
║ 🔺${prefix}poll
║ 🔺${prefix}restart
║ 🔺${prefix}setauthor
║ 🔺${prefix}setbotname
║ 🔺${prefix}setbotowner
║ 🔺${prefix}setmention <reply to msg>
║ 🔺${prefix}setownernumber
║ 🔺${prefix}setpackname
║ 🔺${prefix}setpp <reply to image>
║ 🔺${prefix}setprefix
║ 🔺${prefix}settings
║ 🔺${prefix}settimezone
║ 🔺${prefix}setytchannel
║ 🔺${prefix}sudo
║ 🔺${prefix}tempfile
║ 🔺${prefix}unblock
║ 🔺${prefix}update
║ 🔺${prefix}updateinfo
║ 🔺${prefix}vote
║
╚═══════════════════╝

╔═══════════════════╗
║
║   👨‍👩‍👧‍👦GROUP CMDS👨‍👩‍👧‍👦
║
║ 🔹${prefix}admins
║ 🔹${prefix}antibadword
║ 🔹${prefix}antibot
║ 🔹${prefix}antilink
║ 🔹${prefix}antitag <on/off>
║ 🔹${prefix}ban @user
║ 🔹${prefix}chatbot
║ 🔹${prefix}delete
║ 🔹${prefix}demote @user
║ 🔹${prefix}goodbye <on/off>
║ 🔹${prefix}groupinfo
║ 🔹${prefix}hidetag <message>
║ 🔹${prefix}jid
║ 🔹${prefix}kick @user
║ 🔹${prefix}mute <minutes>
║ 🔹${prefix}promote @user
║ 🔹${prefix}resetlink
║ 🔹${prefix}setgdesc <description>
║ 🔹${prefix}setgname <new name>
║ 🔹${prefix}setgpp (reply to image)
║ 🔹${prefix}ship
║ 🔹${prefix}stupid @user <text>
║ 🔹${prefix}tag <message>
║ 🔹${prefix}tagall
║ 🔹${prefix}tagnotadmin
║ 🔹${prefix}unban @user
║ 🔹${prefix}unmute
║ 🔹${prefix}warn @user
║ 🔹${prefix}warnings @user
║ 🔹${prefix}welcome <on/off>
║
╚═══════════════════╝

╔═══════════════════╗
║
║   🎨STICKER CMDS🎨
║
║ 🔻${prefix}blur <image>
║ 🔻${prefix}crop <reply to image>
║ 🔻${prefix}emojimix <emj1>+<emj2>
║ 🔻${prefix}igsc <insta link>
║ 🔻${prefix}igs <insta link>
║ 🔻${prefix}meme
║ 🔻${prefix}removebg
║ 🔻${prefix}remini
║ 🔻${prefix}simage <reply to sticker>
║ 🔻${prefix}sticker <reply to img or vid>
║ 🔻${prefix}take <packname>
║ 🔻${prefix}tgsticker <Link>
║
╚═══════════════════╝

╔═══════════════════╗
║
║   📩WHATSAPP CMDS📩
║
║ 🟤${prefix}clear
║
╚═══════════════════╝

╔═══════════════════╗
║
║     🖼️PIES CMDS🖼️
║
║ ▫️${prefix}china
║ ▫️${prefix}hijab
║ ▫️${prefix}indonesia
║ ▫️${prefix}japan
║ ▫️${prefix}korea
║ ▫️${prefix}pies <country>
║
╚═══════════════════╝

╔═══════════════════╗
║
║     🎮GAME CMDS🎮
║
║ ◾️${prefix}answer <answer>
║ ◾️${prefix}buychips
║ ◾️${prefix}coindaily
║ ◾️${prefix}coinflip
║ ◾️${prefix}coinflip <heads/tails>
║ ◾️${prefix}coinflip <heads/tails> <bet>
║ ◾️${prefix}coinhelp
║ ◾️${prefix}coinleaderboard
║ ◾️${prefix}coinstats
║ ◾️${prefix}dare
║ ◾️${prefix}guess <letter>
║ ◾️${prefix}hangman
║ ◾️${prefix}tictactoe @user
║ ◾️${prefix}trivia
║ ◾️${prefix}truth
║
╚═══════════════════╝

╔═══════════════════╗
║
║      🧠AI CMDS🧠
║
║ ♦️${prefix}flux <prompt>
║ ♦️${prefix}gemini <question>
║ ♦️${prefix}gpt <question>
║ ♦️${prefix}imagine <prompt>
║ ♦️${prefix}sora <prompt>
║
╚═══════════════════╝

╔═══════════════════╗
║
║     😁FUN CMDS😁
║
║ 🟢${prefix}character @user
║ 🟢${prefix}compliment @user
║ 🟢${prefix}flirt
║ 🟢${prefix}goodnight
║ 🟢${prefix}insult @user
║ 🟢${prefix}poet
║ 🟢${prefix}roseday
║ 🟢${prefix}simp @user
║ 🟢${prefix}wasted @user
║
╚═══════════════════╝

╔═══════════════════╗
║
║    🔤EPHOTO CMDS🔤
║
║ 🔴${prefix}1917 <text>
║ 🔴${prefix}arena <text>
║ 🔴${prefix}blackpink <text>
║ 🔴${prefix}devil <text>
║ 🔴${prefix}fire <text>
║ 🔴${prefix}glitch <text>
║ 🔴${prefix}hacker <text>
║ 🔴${prefix}ice <text>
║ 🔴${prefix}impressive <text>
║ 🔴${prefix}leaves <text>
║ 🔴${prefix}light <text>
║ 🔴${prefix}matrix <text>
║ 🔴${prefix}metallic <text>
║ 🔴${prefix}neon <text>
║ 🔴${prefix}purple <text>
║ 🔴${prefix}sand <text>
║ 🔴${prefix}snow <text>
║ 🔴${prefix}thunder <text>
║
╚═══════════════════╝

╔═══════════════════╗
║
║   📥DOWNLOAD CMDS📥
║
║ 🟠${prefix}facebook <link>
║ 🟠${prefix}instagram <link>
║ 🟠${prefix}play <song name>
║ 🟠${prefix}song <song name>
║ 🟠${prefix}spotify <query>
║ 🟠${prefix}tiktok <link>
║ 🟠${prefix}video <song name>
║ 🟠${prefix}ytmp4 <Link>
║
╚═══════════════════╝

╔═══════════════════╗
║
║    🧩MISC CMDS🧩
║
║ 🟡${prefix}circle
║ 🟡${prefix}comrade
║ 🟡${prefix}gay
║ 🟡${prefix}glass
║ 🟡${prefix}heart
║ 🟡${prefix}horny
║ 🟡${prefix}its-so-stupid
║ 🟡${prefix}jail
║ 🟡${prefix}lgbt
║ 🟡${prefix}lolice
║ 🟡${prefix}namecard
║ 🟡${prefix}oogway
║ 🟡${prefix}oogway2
║ 🟡${prefix}passed
║ 🟡${prefix}tonikawa
║ 🟡${prefix}triggered
║ 🟡${prefix}tweet
║ 🟡${prefix}ytcomment
║
╚═══════════════════╝

╔═══════════════════╗
║
║    🦹‍♀️ANIME CMDS🦹‍♀️
║
║ 🟣${prefix}cry
║ 🟣${prefix}facepalm
║ 🟣${prefix}hug
║ 🟣${prefix}kiss
║ 🟣${prefix}nom
║ 🟣${prefix}pat
║ 🟣${prefix}poke
║ 🟣${prefix}wink
║
╚═══════════════════╝

╔═══════════════════╗
║
║   💻GITHUB CMDS💻
║
║ 🔵${prefix}git
║ 🔵${prefix}github
║ 🔵${prefix}repo
║ 🔵${prefix}sc
║ 🔵${prefix}script
║
╚═══════════════════╝

╔═══════════════════╗
║
║    🌐GENERAL CMDS🌐
║
║ 🔸${prefix}8ball <question>
║ 🔸${prefix}alive
║ 🔸${prefix}attp <text>
║ 🔸${prefix}fact
║ 🔸${prefix}getjid
║ 🔸${prefix}help or ${prefix}menu
║ 🔸${prefix}joke
║ 🔸${prefix}lyrics <songtitle>
║ 🔸${prefix}news
║ 🔸${prefix}owner
║ 🔸${prefix}ping
║ 🔸${prefix}quote
║ 🔸${prefix}ss <link>
║ 🔸${prefix}trt <text> <lang>
║ 🔸${prefix}tts <text>
║ 🔸${prefix}url
║ 🔸${prefix}vv
║ 🔸${prefix}weather <city>
║
╚═══════════════════╝

    🟡 Copyright wallyjaytech 2025 🟡

📊 Total Commands: ${totalCommands}

📊 Local Stats: ${stats.activeUsers} active now, ${stats.totalUsers} total users

${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}

⬇️Join our channel below for updates⬇️`;
    } else {
        const menuData = { userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, menuType, userPlatform, getLocalizedTime, styleId };
        helpMessage = buildMenu(styleId, menuData);
    }

    const finalMessage = applyFont(helpMessage, fontId);

    try {
        if (menuType === 'IMAGE') {
            await sock.sendMessage(chatId, { image: fs.readFileSync(imagePath), caption: finalMessage, mentions: [senderId], contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } }, { quoted: message });
        } else if (menuType === 'VIDEO') {
            await sock.sendMessage(chatId, { video: fs.readFileSync(videoPath), caption: finalMessage, mentions: [senderId], contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: finalMessage, mentions: [senderId], contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } });
        }
        await new Promise(r => setTimeout(r, 1000));
        await sendMenuAudio(sock, chatId, message);
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: finalMessage, mentions: [senderId], contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363420618370733@newsletter', newsletterName: 'WALLYJAYTECH-MD BOTS', serverMessageId: -1 } } });
    }
}

module.exports = helpCommand;
