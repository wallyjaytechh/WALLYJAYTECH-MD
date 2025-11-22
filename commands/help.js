const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔❖🔹*WALLYJAYTECH-MD MENU*🔹❖
║
║   *🤖 BotName: [ ${settings.botName || 'WALLYJAYTECH-MD'} ]*  
║   *🧠 Version: [ ${settings.version || '1.0.0'} ]*
║   *👤 BotOwner: [ ${settings.botOwner || 'Wally Jay Tech'} ]*
║   *📺 YT Channel: [ ${global.ytch} ]*
║   *📞 OwnerNumber: [ ${settings.ownerNumber} ]*
║   *📥 Prefix: [ ${settings.prefix} ]*
║   *🌍 TimeZone: [ ${settings.timezone} ]*
║   *💻 Mode: [ ${settings.commandMode} ]*
║   *📅 Date: [ ${new Date().toLocaleString()} ]*
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
║ *🔹.warnings @user*
║ *🔹.warn @user*
║ *🔹.antilink*
║ *🔹.antibadword*
║ *🔹.groupinfo*
║ *🔹.admins*
║ *🔹.jid*
║ *🔹.clear*
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
║ *🔺.cleartmp*
║ *🔺.update*
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
║ *🔻.sticker <reply to image>*
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
║ *🟢.stupid @user <text>*
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
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
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
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
