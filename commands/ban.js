  const fs = require('fs');
const { channelInfo } = require('../lib/messageConfig');
const isOwnerOrSudo = require('../lib/isOwner');

async function banCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
    
    // Get owner information
    const settings = require('../settings');
    const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
    
    // ONLY allow the actual owner (you) - block everyone including sudo
    const isActuallyOwner = senderId === ownerJid || message.key.fromMe;
    
    if (!isActuallyOwner) {
        return await sock.sendMessage(chatId, { 
            text: '*❌ Ban command is exclusively for the bot owner only!*', 
            ...channelInfo 
        }, { quoted: message });
    }

    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: '*🟠Please mention the user or reply to their message to ban!🟠*', 
            ...channelInfo 
        });
        return;
    }

    // PREVENT BANNING THE OWNER - CRITICAL PROTECTION
    if (userToBan === ownerJid || userToBan === ownerJid.replace('@s.whatsapp.net', '@lid')) {
        await sock.sendMessage(chatId, { 
            text: '*🚫 CRITICAL ERROR: You cannot ban the bot owner! 🚫*', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    // Prevent banning the bot itself
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
            await sock.sendMessage(chatId, { text: '*😁You cannot ban the bot account😁.*', ...channelInfo }, { quoted: message });
            return;
        }
    } catch {}

    try {
        // Add user to banned list (global ban - works even if bot isn't admin)
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `*😁Successfully & globally banned @${userToBan.split('@')[0]}!😁*\n\n*Note:* User is banned from using the bot globally.`,
                mentions: [userToBan],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `*🥹${userToBan.split('@')[0]} is already banned!🥹*`,
                mentions: [userToBan],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { text: '*🥹Failed to ban user!🥹*', ...channelInfo });
    }
}

module.exports = banCommand;
