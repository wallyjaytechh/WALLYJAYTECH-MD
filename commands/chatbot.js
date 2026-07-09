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
/**
 * WALLYJAYTECH-MD - Chatbot Command (.chatbot)
 * Powered by Pollinations GPT — Free, Fast, Unlimited
 * Features: DM/Group/Status toggle | Typing indicator | Usage guide
 * Professional Version
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const CHATBOT_DATA = path.join(__dirname, '../data/chatbot.json');

function loadChatbotData() {
    try {
        if (fs.existsSync(CHATBOT_DATA)) return JSON.parse(fs.readFileSync(CHATBOT_DATA, 'utf8'));
    } catch (e) {}
    return { dms: false, groups: false, status: false, chats: {} };
}

function saveChatbotData(data) {
    const dir = path.dirname(CHATBOT_DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHATBOT_DATA, JSON.stringify(data, null, 2));
}

function reply(sock, chatId, msg, quoted) {
    return sock.sendMessage(chatId, { text: msg }, { quoted });
}

async function chatbotCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = message.key.fromMe || senderId === botNumber;
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        const subCommand = args.join(' ').toLowerCase().trim();
        const data = loadChatbotData();

        if (!isOwner) {
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Only bot owner\n├◇ can use this\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot usage / help
        if (subCommand === 'usage' || subCommand === 'help') {
            return reply(sock, chatId, `╭──◆「 *CHATBOT USAGE* 」◆\n` +
                  `├\n` +
                  `├◇ .chatbot dms on\n` +
                  `├  └ Enable auto-reply\n` +
                  `├     in all private chats\n` +
                  `├\n` +
                  `├◇ .chatbot dms off\n` +
                  `├  └ Disable auto-reply\n` +
                  `├     in all private chats\n` +
                  `├\n` +
                  `├◇ .chatbot group on\n` +
                  `├  └ Enable auto-reply\n` +
                  `├     in all groups\n` +
                  `├\n` +
                  `├◇ .chatbot group off\n` +
                  `├  └ Disable auto-reply\n` +
                  `├     in all groups\n` +
                  `├\n` +
                  `├◇ .chatbot status on\n` +
                  `├  └ Reply to status\n` +
                  `├     captions\n` +
                  `├\n` +
                  `├◇ .chatbot status off\n` +
                  `├  └ Don't reply to\n` +
                  `├     status captions\n` +
                  `├\n` +
                  `├◇ .chatbot on\n` +
                  `├  └ Enable for this\n` +
                  `├     chat only\n` +
                  `├\n` +
                  `├◇ .chatbot off\n` +
                  `├  └ Disable for this\n` +
                  `├     chat only\n` +
                  `├\n` +
                  `├◇ .chatbot\n` +
                  `├  └ Show current\n` +
                  `├     settings\n` +
                  `├\n` +
                  `├◇ .chatbot usage\n` +
                  `├  └ Show this guide\n` +
                  `├\n` +
                  `╰─┬─★─☆─♪♪─◆\n\n` +
                  `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                  `╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot dms on
        if (subCommand === 'dms on') {
            if (data.dms) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ DMs are\n├◇ already ON\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.dms = true;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ DMs enabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot dms off
        if (subCommand === 'dms off') {
            if (!data.dms) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ DMs are\n├◇ already OFF\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.dms = false;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ DMs disabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot group on
        if (subCommand === 'group on' || subCommand === 'groups on') {
            if (data.groups) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Groups are\n├◇ already ON\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.groups = true;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Groups enabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot group off
        if (subCommand === 'group off' || subCommand === 'groups off') {
            if (!data.groups) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Groups are\n├◇ already OFF\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.groups = false;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Groups disabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot status on
        if (subCommand === 'status on') {
            if (data.status) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Status replies\n├◇ are already ON\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.status = true;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Status replies\n├◇ enabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot status off
        if (subCommand === 'status off') {
            if (!data.status) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Status replies\n├◇ are already OFF\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.status = false;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Status replies\n├◇ disabled\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot on (this chat)
        if (subCommand === 'on') {
            if (data.chats[chatId] === true) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Already ON\n├◇ for this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.chats[chatId] = true;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Enabled for\n├◇ this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // .chatbot off (this chat)
        if (subCommand === 'off') {
            if (data.chats[chatId] === false) {
                return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ⚠️ Already OFF\n├◇ for this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
            }
            data.chats[chatId] = false;
            saveChatbotData(data);
            return reply(sock, chatId, `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Disabled for\n├◇ this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`, message);
        }

        // Show status
        const isGroup = chatId.endsWith('@g.us');
        const chatStatus = data.chats[chatId];
        const currentStatus = chatStatus === false ? '❌ Off (this chat)' : 
                      chatStatus === true ? '✅ On (this chat)' :
                      isGroup && data.groups ? '✅ On (all groups)' :
                      !isGroup && data.dms ? '✅ On (all DMs)' :
                      '❌ Off';
        
        return reply(sock, chatId, `╭──◆「 *CHATBOT STATUS* 」◆\n` +
              `├\n` +
              `├◇ *DMs:* ${data.dms ? '✅ On' : '❌ Off'}\n` +
              `├◇ *Groups:* ${data.groups ? '✅ On' : '❌ Off'}\n` +
              `├◇ *Status:* ${data.status ? '✅ On' : '❌ Off'}\n` +
              `├◇ *This Chat:* ${currentStatus}\n` +
              `├\n` +
              `├◇ *Commands:*\n` +
              `├  └ .chatbot dms on/off\n` +
              `├  └ .chatbot group on/off\n` +
              `├  └ .chatbot status on/off\n` +
              `├  └ .chatbot on/off\n` +
              `├  └ .chatbot usage\n` +
              `├\n` +
              `╰─┬─★─☆─♪♪─◆\n\n` +
              `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
              `╰──★─☆─♪♪─◆`, message);

    } catch (error) {
        console.error('Chatbot command error:', error.message);
    }
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    try {
        if (chatId === 'status@broadcast') {
            const data = loadChatbotData();
            if (!data.status) return;
        }
        
        const data = loadChatbotData();
        const isGroup = chatId.endsWith('@g.us');
        
        const chatSetting = data.chats[chatId];
        if (chatSetting === false) return;
        if (chatSetting === true) { /* proceed */ }
        else if (isGroup && !data.groups) return;
        else if (!isGroup && !data.dms) return;

        if (userMessage.startsWith('.') || message.key.fromMe) return;

        const prompt = `You are a friendly WhatsApp user chatting casually. Be short, natural, use emojis. Match the vibe. Don't sound like AI, talk like a real person. Never use double asterisks ** for formatting — only use single *asterisk* for bold.\n\nMessage from ${isGroup ? 'group' : 'DM'}: ${userMessage}`;

        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'openai', messages: [{ role: 'user', content: prompt }] })
        });

        // Stop typing
        await sock.sendPresenceUpdate('paused', chatId);

        const result = await response.json();
        let replyText = result.choices?.[0]?.message?.content;

        if (replyText && replyText.length > 2) {
            replyText = replyText.replace(/\*\*/g, '*');
            await sock.sendMessage(chatId, { text: replyText.trim() }, { quoted: message });
        }

    } catch (error) {
        console.error('Chatbot response error:', error.message);
    }
}

module.exports = { chatbotCommand, handleChatbotResponse };
