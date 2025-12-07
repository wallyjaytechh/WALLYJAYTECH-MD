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

// Format time using bot's timezone from settings (NO HARCODED FALLBACK)
function formatBotTime() {
    try {
        const settings = require('../settings');
        const timezone = settings.timezone; // Get from their settings
        
        if (!timezone) {
            // If no timezone in settings, use UTC
            return new Date().toISOString() + ' (UTC)';
        }
        
        // Try using moment-timezone if available
        try {
            const moment = require('moment-timezone');
            if (moment.tz.zone(timezone)) {
                return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
            } else {
                // Invalid timezone in settings
                return new Date().toISOString() + ` (Invalid timezone: ${timezone})`;
            }
        } catch (e) {
            // Fallback to native Date formatting
            try {
                return new Date().toLocaleString('en-US', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
            } catch (error) {
                // Invalid timezone
                return new Date().toISOString() + ` (Invalid timezone: ${timezone})`;
            }
        }
    } catch (error) {
        // Ultimate fallback
        return new Date().toISOString() + ' (UTC)';
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
        const settings = require('../settings');
        const botTime = formatBotTime();
        
        // Build message
        let restartMessage = '🔄 *RESTARTING BOT...*\n\n' +
                           `*Reason:* ${reason}\n` +
                           `*Bot Time:* ${botTime}\n`;
        
        // Add timezone info only if it exists in settings
        if (settings.timezone) {
            restartMessage += `*Bot Timezone:* ${settings.timezone}\n\n`;
        } else {
            restartMessage += '*Bot Timezone:* Not set in settings.js\n\n';
        }
        
        restartMessage += '⏳ Please wait 10-15 seconds for bot to reconnect...\n' +
                         '✅ Bot will auto-reconnect after restart';
        
        await sock.sendMessage(chatId, { text: restartMessage }, { quoted: message });
        
        // Log restart
        console.log(`🔄 Bot restart requested by ${senderId}: ${reason}`);
        console.log(`🕒 Server time: ${new Date().toISOString()}`);
        if (settings.timezone) {
            console.log(`🌐 Bot timezone from settings: ${settings.timezone}`);
        }
        
        // Clear require cache for settings.js
        delete require.cache[require.resolve('../settings')];
        
        // Delay to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Exit process
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
