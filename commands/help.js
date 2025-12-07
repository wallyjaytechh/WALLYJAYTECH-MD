const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// ========== LOCAL USER TRACKING (NO EXTERNAL API) ==========
// Simple, reliable tracking that works offline

// Platform detection function
function getDeploymentPlatform() {
    if (process.env.RENDER) {
        return 'Render';
    } else if (process.env.CODESPACE_NAME) {
        return 'Codespaces';
    } else if (process.env.PANEL_APP) {
        return 'Panel';
    } else if (process.env.REPL_SLUG) {
        return 'Replit';
    } else if (process.env.KOYEB_APP) {
        return 'Koyeb';
    } else if (process.env.FLY_APP_NAME) {
        return 'Fly.io';
    } else if (process.env.GLITCH_PROJECT_ID) {
        return 'Glitch';
    } else if (process.env.VERCEL) {
        return 'Vercel';
    } else if (process.env.HEROKU_APP_NAME) {
        return 'Heroku';
    } else if (process.env.RAILWAY_ENVIRONMENT) {
        return 'Railway';
    } else {
        return 'Local Machine';
    }
}

// Update user stats locally
function updateUserStats(userJid, platform) {
    try {
        const userPhone = userJid.split('@')[0];
        const statsPath = path.join(__dirname, '../data/userStats.json');
        
        // Create data directory if it doesn't exist
        const dataDir = path.dirname(statsPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Load existing stats or create new
        let stats = {
            totalUsers: 0,
            activeUsers: {},
            platforms: {},
            users: {},
            lastUpdated: Date.now(),
            botName: settings.botName || 'WALLYJAYTECH-MD',
            version: settings.version || '1.0.0'
        };
        
        if (fs.existsSync(statsPath)) {
            try {
                stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            } catch (e) {
                console.error('Error reading stats file, creating new:', e);
            }
        }
        
        const userKey = `user_${userPhone}`;
        const isNewUser = !stats.users[userKey];
        const currentTime = Date.now();
        
        // Update user data
        stats.users[userKey] = {
            phone: userPhone,
            platform: platform,
            lastActive: currentTime,
            firstSeen: isNewUser ? currentTime : (stats.users[userKey]?.firstSeen || currentTime),
            totalUses: (stats.users[userKey]?.totalUses || 0) + 1
        };
        
        // Update platform count (only for new users)
        if (isNewUser) {
            stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
            stats.totalUsers = Object.keys(stats.users).length;
        }
        
        // Mark as active (within last 30 minutes)
        stats.activeUsers[userKey] = currentTime;
        
        // Clean up old active users (inactive for 30 minutes)
        const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
        Object.keys(stats.activeUsers).forEach(key => {
            if (stats.activeUsers[key] < thirtyMinutesAgo) {
                delete stats.activeUsers[key];
            }
        });
        
        stats.lastUpdated = currentTime;
        
        // Save stats
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
        
        // Calculate current stats
        const activeUsers = Object.keys(stats.activeUsers).length;
        
        return {
            totalUsers: stats.totalUsers,
            activeUsers: activeUsers,
            platforms: stats.platforms,
            isGlobal: false,
            source: 'Local Storage',
            botName: stats.botName,
            version: stats.version
        };
        
    } catch (error) {
        console.error('Error updating user stats:', error);
        // Return minimal stats on error
        return {
            totalUsers: 1,
            activeUsers: 1,
            platforms: { [platform]: 1 },
            isGlobal: false,
            source: 'Local Error'
        };
    }
}

// Get user stats
function getUserStats() {
    try {
        const statsPath = path.join(__dirname, '../data/userStats.json');
        
        if (!fs.existsSync(statsPath)) {
            return {
                totalUsers: 0,
                activeUsers: 0,
                platforms: {},
                isGlobal: false,
                source: 'Local Storage',
                botName: settings.botName || 'WALLYJAYTECH-MD',
                version: settings.version || '1.0.0'
            };
        }
        
        const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        
        // Clean up old active users
        const currentTime = Date.now();
        const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
        Object.keys(stats.activeUsers || {}).forEach(key => {
            if (stats.activeUsers[key] < thirtyMinutesAgo) {
                delete stats.activeUsers[key];
            }
        });
        
        const activeUsers = Object.keys(stats.activeUsers || {}).length;
        
        return {
            totalUsers: stats.totalUsers || Object.keys(stats.users || {}).length,
            activeUsers: activeUsers,
            platforms: stats.platforms || {},
            isGlobal: false,
            source: 'Local Storage',
            botName: stats.botName || settings.botName || 'WALLYJAYTECH-MD',
            version: stats.version || settings.version || '1.0.0'
        };
        
    } catch (error) {
        console.error('Error getting user stats:', error);
        return {
            totalUsers: 0,
            activeUsers: 0,
            platforms: {},
            isGlobal: false,
            source: 'Error'
        };
    }
}

// Get prefix from settings
function getPrefix() {
    return settings.prefix || '.';
}

// Detect bot mode (public/private)
function getBotMode() {
    try {
        const messageCountPath = path.join(__dirname, '../data/messageCount.json');
        
        if (fs.existsSync(messageCountPath)) {
            const data = JSON.parse(fs.readFileSync(messageCountPath, 'utf8'));
            
            if (typeof data.isPublic === 'boolean') {
                return data.isPublic ? 'PUBLIC 🌐' : 'PRIVATE 🔒';
            }
        }
        
        return settings.commandMode === 'public' ? 'PUBLIC 🌐' : 'PRIVATE 🔒';
    } catch (error) {
        console.error('Error detecting bot mode:', error);
        return 'PUBLIC 🌐';
    }
}

// Time-based greetings
function getTimeBasedGreeting() {
    try {
        const now = new Date();
        const timezone = settings.timezone || 'Africa/Lagos';
        
        const timeString = now.toLocaleString('en-US', {
            timeZone: timezone,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const hour = now.toLocaleString('en-US', {
            timeZone: timezone,
            hour12: false,
            hour: '2-digit'
        });
        
        const hourNum = parseInt(hour);
        
        if (hourNum >= 5 && hourNum < 12) {
            return {
                greeting: '🌅 Good Morning',
                emoji: '🌅',
                time: timeString,
                message: 'Have a wonderful day ahead!'
            };
        } else if (hourNum >= 12 && hourNum < 17) {
            return {
                greeting: '☀️ Good Afternoon', 
                emoji: '☀️',
                time: timeString,
                message: 'Hope you\'re having a great day!'
            };
        } else if (hourNum >= 17 && hourNum < 21) {
            return {
                greeting: '🌇 Good Evening',
                emoji: '🌇',
                time: timeString,
                message: 'Hope you had a productive day!'
            };
        } else {
            return {
                greeting: '🌙 Good Night',
                emoji: '🌙',
                time: timeString,
                message: 'Have a peaceful night!'
            };
        }
    } catch (error) {
        return {
            greeting: '👋 Hello',
            emoji: '👋',
            time: new Date().toLocaleTimeString(),
            message: 'Nice to see you!'
        };
    }
}

// Get day of week with emoji
function getDayWithEmoji() {
    try {
        const now = new Date();
        const timezone = settings.timezone || 'Africa/Lagos';
        
        const day = now.toLocaleString('en-US', {
            timeZone: timezone,
            weekday: 'long'
        });
        
        const dayEmojis = {
            'Monday': '📅',
            'Tuesday': '🔥',
            'Wednesday': '🌎',
            'Thursday': '🚀',
            'Friday': '🎉',
            'Saturday': '🌈',
            'Sunday': '☀️'
        };
        
        return {
            day: day,
            emoji: dayEmojis[day] || '📅'
        };
    } catch (error) {
        return {
            day: 'Today',
            emoji: '📅'
        };
    }
}

// Get user name
async function getUserName(sock, userId, message) {
    try {
        const pushName = message.pushName || message.key?.pushName;
        if (pushName) {
            return pushName;
        }
        
        const name = await sock.getName(userId);
        if (name && name !== userId) {
            return name;
        }
        
        return userId.split('@')[0] || 'User';
    } catch (error) {
        console.error('Error getting user name:', error);
        return userId.split('@')[0] || 'User';
    }
}

// Get platform emoji
function getPlatformEmoji(platform) {
    const platformEmojis = {
        'Render': '☁️',
        'Codespaces': '💻', 
        'Panel': '🛠️',
        'Local Machine': '🏠',
        'Replit': '⚡',
        'Koyeb': '🚀',
        'Fly.io': '✈️',
        'Glitch': '🌀',
        'Vercel': '▲',
        'Heroku': '⚙️',
        'Railway': '🚂',
        'Unknown': '❓'
    };
    return platformEmojis[platform] || '❓';
}

// Count total commands
function countTotalCommands() {
    try {
        const mainJsPath = path.join(__dirname, '../main.js');
        
        if (!fs.existsSync(mainJsPath)) {
            return 157;
        }
        
        const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        let commandCount = 0;
        
        // Simple pattern to count case statements
        const casePattern = /case\s+userMessage\s*(===|\.startsWith\(|\.includes\(|\.match\()\s*['"`]\.([^'"`]+)['"`]/g;
        
        let match;
        while ((match = casePattern.exec(mainJsContent)) !== null) {
            if (match[2]) {
                commandCount++;
            }
        }
        
        console.log(`🤖 Auto-detected ${commandCount} commands`);
        return commandCount;
        
    } catch (error) {
        console.error('Error counting commands:', error);
        return 157;
    }
}

// Send menu with random media
async function sendMenu(sock, chatId, message, helpMessage, userId) {
    try {
        const mediaOptions = [
            {
                type: 'image',
                path: path.join(__dirname, '../assets/bot_image.jpg'),
                caption: helpMessage
            },
            {
                type: 'video', 
                path: path.join(__dirname, '../assets/menu_video.mp4'),
                caption: helpMessage
            }
        ];

        const selectedMedia = mediaOptions[Math.floor(Math.random() * mediaOptions.length)];
        
        console.log(`🎲 Selected media type: ${selectedMedia.type}`);
        
        if (fs.existsSync(selectedMedia.path)) {
            const mediaBuffer = fs.readFileSync(selectedMedia.path);
            
            if (selectedMedia.type === 'image') {
                await sock.sendMessage(chatId, {
                    image: mediaBuffer,
                    caption: selectedMedia.caption,
                    mentions: [userId],
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                console.log(`✅ Menu sent as image to @${userId.split('@')[0]}`);
                return true;
            } else if (selectedMedia.type === 'video') {
                await sock.sendMessage(chatId, {
                    video: mediaBuffer,
                    caption: selectedMedia.caption,
                    mentions: [userId],
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                console.log(`✅ Menu sent as video to @${userId.split('@')[0]}`);
                return true;
            }
        } else {
            console.log(`❌ ${selectedMedia.type} not found, using text fallback`);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                mentions: [userId],
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
            return true;
        }
    } catch (error) {
        console.error('Error sending menu:', error);
        return false;
    }
}

// Send menu audio
async function sendMenuAudio(sock, chatId, message) {
    try {
        const audioPath = path.join(__dirname, '../assets/menu_audio.mp3');
        if (fs.existsSync(audioPath)) {
            const audioBuffer = fs.readFileSync(audioPath);
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: message });
            console.log('🎵 Menu audio sent');
            return true;
        } else {
            console.log('❌ Menu audio not found, skipping audio');
            return false;
        }
    } catch (error) {
        console.error('Error sending audio:', error);
        return false;
    }
}

// Main help command
async function helpCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
    const userName = await getUserName(sock, senderId, message);
    
    const greeting = getTimeBasedGreeting();
    const dayInfo = getDayWithEmoji();
    const currentBotMode = getBotMode();
    const prefix = getPrefix();
    
    const userPlatform = getDeploymentPlatform();
    
    // Update user stats
    const userStats = updateUserStats(senderId, userPlatform);
    
    // Get stats for display
    const stats = getUserStats();
    
    const getLocalizedTime = () => {
        try {
            return new Date().toLocaleString('en-US', {
                timeZone: settings.timezone || 'Africa/Lagos',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit', 
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return new Date().toLocaleString();
        }
    };

    const totalCommands = countTotalCommands();
    
    // Format platform stats
    let platformStatsText = '';
    const platforms = stats.platforms || {};
    const platformEntries = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
    
    if (platformEntries.length > 0) {
        platformStatsText = platformEntries.map(([platform, count]) => 
            `║     ${getPlatformEmoji(platform)} ${platform}: ${count} users`
        ).join('\n');
    } else {
        platformStatsText = '║     📊 No platform data yet';
    }
    
    // Add your usage info
    const userUsageInfo = stats.users && stats.users[`user_${senderId.split('@')[0]}`] ? 
        `║     📈 Your Usage: ${stats.users[`user_${senderId.split('@')[0]}`].totalUses || 1} commands` : 
        '║     📈 Your Usage: First time user';
    
    const helpMessage = `
👋 *Hello @${userName}! ${greeting.message}*

*${greeting.greeting}! Here's your menu:*

╔❖🔹 *WALLYJAYTECH-MD MENU* 🔹❖
║
║   *👤 User: [ @${userName} ]*
║   *🤖 BotName: [ ${settings.botName || 'WALLYJAYTECH-MD'} ]*  
║   *🧠 Version: [ ${stats.version || settings.version || '1.0.0'} ]*
║   *👑 BotOwner: [ ${settings.botOwner || 'Wally Jay Tech'} ]*
║   *📺 YT Channel: [ ${global.ytch} ]*
║   *📞 OwnerNumber: [ ${settings.ownerNumber} ]*
║   *📥 Prefix: [ ${prefix} ]*
║   *🌍 TimeZone: [ ${settings.timezone} ]*
║   *⏰ Current Time: [ ${greeting.time} ]*
║   *${dayInfo.emoji} Day: [ ${dayInfo.day} ]*
║   *💻 Bot Mode: [ ${currentBotMode} ]*
║   *📊 Total Commands: [ ${totalCommands} ]*
║   *📅 AllDate: [ ${getLocalizedTime()} ]*
║   *📡 Your Platform: [ ${userPlatform} ]*
║   *👥 Active Users Now: [ ${stats.activeUsers} ]*
║   *📊 Total Users All Time: [ ${stats.totalUsers} ]*
${userUsageInfo}
║   *🌐 Users by Platform:*
${platformStatsText}
║   *📡 Tracking: Local Storage ✅*
║
╚═══════════════════╝

*⬇️ ALL COMMANDS ⬇️*

╔═══════════════════╗
║
║  *🔒OWNER CMDS🔒*
║
║ *🔺${prefix}autobio*
║ *🔺${prefix}mode <public/private>*
║ *🔺${prefix}autorecord*
║ *🔺${prefix}autotyping*
║ *🔺${prefix}autorecordtype*
║ *🔺${prefix}autostatus <on/off>*
║ *🔺${prefix}autostatus react <on/off>*
║ *🔺${prefix}autoreact <on/off>*
║ *🔺${prefix}autoread <on/off>*
║ *🔺${prefix}antiforeign*
║ *🔺${prefix}join*
║ *🔺${prefix}poll/${prefix}vote*
║ *🔺${prefix}block*
║ *🔺${prefix}unblock*
║ *🔺${prefix}getpp*
║ *🔺${prefix}leave*
║ *🔺${prefix}clearsession*
║ *🔺${prefix}antidelete*
║ *🔺${prefix}tempfile*
║ *🔺${prefix}cleartmp*
║ *🔺${prefix}checkupdate*
║ *🔺${prefix}updateinfo*
║ *🔺${prefix}update*
║ *🔺${prefix}botinfo*
║ *🔺${prefix}setprefix*
║ *🔺${prefix}restart*
║ *🔺${prefix}sudo*
║ *🔺${prefix}settings*
║ *🔺${prefix}setpp <reply to image>*
║ *🔺${prefix}anticall <on/off>*
║ *🔺${prefix}pmblocker <on/off/status>*
║ *🔺${prefix}pmblocker setmsg <text>*
║ *🔺${prefix}setmention <reply to msg>*
║ *🔺${prefix}mention <on/off>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *👨‍👩‍👧‍👦GROUP CMDS👨‍👩‍👧‍👦*
║
║ *🔹${prefix}ban @user*
║ *🔹${prefix}unban @user*
║ *🔹${prefix}promote @user*
║ *🔹${prefix}demote @user*
║ *🔹${prefix}mute <minutes>*
║ *🔹${prefix}unmute*
║ *🔹${prefix}delete*
║ *🔹${prefix}kick @user*
║ *🔹${prefix}ship*
║ *🔹${prefix}stupid @user <text>*
║ *🔹${prefix}warnings @user*
║ *🔹${prefix}warn @user*
║ *🔹${prefix}antilink*
║ *🔹${prefix}antibadword*
║ *🔹${prefix}antibot*
║ *🔹${prefix}groupinfo*
║ *🔹${prefix}admins*
║ *🔹${prefix}jid*
║ *🔹${prefix}tag <message>*
║ *🔹${prefix}tagall*
║ *🔹${prefix}tagnotadmin*
║ *🔹${prefix}hidetag <message>*
║ *🔹${prefix}chatbot*
║ *🔹${prefix}resetlink*
║ *🔹${prefix}antitag <on/off>*
║ *🔹${prefix}welcome <on/off>*
║ *🔹${prefix}goodbye <on/off>*
║ *🔹${prefix}setgdesc <description>*
║ *🔹${prefix}setgname <new name>*
║ *🔹${prefix}setgpp (reply to image)*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🎨STICKER CMDS🎨*
║
║ *🔻${prefix}blur <image>*
║ *🔻${prefix}simage <reply to sticker>*
║ *🔻${prefix}sticker <reply to img or vid>*
║ *🔻${prefix}removebg*
║ *🔻${prefix}remini*
║ *🔻${prefix}crop <reply to image>*
║ *🔻${prefix}tgsticker <Link>*
║ *🔻${prefix}meme*
║ *🔻${prefix}take <packname>*
║ *🔻${prefix}emojimix <emj1>+<emj2>*
║ *🔻${prefix}igs <insta link>*
║ *🔻${prefix}igsc <insta link>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *📩WHATSAPP CMDS📩*
║
║ *🟤${prefix}clear*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🖼️PIES CMDS🖼️*
║
║ *▫️${prefix}pies <country>*
║ *▫️${prefix}china*
║ *▫️${prefix}indonesia*
║ *▫️${prefix}japan*
║ *▫️${prefix}korea*
║ *▫️${prefix}hijab*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🎮GAME CMDS🎮*
║
║ *◾️${prefix}tictactoe @user*
║ *◾️${prefix}hangman*
║ *◾️${prefix}guess <letter for hangman>*
║ *◾️${prefix}trivia*
║ *◾️${prefix}answer <answer for trivia>*
║ *◾️${prefix}truth*
║ *◾️${prefix}dare*
║
╚═══════════════════╝

╔═══════════════════╗
║
║   *🧠AI CMDS🧠*
║
║ *♦️${prefix}gpt <question>*
║ *♦️${prefix}gemini <question>*
║ *♦️${prefix}imagine <prompt>*
║ *♦️${prefix}flux <prompt>*
║ *♦️${prefix}sora <prompt>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *😁FUN CMDS😁*
║
║ *🟢${prefix}compliment @user*
║ *🟢${prefix}insult @user*
║ *🟢${prefix}flirt*
║ *🟢${prefix}poet*
║ *🟢${prefix}goodnight*
║ *🟢${prefix}roseday*
║ *🟢${prefix}character @user*
║ *🟢${prefix}wasted @user*
║ *🟢${prefix}simp @user*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🔤EPHOTO CMDS🔤*
║
║ *🔴${prefix}metallic <text>*
║ *🔴${prefix}ice <text>*
║ *🔴${prefix}snow <text>*
║ *🔴${prefix}impressive <text>*
║ *🔴${prefix}matrix <text>*
║ *🔴${prefix}light <text>*
║ *🔴${prefix}neon <text>*
║ *🔴${prefix}devil <text>*
║ *🔴${prefix}purple <text>*
║ *🔴${prefix}thunder <text>*
║ *🔴${prefix}leaves <text>*
║ *🔴${prefix}1917 <text>*
║ *🔴${prefix}arena <text>*
║ *🔴${prefix}hacker <text>*
║ *🔴${prefix}sand <text>*
║ *🔴${prefix}blackpink <text>*
║ *🔴${prefix}glitch <text>*
║ *🔴${prefix}fire <text>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *📥DOWNLOAD CMDS📥*
║
║ *🟠${prefix}play <song name>*
║ *🟠${prefix}song <song name>*
║ *🟠${prefix}spotify <query>*
║ *🟠${prefix}instagram <link>*
║ *🟠${prefix}facebook <link>*
║ *🟠${prefix}tiktok <link>*
║ *🟠${prefix}video <song name>*
║ *🟠${prefix}ytmp4 <Link>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🧩MISC CMDS🧩*
║
║ *🟡${prefix}heart*
║ *🟡${prefix}horny*
║ *🟡${prefix}circle*
║ *🟡${prefix}lgbt*
║ *🟡${prefix}lolice*
║ *🟡${prefix}tonikawa*
║ *🟡${prefix}its-so-stupid*
║ *🟡${prefix}namecard*
║ *🟡${prefix}oogway*
║ *🟡${prefix}oogway2*
║ *🟡${prefix}tweet*
║ *🟡${prefix}ytcomment*
║ *🟡${prefix}comrade*
║ *🟡${prefix}gay* 
║ *🟡${prefix}glass* 
║ *🟡${prefix}jail*
║ *🟡${prefix}passed*
║ *🟡${prefix}triggered*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🦹‍♀️ANIME CMDS🦹‍♀️*
║
║ *🟣${prefix}nom* 
║ *🟣${prefix}poke* 
║ *🟣${prefix}cry* 
║ *🟣${prefix}kiss*
║ *🟣${prefix}pat* 
║ *🟣${prefix}hug*
║ *🟣${prefix}wink*
║ *🟣${prefix}facepalm*
║
╚═══════════════════╝

╔═══════════════════╗
║                   
║ *💻GITHUB CMDS💻*
║
║ *🔵${prefix}git*
║ *🔵${prefix}github*
║ *🔵${prefix}sc*
║ *🔵${prefix}script*
║ *🔵${prefix}repo*
║
╚═══════════════════╝

╔═══════════════════╗
║                        
║ *🌐GENERAL CMDS🌐*   
║                        
║ *🔸${prefix}help or ${prefix}menu*      
║ *🔸${prefix}ping*            
║ *🔸${prefix}alive*              
║ *🔸${prefix}tts <text>*          
║ *🔸${prefix}owner*               
║ *🔸${prefix}joke*                
║ *🔸${prefix}quote*               
║ *🔸${prefix}fact*                
║ *🔸${prefix}weather <city>*      
║ *🔸${prefix}news*                
║ *🔸${prefix}attp <text>*         
║ *🔸${prefix}lyrics <songtitle>*
║ *🔸${prefix}8ball <question>*    
║ *🔸${prefix}vv*                  
║ *🔸${prefix}trt <text> <lang>*  
║ *🔸${prefix}ss <link>*          
║ *🔸${prefix}url*        
║ *🔸${prefix}getjid* 
║                       
╚═══════════════════╝ 

    🟡 *Copyright wallyjaytech 2025* 🟡

*📊 Total Commands: ${totalCommands}*

*📊 Local Stats: ${stats.activeUsers} active now, ${stats.totalUsers} total users*

*${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}*

*✅ Reliable local tracking - No external API needed*

*⬇️Join our channel below for updates⬇️*`;

    try {
        // Try to send menu with random media (image or video)
        const menuSent = await sendMenu(sock, chatId, message, helpMessage, senderId);
        
        if (menuSent) {
            // Wait a bit then send audio if available
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sendMenuAudio(sock, chatId, message);
        } else {
            // Fallback: send as text only
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                mentions: [senderId],
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
        }

        console.log(`📊 Local Stats: ${stats.activeUsers} active, ${stats.totalUsers} total users (Platform: ${userPlatform})`);

    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { 
            text: helpMessage,
            mentions: [senderId],
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
    }
}

module.exports = helpCommand;
