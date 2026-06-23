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
        ['🔒 OWNER', [`.mode`, `.menufont`, `.menustyle`, `.autorecord`, `.autotyping`, `.autorecordtype`, `.autostatus`, `.autoreact`, `.autoread`, `.antiforeign`, `.join`, `.poll`, `.vote`, `.block`, `.unblock`, `.getpp`, `.leave`, `.clearsession`, `.antidelete`, `.tempfile`, `.cleartmp`, `.checkupdate`, `.update`, `.botinfo`, `.setprefix`, `.setbotname`, `.setbotowner`, `.setownernumber`, `.setytchannel`, `.setpackname`, `.setauthor`, `.settimezone`, `.restart`, `.sudo`, `.settings`, `.setpp`, `.anticall`, `.pmblocker`, `.setmention`, `.mention`]],
        ['👥 GROUP', [`.ban`, `.unban`, `.promote`, `.demote`, `.mute`, `.unmute`, `.delete`, `.kick`, `.ship`, `.stupid`, `.warnings`, `.warn`, `.antilink`, `.antibadword`, `.antibot`, `.groupinfo`, `.admins`, `.jid`, `.tag`, `.tagall`, `.tagnotadmin`, `.hidetag`, `.chatbot`, `.resetlink`, `.antitag`, `.welcome`, `.goodbye`, `.setgdesc`, `.setgname`, `.setgpp`]],
        ['🎨 STICKER', [`.blur`, `.simage`, `.sticker`, `.removebg`, `.remini`, `.crop`, `.tgsticker`, `.meme`, `.take`, `.emojimix`, `.igs`, `.igsc`]],
        ['📥 DOWNLOAD', [`.play`, `.song`, `.spotify`, `.instagram`, `.facebook`, `.tiktok`, `.video`, `.ytmp4`]],
        ['🧠 AI', [`.gpt`, `.gemini`, `.imagine`, `.flux`, `.sora`]],
        ['🎮 GAMES', [`.tictactoe`, `.hangman`, `.guess`, `.trivia`, `.answer`, `.truth`, `.dare`, `.coinflip`, `.coinstats`, `.coinleaderboard`, `.coindaily`, `.buychips`, `.coinhelp`]],
        ['😁 FUN', [`.compliment`, `.insult`, `.flirt`, `.poet`, `.goodnight`, `.roseday`, `.character`, `.wasted`, `.simp`]],
        ['🔤 EPHOTO', [`.metallic`, `.ice`, `.snow`, `.impressive`, `.matrix`, `.light`, `.neon`, `.devil`, `.purple`, `.thunder`, `.leaves`, `.1917`, `.arena`, `.hacker`, `.sand`, `.blackpink`, `.glitch`, `.fire`]],
        ['🧩 MISC', [`.heart`, `.horny`, `.circle`, `.lgbt`, `.lolice`, `.tonikawa`, `.its-so-stupid`, `.namecard`, `.oogway`, `.oogway2`, `.tweet`, `.ytcomment`, `.comrade`, `.gay`, `.glass`, `.jail`, `.passed`, `.triggered`]],
        ['🦹 ANIME', [`.nom`, `.poke`, `.cry`, `.kiss`, `.pat`, `.hug`, `.wink`, `.facepalm`]],
        ['💻 GITHUB', [`.git`, `.github`, `.sc`, `.script`, `.repo`]],
        ['🌐 GENERAL', [`.help`, `.menu`, `.ping`, `.alive`, `.tts`, `.owner`, `.joke`, `.quote`, `.fact`, `.weather`, `.news`, `.attp`, `.lyrics`, `.8ball`, `.vv`, `.trt`, `.ss`, `.url`, `.getjid`, `.clear`]]
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
        // ORIGINAL MENU PRESERVED EXACTLY - with emoji prefixes
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
║  🔒OWNER CMDS🔒
║
║ 🔺${prefix}mode <public/private>
║ 🔺${prefix}menufont <1-12>
║ 🔺${prefix}menustyle <1-12>
║ 🔺${prefix}autorecord
║ 🔺${prefix}autotyping
║ 🔺${prefix}autorecordtype
║ 🔺${prefix}autostatus <on/off>
║ 🔺${prefix}autostatus react <on/off>
║ 🔺${prefix}autoreact <on/off>
║ 🔺${prefix}autoread <on/off>
║ 🔺${prefix}antiforeign
║ 🔺${prefix}join
║ 🔺${prefix}poll/${prefix}vote
║ 🔺${prefix}block
║ 🔺${prefix}unblock
║ 🔺${prefix}getpp
║ 🔺${prefix}leave
║ 🔺${prefix}clearsession
║ 🔺${prefix}antidelete
║ 🔺${prefix}tempfile
║ 🔺${prefix}cleartmp
║ 🔺${prefix}checkupdate
║ 🔺${prefix}updateinfo
║ 🔺${prefix}update
║ 🔺${prefix}botinfo
║ 🔺${prefix}setprefix
║ 🔺${prefix}setbotname
║ 🔺${prefix}setbotowner
║ 🔺${prefix}setownernumber
║ 🔺${prefix}setytchannel
║ 🔺${prefix}setpackname
║ 🔺${prefix}setauthor
║ 🔺${prefix}settimezone
║ 🔺${prefix}confighelp
║ 🔺${prefix}restart
║ 🔺${prefix}sudo
║ 🔺${prefix}settings
║ 🔺${prefix}setpp <reply to image>
║ 🔺${prefix}anticall <on/off>
║ 🔺${prefix}pmblocker <on/off/status>
║ 🔺${prefix}pmblocker setmsg <text>
║ 🔺${prefix}setmention <reply to msg>
║ 🔺${prefix}mention <on/off>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 👨‍👩‍👧‍👦GROUP CMDS👨‍👩‍👧‍👦
║
║ 🔹${prefix}ban @user
║ 🔹${prefix}unban @user
║ 🔹${prefix}promote @user
║ 🔹${prefix}demote @user
║ 🔹${prefix}mute <minutes>
║ 🔹${prefix}unmute
║ 🔹${prefix}delete
║ 🔹${prefix}kick @user
║ 🔹${prefix}ship
║ 🔹${prefix}stupid @user <text>
║ 🔹${prefix}warnings @user
║ 🔹${prefix}warn @user
║ 🔹${prefix}antilink
║ 🔹${prefix}antibadword
║ 🔹${prefix}antibot
║ 🔹${prefix}groupinfo
║ 🔹${prefix}admins
║ 🔹${prefix}jid
║ 🔹${prefix}tag <message>
║ 🔹${prefix}tagall
║ 🔹${prefix}tagnotadmin
║ 🔹${prefix}hidetag <message>
║ 🔹${prefix}chatbot
║ 🔹${prefix}resetlink
║ 🔹${prefix}antitag <on/off>
║ 🔹${prefix}welcome <on/off>
║ 🔹${prefix}goodbye <on/off>
║ 🔹${prefix}setgdesc <description>
║ 🔹${prefix}setgname <new name>
║ 🔹${prefix}setgpp (reply to image)
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🎨STICKER CMDS🎨
║
║ 🔻${prefix}blur <image>
║ 🔻${prefix}simage <reply to sticker>
║ 🔻${prefix}sticker <reply to img or vid>
║ 🔻${prefix}removebg
║ 🔻${prefix}remini
║ 🔻${prefix}crop <reply to image>
║ 🔻${prefix}tgsticker <Link>
║ 🔻${prefix}meme
║ 🔻${prefix}take <packname>
║ 🔻${prefix}emojimix <emj1>+<emj2>
║ 🔻${prefix}igs <insta link>
║ 🔻${prefix}igsc <insta link>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 📩WHATSAPP CMDS📩
║
║ 🟤${prefix}clear
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🖼️PIES CMDS🖼️
║
║ ▫️${prefix}pies <country>
║ ▫️${prefix}china
║ ▫️${prefix}indonesia
║ ▫️${prefix}japan
║ ▫️${prefix}korea
║ ▫️${prefix}hijab
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🎮GAME CMDS🎮
║
║ ◾️${prefix}tictactoe @user
║ ◾️${prefix}hangman
║ ◾️${prefix}guess <letter>
║ ◾️${prefix}trivia
║ ◾️${prefix}answer <answer>
║ ◾️${prefix}truth
║ ◾️${prefix}dare
║ ◾️${prefix}coinflip
║ ◾️${prefix}coinflip <heads/tails>
║ ◾️${prefix}coinflip <heads/tails> <bet>
║ ◾️${prefix}coinstats
║ ◾️${prefix}coinleaderboard
║ ◾️${prefix}coindaily
║ ◾️${prefix}buychips
║ ◾️${prefix}coinhelp
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🧠AI CMDS🧠
║
║ ♦️${prefix}gpt <question>
║ ♦️${prefix}gemini <question>
║ ♦️${prefix}imagine <prompt>
║ ♦️${prefix}flux <prompt>
║ ♦️${prefix}sora <prompt>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 😁FUN CMDS😁
║
║ 🟢${prefix}compliment @user
║ 🟢${prefix}insult @user
║ 🟢${prefix}flirt
║ 🟢${prefix}poet
║ 🟢${prefix}goodnight
║ 🟢${prefix}roseday
║ 🟢${prefix}character @user
║ 🟢${prefix}wasted @user
║ 🟢${prefix}simp @user
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🔤EPHOTO CMDS🔤
║
║ 🔴${prefix}metallic <text>
║ 🔴${prefix}ice <text>
║ 🔴${prefix}snow <text>
║ 🔴${prefix}impressive <text>
║ 🔴${prefix}matrix <text>
║ 🔴${prefix}light <text>
║ 🔴${prefix}neon <text>
║ 🔴${prefix}devil <text>
║ 🔴${prefix}purple <text>
║ 🔴${prefix}thunder <text>
║ 🔴${prefix}leaves <text>
║ 🔴${prefix}1917 <text>
║ 🔴${prefix}arena <text>
║ 🔴${prefix}hacker <text>
║ 🔴${prefix}sand <text>
║ 🔴${prefix}blackpink <text>
║ 🔴${prefix}glitch <text>
║ 🔴${prefix}fire <text>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 📥DOWNLOAD CMDS📥
║
║ 🟠${prefix}play <song name>
║ 🟠${prefix}song <song name>
║ 🟠${prefix}spotify <query>
║ 🟠${prefix}instagram <link>
║ 🟠${prefix}facebook <link>
║ 🟠${prefix}tiktok <link>
║ 🟠${prefix}video <song name>
║ 🟠${prefix}ytmp4 <Link>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🧩MISC CMDS🧩
║
║ 🟡${prefix}heart
║ 🟡${prefix}horny
║ 🟡${prefix}circle
║ 🟡${prefix}lgbt
║ 🟡${prefix}lolice
║ 🟡${prefix}tonikawa
║ 🟡${prefix}its-so-stupid
║ 🟡${prefix}namecard
║ 🟡${prefix}oogway
║ 🟡${prefix}oogway2
║ 🟡${prefix}tweet
║ 🟡${prefix}ytcomment
║ 🟡${prefix}comrade
║ 🟡${prefix}gay
║ 🟡${prefix}glass
║ 🟡${prefix}jail
║ 🟡${prefix}passed
║ 🟡${prefix}triggered
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🦹‍♀️ANIME CMDS🦹‍♀️
║
║ 🟣${prefix}nom
║ 🟣${prefix}poke
║ 🟣${prefix}cry
║ 🟣${prefix}kiss
║ 🟣${prefix}pat
║ 🟣${prefix}hug
║ 🟣${prefix}wink
║ 🟣${prefix}facepalm
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 💻GITHUB CMDS💻
║
║ 🔵${prefix}git
║ 🔵${prefix}github
║ 🔵${prefix}sc
║ 🔵${prefix}script
║ 🔵${prefix}repo
║
╚═══════════════════╝

╔═══════════════════╗
║
║ 🌐GENERAL CMDS🌐
║
║ 🔸${prefix}help or ${prefix}menu
║ 🔸${prefix}ping
║ 🔸${prefix}alive
║ 🔸${prefix}tts <text>
║ 🔸${prefix}owner
║ 🔸${prefix}joke
║ 🔸${prefix}quote
║ 🔸${prefix}fact
║ 🔸${prefix}weather <city>
║ 🔸${prefix}news
║ 🔸${prefix}attp <text>
║ 🔸${prefix}lyrics <songtitle>
║ 🔸${prefix}8ball <question>
║ 🔸${prefix}vv
║ 🔸${prefix}trt <text> <lang>
║ 🔸${prefix}ss <link>
║ 🔸${prefix}url
║ 🔸${prefix}getjid
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
