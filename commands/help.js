const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔❖🔹*WALLYJAYTECH-MD MENU*🔹❖
║
║   *🤖 BotName: ${settings.botName || 'WALLYJAYTECH-MD'}*  
║   *🧠 Version: ${settings.version || '1.0.0'}*
║   *👤 BotOwner: ${settings.botOwner || 'Wally Jay Tech'}*
║   *📺 YT Channel: ${global.ytch}*
║   *🕹 Mode: ${settings.commandMode}*
║   *📞 OwnerNumber: ${settings.ownerNumber}*
║
╚═══════════════════╝

*⬇️ ALL COMMANDS ⬇️*

╔═══════════════════╗
║
║ *🌐GENERAL CMDS🌐*
║
║ 🔸 .help or .menu
║ 🔸 .ping
║ 🔸 .alive
║ 🔸 .tts <text>
║ 🔸 .owner
║ 🔸 .joke
║ 🔸 .quote
║ 🔸 .fact
║ 🔸 .weather <city>
║ 🔸 .news
║ 🔸 .attp <text>
║ 🔸 .lyrics <song_title>
║ 🔸 .8ball <question>
║ 🔸 .groupinfo
║ 🔸 .admins 
║ 🔸 .vv
║ 🔸 .trt <text> <lang>
║ 🔸 .ss <link>
║ 🔸 .jid
║ 🔸 .url
║
╚═══════════════════╝ 

╔═══════════════════╗
║
║ *👨‍👩‍👧‍👦GROUP CMDS👨‍👩‍👧‍👦*
║
║ 🔹 .ban @user
║ 🔹 .unban @user
║ 🔹 .promote @user
║ 🔹 .demote @user
║ 🔹 .mute <minutes>
║ 🔹 .unmute
║ 🔹 .delete
║ 🔹 .kick @user
║ 🔹 .warnings @user
║ 🔹 .warn @user
║ 🔹 .antilink
║ 🔹 .antibadword
║ 🔹 .clear
║ 🔹 .tag <message>
║ 🔹 .tagall
║ 🔹 .tagnotadmin
║ 🔹 .hidetag <message>
║ 🔹 .chatbot
║ 🔹 .resetlink
║ 🔹 .antitag <on/off>
║ 🔹 .welcome <on/off>
║ 🔹 .goodbye <on/off>
║ 🔹 .setgdesc <description>
║ 🔹 .setgname <new name>
║ 🔹 .setgpp (reply to image)
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🔒OWNER CMDS🔒*
║
║ 🔺 .mode <public/private>
║ 🔺 .clearsession
║ 🔺 .antidelete
║ 🔺 .cleartmp
║ 🔺 .update
║ 🔺 .settings
║ 🔺 .setpp <reply to image>
║ 🔺 .autoreact <on/off>
║ 🔺 .autostatus <on/off>
║ 🔺 .autostatus react <on/off>
║ 🔺 .autotyping <on/off>
║ 🔺 .autoread <on/off>
║ 🔺 .anticall <on/off>
║ 🔺 .pmblocker <on/off/status>
║ 🔺 .pmblocker setmsg <text>
║ 🔺 .setmention <reply to msg>
║ 🔺 .mention <on/off>
║
╚═══════════════════╝

╔═══════════════════╗
║
║ *🎨STICKER CMDS🎨*
║
║ 🔻 .blur <image>
║ 🔻 .simage <reply to sticker>
║ 🔻 .sticker <reply to image>
║ 🔻 .removebg
║ 🔻 .remini
║ 🔻 .crop <reply to image>
║ 🔻 .tgsticker <Link>
║ 🔻 .meme
║ 🔻 .take <packname> 
║ 🔻 .emojimix <emj1>+<emj2>
║ 🔻 .igs <insta link>
║ 🔻 .igsc <insta link>
║
╚═══════════════════╝  

╔═══════════════════╗
║
║  *🖼️PIES CMDS🖼️*
║
║ ▫️ .pies <country>
║ ▫️ .china 
║ ▫️ .indonesia 
║ ▫️ .japan 
║ ▫️ .korea 
║ ▫️ .hijab
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *🎮GAME CMDS🎮*
║
║ ◾️ .tictactoe @user
║ ◾️ .hangman
║ ◾️ .guess <letter for hangman>
║ ◾️ .trivia
║ ◾️ .answer <answer for trivia>
║ ◾️ .truth
║ ◾️ .dare
║
╚═══════════════════╝

╔═══════════════════╗
║
║   *🧠AI CMDS🧠*
║
║ ♦️ .gpt <question>
║ ♦️ .gemini <question>
║ ♦️ .imagine <prompt>
║ ♦️ .flux <prompt>
║ ♦️ .sora <prompt>
║
╚═══════════════════╝

╔═══════════════════╗
║
║  *😁FUN CMDS😁*
║
║ 🟢 .compliment @user
║ 🟢 .insult @user
║ 🟢 .flirt 
║ 🟢 .shayari
║ 🟢 .goodnight
║ 🟢 .roseday
║ 🟢 .character @user
║ 🟢 .wasted @user
║ 🟢 .ship @user
║ 🟢 .simp @user
║ 🟢 .stupid @user [text]
║
╚═══════════════════╝

╔═══════════════════╗
🔤 *Textmaker*:
║ ➤ .metallic <text>
║ ➤ .ice <text>
║ ➤ .snow <text>
║ ➤ .impressive <text>
║ ➤ .matrix <text>
║ ➤ .light <text>
║ ➤ .neon <text>
║ ➤ .devil <text>
║ ➤ .purple <text>
║ ➤ .thunder <text>
║ ➤ .leaves <text>
║ ➤ .1917 <text>
║ ➤ .arena <text>
║ ➤ .hacker <text>
║ ➤ .sand <text>
║ ➤ .blackpink <text>
║ ➤ .glitch <text>
║ ➤ .fire <text>
╚═══════════════════╝

╔═══════════════════╗
📥 *Downloader*:
║ ➤ .play <song_name>
║ ➤ .song <song_name>
║ ➤ .spotify <query>
║ ➤ .instagram <link>
║ ➤ .facebook <link>
║ ➤ .tiktok <link>
║ ➤ .video <song name>
║ ➤ .ytmp4 <Link>
╚═══════════════════╝

╔═══════════════════╗
🧩 *MISC*:
║ ➤ .heart
║ ➤ .horny
║ ➤ .circle
║ ➤ .lgbt
║ ➤ .lolice
║ ➤ .its-so-stupid
║ ➤ .namecard 
║ ➤ .oogway
║ ➤ .tweet
║ ➤ .ytcomment 
║ ➤ .comrade 
║ ➤ .gay 
║ ➤ .glass 
║ ➤ .jail 
║ ➤ .passed 
║ ➤ .triggered
╚═══════════════════╝

╔═══════════════════╗
🖼️ *ANIME*:
║ ➤ .nom 
║ ➤ .poke 
║ ➤ .cry 
║ ➤ .kiss 
║ ➤ .pat 
║ ➤ .hug 
║ ➤ .wink 
║ ➤ .facepalm 
╚═══════════════════╝

╔═══════════════════╗
💻 *Github Commands:*
║ ➤ .git
║ ➤ .github
║ ➤ .sc
║ ➤ .script
║ ➤ .repo
╚═══════════════════╝

Join our channel for updates:`;

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
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'KnightBot MD',
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
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'KnightBot MD by Mr Unique Hacker',
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
