const settings = require('../settings');
const fs = require('fs');
const path = require('path');

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
