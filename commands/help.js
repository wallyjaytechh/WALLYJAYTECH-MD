const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// ADD THIS PLATFORM DETECTION FUNCTION
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

// 🔥 NEW: FUNCTION TO GET PREFIX FROM SETTINGS
function getPrefix() {
    return settings.prefix || '.'; // Use settings prefix, fallback to '.'
}

// 🔥 NEW: FUNCTION TO DETECT BOT MODE (PUBLIC/PRIVATE)
function getBotMode() {
    try {
        const messageCountPath = path.join(__dirname, '../data/messageCount.json');
        
        if (fs.existsSync(messageCountPath)) {
            const data = JSON.parse(fs.readFileSync(messageCountPath, 'utf8'));
            
            if (typeof data.isPublic === 'boolean') {
                return data.isPublic ? 'PUBLIC 🌐' : 'PRIVATE 🔒';
            }
        }
        
        // Fallback to settings
        return settings.commandMode === 'public' ? 'PUBLIC 🌐' : 'PRIVATE 🔒';
    } catch (error) {
        console.error('Error detecting bot mode:', error);
        return 'PUBLIC 🌐'; // Default fallback
    }
}

// 🔥 NEW: TIME-BASED GREETINGS FUNCTION
function getTimeBasedGreeting() {
    try {
        const now = new Date();
        const timezone = settings.timezone || 'Africa/Lagos';
        
        // Format time in the bot's timezone
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
        // Fallback if timezone detection fails
        return {
            greeting: '👋 Hello',
            emoji: '👋',
            time: new Date().toLocaleTimeString(),
            message: 'Nice to see you!'
        };
    }
}

// 🔥 NEW: GET DAY OF WEEK WITH EMOJI
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

// 🔥 NEW: FUNCTION TO GET USER NAME
async function getUserName(sock, userId, message) {
    try {
        // Try to get the user's name from the message
        const pushName = message.pushName || message.key?.pushName;
        if (pushName) {
            return pushName;
        }
        
        // Try to get from sock (WhatsApp API)
        const name = await sock.getName(userId);
        if (name && name !== userId) {
            return name;
        }
        
        // Fallback: use the phone number without @s.whatsapp.net
        return userId.split('@')[0] || 'User';
    } catch (error) {
        console.error('Error getting user name:', error);
        return userId.split('@')[0] || 'User';
    }
}

// Function to dynamically scan main.js and count ALL commands from switch cases
function countTotalCommands() {
    try {
        const mainJsPath = path.join(__dirname, '../main.js');
        
        if (!fs.existsSync(mainJsPath)) {
            console.log('❌ main.js not found, using fallback count');
            return 157;
        }
        
        const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        const commands = new Set();
        
        // Extract the main switch case block
        const switchCaseBlock = extractSwitchCaseBlock(mainJsContent);
        
        if (!switchCaseBlock) {
            console.log('❌ Could not find switch case block, using fallback');
            return 157;
        }
        
        // Pattern to match ALL case statements in the switch block
        const casePattern = /case\s+(?:userMessage\s*===?\s*['"`]\.([^'"`]+)['"`]|userMessage\s*\.startsWith\(\s*['"`]\.([^'"`]+)['"`]\s*\)|userMessage\s*\.includes\(\s*['"`]\.([^'"`]+)['"`]\s*\)|userMessage\s*\.match\(\s*['"`]\.([^'"`]+)['"`]\s*\))/g;
        
        let match;
        while ((match = casePattern.exec(switchCaseBlock)) !== null) {
            // Check all capture groups (1-4) for command matches
            for (let i = 1; i <= 4; i++) {
                if (match[i] && match[i].trim()) {
                    const command = match[i].trim();
                    commands.add(command);
                }
            }
        }
        
        // Also look for command arrays
        const arrayPatterns = [
            /adminCommands\s*=\s*\[([^\]]+)\]/g,
            /ownerCommands\s*=\s*\[([^\]]+)\]/g,
            /const\s+\w+Commands\s*=\s*\[([^\]]+)\]/g
        ];
        
        arrayPatterns.forEach(pattern => {
            let arrayMatch;
            while ((arrayMatch = pattern.exec(mainJsContent)) !== null) {
                if (arrayMatch[1]) {
                    const arrayCommands = arrayMatch[1].split(',')
                        .map(cmd => cmd.trim().replace(/['"`]/g, ''))
                        .filter(cmd => cmd && cmd.startsWith('.'));
                    
                    arrayCommands.forEach(cmd => {
                        const cleanCmd = cmd.replace(/^\./, '').trim();
                        if (cleanCmd) commands.add(cleanCmd);
                    });
                }
            }
        });
        
        const totalCount = commands.size;
        console.log(`🔄 Dynamic scan found ${totalCount} commands in main.js`);
        
        // Log some commands for verification
        const commandArray = Array.from(commands).sort();
        console.log(`📋 Sample commands: ${commandArray.slice(0, 10).join(', ')}${commandArray.length > 10 ? '...' : ''}`);
        
        return totalCount;
        
    } catch (error) {
        console.error('❌ Error dynamically scanning commands:', error);
        return 157; // Fallback count
    }
}

// Helper function to extract the main switch case block
function extractSwitchCaseBlock(content) {
    // Look for the main switch statement
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

async function helpCommand(sock, chatId, message) {
    // 🔥 NEW: Get user information
    const senderId = message.key.participant || message.key.remoteJid;
    const userName = await getUserName(sock, senderId, message);
    
    // 🔥 NEW: Get time-based greeting and day info
    const greeting = getTimeBasedGreeting();
    const dayInfo = getDayWithEmoji();
    
    // 🔥 NEW: Get ACTUAL bot mode (public/private)
    const currentBotMode = getBotMode();
    
    // 🔥 NEW: Get prefix from settings
    const prefix = getPrefix();
    
    // Get time based on settings timezone
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
            // Fallback if timezone is invalid
            return new Date().toLocaleString();
        }
    };

    // Get total commands count - DYNAMIC SCAN from main.js
    const totalCommands = countTotalCommands();
    
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
║ *🔺${prefix}clearsession*
║ *🔺${prefix}antidelete*
║ *🔺${prefix}tempfile*
║ *🔺${prefix}cleartmp*
║ *🔺${prefix}update*
║ *🔺${prefix}sudo*
║ *🔺${prefix}settings*
║ *🔺${prefix}setpp <reply to image>*
║ *🔺${prefix}autoreact <on/off>*
║ *🔺${prefix}autostatus react <on/off>*
║ *🔺${prefix}autoread <on/off>*
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
║ *◾️${prefix}connect4 @user*
║ *◾️${prefix}drop 1-7*
║ *◾️${prefix}accept*
║ *◾️${prefix}surrender*
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
        // 1. Send menu first (with all commands) - WITH MENTION
        const menuSent = await sendMenu(sock, chatId, message, helpMessage, senderId);
        
        if (menuSent) {
            // 2. Add a small delay before audio
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. Send audio LAST
            await sendMenuAudio(sock, chatId, message);
        }

    } catch (error) {
        console.error('Error in help command:', error);
        // Fallback to text only if everything fails
        await sock.sendMessage(chatId, { 
            text: helpMessage,
            mentions: [senderId], // Mention the user
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

// 🔥 UPDATED: Function to send the menu WITH MENTION
async function sendMenu(sock, chatId, message, helpMessage, userId) {
    try {
        // Define media options - randomly choose between image and video
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

        // Randomly select media type (50% image, 50% video)
        const selectedMedia = mediaOptions[Math.floor(Math.random() * mediaOptions.length)];
        
        console.log(`🎲 Selected media type: ${selectedMedia.type}`);
        
        if (fs.existsSync(selectedMedia.path)) {
            const mediaBuffer = fs.readFileSync(selectedMedia.path);
            
            if (selectedMedia.type === 'image') {
                await sock.sendMessage(chatId, {
                    image: mediaBuffer,
                    caption: selectedMedia.caption,
                    mentions: [userId], // 🔥 MENTION THE USER
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
                    mentions: [userId], // 🔥 MENTION THE USER
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
            // If selected media doesn't exist, fallback to image
            console.log(`❌ ${selectedMedia.type} not found, using image fallback`);
            const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
            
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: helpMessage,
                    mentions: [userId], // 🔥 MENTION THE USER
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
                return true;
            } else {
                // Final fallback to text only WITH MENTION
                await sock.sendMessage(chatId, { 
                    text: helpMessage,
                    mentions: [userId], // 🔥 MENTION THE USER
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
        }
    } catch (error) {
        console.error('Error sending menu:', error);
        return false;
    }
}

// Function to send menu audio (LAST)
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
            console.log('🎵 Menu audio sent LAST');
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
