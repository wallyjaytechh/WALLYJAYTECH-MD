const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Function to dynamically count all commands from main.js (with alias grouping)
function countTotalCommands() {
    try {
        const mainJsPath = path.join(__dirname, '../main.js');
        const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Map to store command groups (main command -> aliases)
        const commandGroups = new Map();
        
        // Pattern to find case blocks and see which commands point to the same function
        const caseBlockPattern = /case\s+(?:userMessage\s*===?\s*['"`]\.([^'"`]+)['"`]|userMessage\s*\.startsWith\(\s*['"`]\.([^'"`]+)['"`]\s*\))[^}]+?await\s+(\w+Command)/gs;
        
        let match;
        while ((match = caseBlockPattern.exec(mainJsContent)) !== null) {
            const command = match[1] || match[2];
            const commandFunction = match[3];
            
            if (command && commandFunction) {
                if (!commandGroups.has(commandFunction)) {
                    commandGroups.set(commandFunction, new Set());
                }
                commandGroups.get(commandFunction).add(command);
            }
        }

        // Also look for multiple commands in single case statements (like .git, .github, etc.)
        const multiCommandPattern = /case\s+userMessage\s*===?\s*['"`]\.(git|github|sc|script|repo)['"`]/g;
        const gitCommands = new Set();
        let multiMatch;
        while ((multiMatch = multiCommandPattern.exec(mainJsContent)) !== null) {
            gitCommands.add(multiMatch[1]);
        }
        if (gitCommands.size > 0) {
            commandGroups.set('githubCommand', gitCommands);
        }

        // Count unique command functions (not individual aliases)
        let uniqueCommandCount = 0;
        
        commandGroups.forEach((aliases, commandFunction) => {
            console.log(`🔧 ${commandFunction}: ${Array.from(aliases).map(cmd => '.' + cmd).join(', ')}`);
            uniqueCommandCount++; // Count each function once, regardless of aliases
        });

        console.log(`🔍 Detected ${uniqueCommandCount} unique commands from ${commandGroups.size} command groups`);

        // If dynamic counting fails or gives unrealistic results, use fallback
        if (uniqueCommandCount < 50 || uniqueCommandCount > 500) {
            console.log('⚠️ Dynamic count seems off, using fallback');
            return countCommandsFromHelpMenu();
        }

        return uniqueCommandCount;

    } catch (error) {
        console.error('Error dynamically counting commands:', error);
        return countCommandsFromHelpMenu();
    }
}

// Fallback function to count from help menu structure (grouping aliases)
function countCommandsFromHelpMenu() {
    // Group commands by their actual function (aliases count as one)
    const commandGroups = {
        // GENERAL CMDS - each line is one unique command
        'help': ['help', 'menu', 'bot', 'list'],
        'ping': ['ping'],
        'alive': ['alive'],
        'tts': ['tts'],
        'owner': ['owner'],
        'joke': ['joke'],
        'quote': ['quote'],
        'fact': ['fact'],
        'weather': ['weather'],
        'news': ['news'],
        'attp': ['attp'],
        'lyrics': ['lyrics'],
        'eightBall': ['8ball'],
        'viewOnce': ['vv'],
        'translate': ['trt', 'translate'],
        'screenshot': ['ss', 'ssweb', 'screenshot'],
        'url': ['url', 'tourl'],
        'getjid': ['getjid'],
        
        // WHATSAPP CMDS
        'clear': ['clear'],
        
        // GROUP CMDS - each is one unique command
        'ban': ['ban'],
        'unban': ['unban'],
        'promote': ['promote'],
        'demote': ['demote'],
        'mute': ['mute'],
        'unmute': ['unmute'],
        'delete': ['delete', 'del'],
        'kick': ['kick'],
        'ship': ['ship'],
        'stupid': ['stupid', 'itssostupid', 'iss'],
        'warnings': ['warnings'],
        'warn': ['warn'],
        'antilink': ['antilink'],
        'antibadword': ['antibadword'],
        'groupinfo': ['groupinfo', 'infogp', 'infogrupo'],
        'staff': ['staff', 'admins', 'listadmin'],
        'jid': ['jid'],
        'tag': ['tag'],
        'tagall': ['tagall'],
        'tagnotadmin': ['tagnotadmin'],
        'hidetag': ['hidetag'],
        'chatbot': ['chatbot'],
        'resetlink': ['resetlink', 'revoke', 'anularlink'],
        'antitag': ['antitag'],
        'welcome': ['welcome'],
        'goodbye': ['goodbye'],
        'setGroupDescription': ['setgdesc'],
        'setGroupName': ['setgname'],
        'setGroupPhoto': ['setgpp'],
        
        // OWNER CMDS
        'mode': ['mode'],
        'clearSession': ['clearsession', 'clearsesi'],
        'antidelete': ['antidelete'],
        'tempfile': ['tempfile'],
        'clearTmp': ['cleartmp'],
        'update': ['update'],
        'sudo': ['sudo'],
        'settings': ['settings'],
        'setProfilePicture': ['setpp'],
        'autoreact': ['autoreact', 'areact', 'autoreaction'],
        'autostatus': ['autostatus'],
        'autotyping': ['autotyping'],
        'autoread': ['autoread'],
        'anticall': ['anticall'],
        'pmblocker': ['pmblocker'],
        'setMention': ['setmention'],
        'mention': ['mention'],
        
        // STICKER CMDS
        'blur': ['blur'],
        'simage': ['simage'],
        'sticker': ['sticker', 's'],
        'removebg': ['removebg', 'rmbg', 'nobg'],
        'remini': ['remini', 'enhance', 'upscale'],
        'stickercrop': ['crop'],
        'stickerTelegram': ['tg', 'stickertelegram', 'tgsticker', 'telesticker'],
        'meme': ['meme'],
        'take': ['take', 'steal'],
        'emojimix': ['emojimix', 'emix'],
        'igs': ['igs'],
        'igsc': ['igsc'],
        
        // PIES CMDS
        'pies': ['pies'],
        'china': ['china'],
        'indonesia': ['indonesia'],
        'japan': ['japan'],
        'korea': ['korea'],
        'hijab': ['hijab'],
        
        // GAME CMDS
        'tictactoe': ['ttt', 'tictactoe'],
        'hangman': ['hangman'],
        'guess': ['guess'],
        'trivia': ['trivia'],
        'answer': ['answer'],
        'truth': ['truth'],
        'dare': ['dare'],
        
        // AI CMDS
        'ai': ['gpt', 'gemini'],
        'imagine': ['imagine', 'flux', 'dalle'],
        'sora': ['sora'],
        
        // FUN CMDS
        'compliment': ['compliment'],
        'insult': ['insult'],
        'flirt': ['flirt'],
        'poet': ['poet', 'poetry'],
        'goodnight': ['goodnight', 'lovenight', 'gn'],
        'roseday': ['roseday'],
        'character': ['character'],
        'wasted': ['waste', 'wasted'],
        'simp': ['simp'],
        
        // EPHOTO CMDS (all textmaker are one function with different styles)
        'textmaker': [
            'metallic', 'ice', 'snow', 'impressive', 'matrix', 'light', 'neon', 
            'devil', 'purple', 'thunder', 'leaves', '1917', 'arena', 'hacker', 
            'sand', 'blackpink', 'glitch', 'fire'
        ],
        
        // DOWNLOAD CMDS
        'play': ['play'],
        'song': ['song', 'mp3', 'ytmp3'],
        'spotify': ['spotify'],
        'instagram': ['instagram', 'insta', 'ig'],
        'facebook': ['fb', 'facebook'],
        'tiktok': ['tiktok', 'tt'],
        'video': ['video', 'ytmp4'],
        
        // MISC CMDS (all handled by miscCommand function)
        'misc': [
            'heart', 'horny', 'circle', 'lgbt', 'lolice', 'tonikawa', 
            'its-so-stupid', 'namecard', 'oogway', 'oogway2', 'tweet', 
            'ytcomment', 'comrade', 'gay', 'glass', 'jail', 'passed', 'triggered'
        ],
        
        // ANIME CMDS (all handled by animeCommand function)
        'anime': [
            'nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 
            'facepalm', 'face-palm', 'animuquote', 'quote', 'loli'
        ],
        
        // GITHUB CMDS (all point to githubCommand)
        'github': ['git', 'github', 'sc', 'script', 'repo']
    };

    // Count unique command functions (not individual aliases)
    let uniqueCommandCount = 0;
    
    for (const commandFunction in commandGroups) {
        const aliases = commandGroups[commandFunction];
        console.log(`🔧 ${commandFunction}: ${aliases.map(cmd => '.' + cmd).join(', ')}`);
        uniqueCommandCount++;
    }

    console.log(`📊 Total unique commands: ${uniqueCommandCount}`);
    return uniqueCommandCount;
}

// Rest of the helpCommand function remains the same...
async function helpCommand(sock, chatId, message) {
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

    // Get total commands count - NOW WITH ALIAS GROUPING
    const totalCommands = countTotalCommands();
    
    const helpMessage = `
╔❖🔹 *WALLYJAYTECH-MD MENU* 🔹❖
║
║   *🤖 BotName: [ ${settings.botName || 'WALLYJAYTECH-MD'} ]*  
║   *🧠 Version: [ ${settings.version || '1.0.0'} ]*
║   *👤 BotOwner: [ ${settings.botOwner || 'Wally Jay Tech'} ]*
║   *📺 YT Channel: [ ${global.ytch} ]*
║   *📞 OwnerNumber: [ ${settings.ownerNumber} ]*
║   *📥 Prefix: [ ${settings.prefix} ]*
║   *🌍 TimeZone: [ ${settings.timezone} ]*
║   *💻 Mode: [ ${settings.commandMode} ]*
║   *📊 Total Commands: [ ${totalCommands} ]*
║   *📅 Date: [ ${getLocalizedTime()} ]*
║
╚═══════════════════╝

*⬇️ ALL COMMANDS ⬇️*

╔═══════════════════╗
║                        
║ *🌐GENERAL CMDS🌐*   
║                        
║ *🔸.help or .menu*      
║ *🔸.ping*            
║ *🔸.alive*              
║ *🔸.tts <text>*          
║ *🔸.owner*               
║ *🔸.joke*                
║ *🔸.quote*               
║ *🔸.fact*                
║ *🔸.weather <city>*      
║ *🔸.news*                
║ *🔸.attp <text>*         
║ *🔸.lyrics <songtitle>*
║ *🔸.8ball <question>*    
║ *🔸.vv*                  
║ *🔸.trt <text> <lang>*  
║ *🔸.ss <link>*          
║ *🔸.url*        
║ *🔸.getjid* 
║                       
╚═══════════════════╝ 

╔═══════════════════╗
║
║ *📩WHATSAPP CMDS📩*
║
║ *🟤.clear*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *👨‍👩‍👧‍👦GROUP CMDS👨‍👩‍👧‍👦*
║
║ *🔹.ban @user*
║ *🔹.unban @user*
║ *🔹.promote @user*
║ *🔹.demote @user*
║ *🔹.mute <minutes>*
║ *🔹.unmute*
║ *🔹.delete*
║ *🔹.kick @user*
║ *🔹.ship*
║ *🔹.stupid @user <text>*
║ *🔹.warnings @user*
║ *🔹.warn @user*
║ *🔹.antilink*
║ *🔹.antibadword*
║ *🔹.groupinfo*
║ *🔹.admins*
║ *🔹.jid*
║ *🔹.tag <message>*
║ *🔹.tagall*
║ *🔹.tagnotadmin*
║ *🔹.hidetag <message>*
║ *🔹.chatbot*
║ *🔹.resetlink*
║ *🔹.antitag <on/off>*
║ *🔹.welcome <on/off>*
║ *🔹.goodbye <on/off>*
║ *🔹.setgdesc <description>*
║ *🔹.setgname <new name>*
║ *🔹.setgpp (reply to image)*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🔒OWNER CMDS🔒*
║
║ *🔺.mode <public/private>*
║ *🔺.clearsession*
║ *🔺.antidelete*
║ *🔺.tempfile*
║ *🔺.cleartmp*
║ *🔺.update*
║ *🔺.sudo*
║ *🔺.settings*
║ *🔺.setpp <reply to image>*
║ *🔺.autoreact <on/off>*
║ *🔺.autostatus <on/off>*
║ *🔺.autostatus react <on/off>*
║ *🔺.autotyping <on/off>*
║ *🔺.autoread <on/off>*
║ *🔺.anticall <on/off>*
║ *🔺.pmblocker <on/off/status>*
║ *🔺.pmblocker setmsg <text>*
║ *🔺.setmention <reply to msg>*
║ *🔺.mention <on/off>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🎨STICKER CMDS🎨*
║
║ *🔻.blur <image>*
║ *🔻.simage <reply to sticker>*
║ *🔻.sticker <reply to img or vid>*
║ *🔻.removebg*
║ *🔻.remini*
║ *🔻.crop <reply to image>*
║ *🔻.tgsticker <Link>*
║ *🔻.meme*
║ *🔻.take <packname>*
║ *🔻.emojimix <emj1>+<emj2>*
║ *🔻.igs <insta link>*
║ *🔻.igsc <insta link>*
║
╚═══════════════════╝  

╔═══════════════════╗
║
║  *🖼️PIES CMDS🖼️*
║
║ *▫️.pies <country>*
║ *▫️.china*
║ *▫️.indonesia*
║ *▫️.japan*
║ *▫️.korea*
║ *▫️.hijab*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🎮GAME CMDS🎮*
║
║ *◾️.tictactoe @user*
║ *◾️.hangman*
║ *◾️.guess <letter for hangman>*
║ *◾️.trivia*
║ *◾️.answer <answer for trivia>*
║ *◾️.truth*
║ *◾️.dare*
║
╚═══════════════════╝

╔═══════════════════╗
║
║   *🧠AI CMDS🧠*
║
║ *♦️.gpt <question>*
║ *♦️.gemini <question>*
║ *♦️.imagine <prompt>*
║ *♦️.flux <prompt>*
║ *♦️.sora <prompt>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *😁FUN CMDS😁*
║
║ *🟢.compliment @user*
║ *🟢.insult @user*
║ *🟢.flirt*
║ *🟢.poet*
║ *🟢.goodnight*
║ *🟢.roseday*
║ *🟢.character @user*
║ *🟢.wasted @user*
║ *🟢.simp @user*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🔤EPHOTO CMDS🔤*
║
║ *🔴.metallic <text>*
║ *🔴.ice <text>*
║ *🔴.snow <text>*
║ *🔴.impressive <text>*
║ *🔴.matrix <text>*
║ *🔴.light <text>*
║ *🔴.neon <text>*
║ *🔴.devil <text>*
║ *🔴.purple <text>*
║ *🔴.thunder <text>*
║ *🔴.leaves <text>*
║ *🔴.1917 <text>*
║ *🔴.arena <text>*
║ *🔴.hacker <text>*
║ *🔴.sand <text>*
║ *🔴.blackpink <text>*
║ *🔴.glitch <text>*
║ *🔴.fire <text>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *📥DOWNLOAD CMDS📥*
║
║ *🟠.play <song name>*
║ *🟠.song <song name>*
║ *🟠.spotify <query>*
║ *🟠.instagram <link>*
║ *🟠.facebook <link>*
║ *🟠.tiktok <link>*
║ *🟠.video <song name>*
║ *🟠.ytmp4 <Link>*
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🧩MISC CMDS🧩*
║
║ *🟡.heart*
║ *🟡.horny*
║ *🟡.circle*
║ *🟡.lgbt*
║ *🟡.lolice*
║ *🟡.tonikawa*
║ *🟡.its-so-stupid*
║ *🟡.namecard*
║ *🟡.oogway*
║ *🟡.oogway2*
║ *🟡.tweet*
║ *🟡.ytcomment*
║ *🟡.comrade*
║ *🟡.gay* 
║ *🟡.glass* 
║ *🟡.jail*
║ *🟡.passed*
║ *🟡.triggered*
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🦹‍♀️ANIME CMDS🦹‍♀️*
║
║ *🟣.nom* 
║ *🟣.poke* 
║ *🟣.cry* 
║ *🟣.kiss*
║ *🟣.pat* 
║ *🟣.hug*
║ *🟣.wink*
║ *🟣.facepalm*
║
╚═══════════════════╝

╔═══════════════════╗
║                   
║ *💻GITHUB CMDS💻*
║
║ *🔵.git*
║ *🔵.github*
║ *🔵.sc*
║ *🔵.script*
║ *🔵.repo*
║
╚═══════════════════╝

    🟡 *Copyright wallyjaytech 2025* 🟡

*⬇️Join our channel below for updates⬇️*`;

    try {
        // 1. Send menu first (with all commands)
        const menuSent = await sendMenu(sock, chatId, message, helpMessage);
        
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


// Function to send the menu
async function sendMenu(sock, chatId, message, helpMessage) {
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
                console.log('✅ Menu sent as image');
                return true;
            } else if (selectedMedia.type === 'video') {
                await sock.sendMessage(chatId, {
                    video: mediaBuffer,
                    caption: selectedMedia.caption,
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
                console.log('✅ Menu sent as video');
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
                // Final fallback to text only
                await sock.sendMessage(chatId, { 
                    text: helpMessage,
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
