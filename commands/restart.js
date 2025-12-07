// commands/restart.js - Restart bot command
const fs = require('fs');
const path = require('path');

// Simple owner check
function isOwner(senderId) {
    try {
        const settings = require('../settings');
        const ownerNumber = settings.ownerNumber;
        
        if (!ownerNumber) return false;
        
        // Remove any non-digit characters and compare
        const cleanOwner = ownerNumber.replace(/\D/g, '');
        const cleanSender = senderId.replace(/\D/g, '').replace(/@s\.whatsapp\.net$/, '');
        
        return cleanSender.includes(cleanOwner) || cleanOwner.includes(cleanSender);
    } catch (error) {
        console.error('Error checking owner:', error);
        return false;
    }
}

async function execute(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Only owner can restart bot
        if (!isOwner(senderId) && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ Only bot owner can restart the bot!'
            }, { quoted: message });
            return;
        }
        
        const reason = args.join(' ') || 'Restart requested by owner';
        
        await sock.sendMessage(chatId, {
            text: '🔄 *RESTARTING BOT...*\n\n' +
                  `*Reason:* ${reason}\n` +
                  '*Time:* ' + new Date().toLocaleString() + '\n\n' +
                  '⏳ Please wait 10-15 seconds...'
        }, { quoted: message });
        
        // Log restart
        console.log(`🔄 Bot restart requested by ${senderId}: ${reason}`);
        
        // Delay to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Exit process - panel/PM2 will restart it
        process.exit(0);
        
    } catch (error) {
        console.error('Error in restart command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to restart bot. Please restart manually.'
        }, { quoted: message });
    }
}

// Export
module.exports = {
    execute,
    command: 'restart'
};
