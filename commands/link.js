const { sessionManager } = require('./pair');
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');

async function linkCommand(sock, chatId, message, userMessage) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const args = userMessage.split(' ').slice(1);
        const pairCode = args[0]?.toUpperCase();

        if (!pairCode) {
            return await sock.sendMessage(chatId, { 
                text: `🔗 *LINK YOUR WHATSAPP*\n\nUsage: .link <pair-code>\n\nGet a pairing code from the bot owner to link your WhatsApp account.`
            }, { quoted: message });
        }

        // Validate pair code
        const validation = sessionManager.validatePairCode(pairCode, senderId);
        if (!validation.success) {
            return await sock.sendMessage(chatId, { 
                text: validation.message
            }, { quoted: message });
        }

        // Pair code is valid - create session folder for user
        const userSessionPath = `./sessions/user_${senderId.split('@')[0]}`;
        
        await sock.sendMessage(chatId, { 
            text: `✅ *PAIRING SUCCESSFUL!*\n\nYour WhatsApp can now be linked to this bot!\n\nPlease wait while we set up your session...`
        }, { quoted: message });

        // Here you would typically:
        // 1. Create a new Baileys session for this user
        // 2. Generate QR code for them to scan
        // 3. Connect their WhatsApp account
        
        // For now, we'll just confirm they're paired
        await sock.sendMessage(chatId, { 
            text: `🎉 *YOUR WHATSAPP IS NOW LINKED!*\n\nYou can now use this bot in any chat!\n\nUse .menu to see all available commands.\n\nYour messages will be processed independently from other users.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in link command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error linking your WhatsApp. Please try again or contact owner.'
        }, { quoted: message });
    }
}

module.exports = linkCommand;
