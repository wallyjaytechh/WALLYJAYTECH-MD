const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');

async function unbanCommand(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
    
    // Get owner information
    const settings = require('../settings');
    const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
    
    // ONLY allow the actual owner (you) - block everyone including sudo
    const isActuallyOwner = senderId === ownerJid || message.key.fromMe;
    
    if (!isActuallyOwner) {
        return await sock.sendMessage(chatId, { 
            text: '*❌ Unban command is exclusively for the bot owner only!*', 
            ...channelInfo 
        }, { quoted: message });
    }

    let userToUnban;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: '*🟣Please mention the user or reply to their message to unban!🟣*', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `*🟣Successfully unbanned @${userToUnban.split('@')[0]}!🟣*\n\n*Note:* User can now use the bot again globally.`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `*🥹${userToUnban.split('@')[0]} is not banned!🥹*`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('*🥹Error in unban command:*🥹', error);
        await sock.sendMessage(chatId, { text: 'Failed to unban user!', ...channelInfo }, { quoted: message });
    }
}

module.exports = unbanCommand;
