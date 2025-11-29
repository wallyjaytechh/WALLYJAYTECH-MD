const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Platform detection function
function getDeploymentPlatform() {
    if (process.env.RENDER) {
        return 'Render';
    } else if (process.env.CODESPACE_NAME) {
        return 'Codespaces';
    } else if (process.env.PANEL_APP) {
        return 'Panel';
    } else {
        return 'Local Machine';
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

// Track active users
function getActiveUsersStats() {
    try {
        const activeUsersPath = path.join(__dirname, '../data/activeUsers.json');
        
        if (!fs.existsSync(activeUsersPath)) {
            return {
                active: 0,
                total: 0,
                platforms: {}
            };
        }
        
        const data = JSON.parse(fs.readFileSync(activeUsersPath, 'utf8'));
        
        const now = Date.now();
        const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
        
        const activeUsers = Object.values(data.users || {}).filter(user => 
            user.lastActive > twentyFourHoursAgo
        ).length;
        
        return {
            active: activeUsers,
            total: Object.keys(data.users || {}).length,
            platforms: data.platforms || {}
        };
    } catch (error) {
        console.error('Error getting active users stats:', error);
        return {
            active: 0,
            total: 0,
            platforms: {}
        };
    }
}

// Update user activity
function updateUserActivity(userId, platform) {
    try {
        const activeUsersPath = path.join(__dirname, '../data/activeUsers.json');
        let data = { users: {}, platforms: {} };
        
        if (fs.existsSync(activeUsersPath)) {
            data = JSON.parse(fs.readFileSync(activeUsersPath, 'utf8'));
        }
        
        data.users[userId] = {
            lastActive: Date.now(),
            firstSeen: data.users[userId]?.firstSeen || Date.now()
        };
        
        if (platform) {
            data.platforms[platform] = (data.platforms[platform] || 0) + 1;
        }
        
        const dataDir = path.dirname(activeUsersPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(activeUsersPath, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error updating user activity:', error);
    }
}

// Get platform emoji
function getPlatformEmoji(platform) {
    const platformEmojis = {
        'Render': '☁️',
        'Codespaces': '💻', 
        'Panel': '🛠️',
        'Local Machine': '🏠',
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
        const commands = new Set();
        
        const switchCaseBlock = extractSwitchCaseBlock(mainJsContent);
        
        if (!switchCaseBlock) {
            return 157;
        }
        
        const casePattern = /case\s+(?:userMessage\s*===?\s*['"`]\.([^'"`]+)['"`]|userMessage\s*\.startsWith\(\s*['"`]\.([^'"`]+)['"`]\s*\)|userMessage\s*\.includes\(\s*['"`]\.([^'"`]+)['"`]\s*\)|userMessage\s*\.match\(\s*['"`]\.([^'"`]+)['"`]\s*\))/g;
        
        let match;
        while ((match = casePattern.exec(switchCaseBlock)) !== null) {
            for (let i = 1; i <= 4; i++) {
                if (match[i] && match[i].trim()) {
                    const command = match[i].trim();
                    commands.add(command);
                }
            }
        }
        
        const totalCount = commands.size;
        console.log(`🔄 Dynamic scan found ${totalCount} commands`);
        
        return totalCount;
        
    } catch (error) {
        console.error('Error counting commands:', error);
        return 157;
    }
}

// Extract switch case block
function extractSwitchCaseBlock(content) {
    const switchStart = content.indexOf('switch (true) {');
    if (switchStart === -1) return null;
    
    let braceCount = 0;
    let inSwitch = false;
    let switchContent = '';
    
    for (let i = switchStart; i < content.length; i++) {
        const char = content[i];
        
        if (char === '{') {
            braceCount++;
            inSwitch = true;
        } else if (char === '}') {
            braceCount--;
        }
        
        if (inSwitch) {
            switchContent += char;
        }
        
        if (inSwitch && braceCount === 0) {
            break;
        }
    }
    
    return switchContent;
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
    updateUserActivity(senderId, userPlatform);
    const userStats = getActiveUsersStats();
    
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
    
    const platformStatsText = Object.entries(userStats.platforms)
        .map(([platform, count]) => `║     ${getPlatformEmoji(platform)} ${platform}: ${count}`)
        .join('\n') || '║     📊 No data yet';
    
    const helpMessage = `
👋 *Hello @${userName}!* ${greeting.message}

${greeting.greeting}! Here's your menu:

╔❖🔹 *WALLYJAYTECH-MD MENU* 🔹❖
║
║   *👤 User: [ @${userName} ]*
║   *🤖 BotName: [ ${settings.botName || 'WALLYJAYTECH-MD'} ]*  
║   *🧠 Version: [ ${settings.version || '1.0.0'} ]*
║   *👑 BotOwner: [ ${settings.botOwner || 'Wally Jay Tech'} ]*
║   *📺 YT Channel: [ ${global.ytch} ]*
║   *📞 OwnerNumber: [ ${settings.ownerNumber} ]*
║   *📥 Prefix: [ ${prefix} ]*
║   *🌍 TimeZone: [ ${settings.timezone} ]*
║   *⏰ Current Time: [ ${greeting.time} ]*
║   *${dayInfo.emoji} Day: [ ${dayInfo.day} ]*
║   *💻 Bot Mode: [ ${currentBotMode} ]*
║   *📊 Total Commands: [ ${totalCommands} ]*
║   *📅 FullDate: [ ${getLocalizedTime()} ]*
║   *📡 Deployed Platform: [ ${getDeploymentPlatform()} ]*
║   *👥 Active Users (24h): [ ${userStats.active} ]*
║   *📊 Total Users: [ ${userStats.total} ]*
║   *🌐 Deployment Platforms:*
${platformStatsText}
║
╚═══════════════════╝

*⬇️ ALL COMMANDS ⬇️*

╔═══════════════════╗
║
║  *🔒OWNER CMDS🔒*
║
║ *🔺${prefix}autobio*
║ *🔺${prefix}mode <public/private>*
║ *🔺${prefix}unavailable*
║ *🔺${prefix}autorecord*
║ *🔺${prefix}autotyping*
║ *🔺${prefix}autorecordtype*
║ *🔺${prefix}autostatus <on/off>*
║ *🔺${prefix}autoreact <on/off>*
║ *🔺${prefix}autostatus react <on/off>*
║ *🔺${prefix}autoread <on/off>*
║ *🔺${prefix}antiforeign*
║ *🔺${prefix}clearsession*
║ *🔺${prefix}antidelete*
║ *🔺${prefix}tempfile*
║ *🔺${prefix}cleartmp*
║ *🔺${prefix}update*
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
║ *📩WHATSAPP CMDS📩*
║
║ *🟤${prefix}clear*
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

*${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}*

*⬇️Join our channel below for updates⬇️*`;

    try {
        const menuSent = await sendMenu(sock, chatId, message, helpMessage, senderId);
        
        if (menuSent) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sendMenuAudio(sock, chatId, message);
        }

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

// Send menu with media
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

module.exports = helpCommand;
