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
 * Features: DM/Group toggle | Personality | Personal info
 * Professional Version
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const CHATBOT_DATA = path.join(__dirname, '../data/chatbot.json');

const PERSONAL_INFO = `You are Wally Jay, a real person chatting on WhatsApp. You're a 22-year-old developer born on March 26, 2004 in Ile Ife, Osun State, Nigeria. You're a bit tall and light-skinned. You study Pure and Applied Psychology at Adekunle Ajasin University (AAUA) in Akungba Akoko, Ondo State. You live at Permanent Site, Welder Street, Akungba. You attended JBL (Jesus the Bread of Life Academy) for junior secondary school in Ile Ife, and Oduduwa Modern College for senior secondary school also in Ile Ife. Your mom is Happy Rebecca, a fair trader. Your dad is Adeleke, a dark-skinned farmer, painter, and gold miner living in Ido, Ile Ife. You have an elder sister Opeyemi and three younger brothers: Amos, Peter, Ayo. Your girlfriend is Oyinkansola, nicknamed Beauty, CEO of Beauty Essentials, she's your course mate. Your best friends are Ifeoluwa (Anonymous), Sodiq (Young Cash), Winner, and Anne (Nwobodo). Only share these details when specifically asked. Never dump all info at once. Be casual and natural.`;

function loadChatbotData() {
    try {
        if (fs.existsSync(CHATBOT_DATA)) return JSON.parse(fs.readFileSync(CHATBOT_DATA, 'utf8'));
    } catch (e) {}
    return { dms: false, groups: false, chats: {} };
}

function saveChatbotData(data) {
    const dir = path.dirname(CHATBOT_DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHATBOT_DATA, JSON.stringify(data, null, 2));
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
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Only bot owner can use this\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot dms on
        if (subCommand === 'dms on') {
            data.dms = true;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Enabled for all DMs\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot dms off
        if (subCommand === 'dms off') {
            data.dms = false;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Disabled for all DMs\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot group on
        if (subCommand === 'group on' || subCommand === 'groups on') {
            data.groups = true;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Enabled for all groups\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot group off
        if (subCommand === 'group off' || subCommand === 'groups off') {
            data.groups = false;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Disabled for all groups\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot on (this chat)
        if (subCommand === 'on') {
            data.chats[chatId] = true;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ✅ Enabled for this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // .chatbot off (this chat)
        if (subCommand === 'off') {
            data.chats[chatId] = false;
            saveChatbotData(data);
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *CHATBOT* 」◆\n├\n├◇ ❌ Disabled for this chat\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // Show status
        const isGroup = chatId.endsWith('@g.us');
        const chatStatus = data.chats[chatId];
        const status = chatStatus === false ? '❌ Off (this chat)' : 
                      chatStatus === true ? '✅ On (this chat)' :
                      isGroup && data.groups ? '✅ On (all groups)' :
                      !isGroup && data.dms ? '✅ On (all DMs)' :
                      '❌ Off';
        
        return sock.sendMessage(chatId, {
            text: `╭──◆「 *CHATBOT STATUS* 」◆\n` +
                  `├\n` +
                  `├◇ *DMs:* ${data.dms ? '✅ On' : '❌ Off'}\n` +
                  `├◇ *Groups:* ${data.groups ? '✅ On' : '❌ Off'}\n` +
                  `├◇ *This Chat:* ${status}\n` +
                  `├\n` +
                  `├◇ *Commands:*\n` +
                  `├  └ .chatbot dms on/off\n` +
                  `├  └ .chatbot group on/off\n` +
                  `├  └ .chatbot on/off (this chat)\n` +
                  `├\n` +
                  `╰─┬─★─☆─♪♪─◆\n\n` +
                  `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                  `╰──★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (error) {
        console.error('Chatbot command error:', error.message);
    }
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    try {
        const data = loadChatbotData();
        const isGroup = chatId.endsWith('@g.us');
        
        // Check if chatbot should respond
        const chatSetting = data.chats[chatId];
        if (chatSetting === false) return; // Explicitly off for this chat
        if (chatSetting === true) { /* proceed */ }
        else if (isGroup && !data.groups) return;
        else if (!isGroup && !data.dms) return;

        // Ignore commands and bot's own messages
        if (userMessage.startsWith('.') || message.key.fromMe) return;

        const prompt = `${PERSONAL_INFO}\n\nYou're chatting casually on WhatsApp. Be short, natural, use emojis. Match the vibe. Only share personal info when asked. Don't sound like AI.\n\nMessage from ${isGroup ? 'group' : 'DM'}: ${userMessage}`;

        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'openai', messages: [{ role: 'user', content: prompt }] })
        });

        const result = await response.json();
        const reply = result.choices?.[0]?.message?.content;

        if (reply && reply.length > 2) {
            await sock.sendMessage(chatId, { text: reply.trim() }, { quoted: message });
        }

    } catch (error) {
        console.error('Chatbot response error:', error.message);
    }
}

module.exports = { chatbotCommand, handleChatbotResponse };
