// commands/wallyjaytech.js
// WALLYJAYTECH-MD Bot Configuration Commands (OWNER ONLY)

const fs = require('fs');
const path = require('path');

// Function to check if user is EXACTLY the owner (not sudo, not public)
function isExactOwner(sock, userId, message) {
    try {
        const settings = require('../settings');
        const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, '');
        const userNumber = userId.split('@')[0].replace(/[^0-9]/g, '');
        
        // Check if user is exactly the owner number (no sudo allowed!)
        const isOwner = userNumber === ownerNumber;
        
        // Also allow if message is from bot itself
        const isBotSelf = message.key.fromMe;
        
        return isOwner || isBotSelf;
    } catch (error) {
        console.error('Error checking exact owner:', error);
        return false;
    }
}

// Function to update settings.js file
function updateSettings(settingKey, settingValue) {
    try {
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        console.log(`📝 Updating ${settingKey} to: ${settingValue}`);
        
        // Handle string values (add quotes)
        let newValue;
        if (typeof settingValue === 'boolean') {
            newValue = settingValue;
        } else if (typeof settingValue === 'number') {
            newValue = settingValue;
        } else {
            newValue = `'${settingValue.replace(/'/g, "\\'")}'`;
        }
        
        // Pattern to find: "settingKey: 'value'" or "settingKey: "value""
        const pattern = new RegExp(`(${settingKey}:\\s*)(['"][^'"]*['"]|[^,\\n}]+)`, 'g');
        
        if (settingsContent.match(pattern)) {
            settingsContent = settingsContent.replace(pattern, `$1${newValue}`);
            console.log(`✅ Updated ${settingKey} in settings.js`);
        } else {
            // If setting doesn't exist, add it before the last }
            const lastComma = settingsContent.lastIndexOf(',');
            settingsContent = settingsContent.substring(0, lastComma + 1) + 
                             `\n  ${settingKey}: ${newValue}` + 
                             settingsContent.substring(lastComma + 1);
            console.log(`➕ Added ${settingKey} to settings.js`);
        }
        
        // Save the file
        fs.writeFileSync(settingsPath, settingsContent, 'utf8');
        
        // Clear cache
        delete require.cache[require.resolve('../settings')];
        
        return true;
    } catch (error) {
        console.error(`❌ Error updating ${settingKey}:`, error);
        return false;
    }
}

// Get current setting
function getSetting(settingKey) {
    try {
        const settings = require('../settings');
        return settings[settingKey] || 'Not set';
    } catch (error) {
        return 'Error';
    }
}

// Command: Set Bot Name
async function setBotNameCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // STRICT CHECK: Only exact owner can use this
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.\nSudo users are NOT allowed.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('botName');
            await sock.sendMessage(chatId, { 
                text: `🤖 *Current Bot Name:* ${current}\n\n*Usage:* .setbotname <new name>\n*Example:* .setbotname WALLY-MD PRO\n\n⚠️ Bot will auto-restart after changes.` 
            }, { quoted: message });
            return;
        }
        
        const newName = args.join(' ').trim();
        if (newName.length < 2) {
            await sock.sendMessage(chatId, { 
                text: '❌ Bot name must be at least 2 characters.' 
            }, { quoted: message });
            return;
        }
        
        const success = updateSettings('botName', newName);
        
        if (success) {
            await sock.sendMessage(chatId, { 
                text: `✅ *BOT NAME UPDATED!*\n\n📛 *Old:* ${getSetting('botName')}\n📛 *New:* ${newName}\n\n🔄 Bot will auto-restart to apply changes...` 
            }, { quoted: message });
            
            // Auto-restart after 3 seconds
            setTimeout(() => {
                console.log('🔄 Restarting bot after name change...');
                process.exit(1); // Exit with code 1 to trigger restart
            }, 3000);
            
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update bot name. Check logs.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setBotNameCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating bot name.' 
        }, { quoted: message });
    }
}

// Command: Set Bot Owner Name
async function setBotOwnerCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('botOwner');
            await sock.sendMessage(chatId, { 
                text: `👑 *Current Bot Owner:* ${current}\n\n*Usage:* .setbotowner <new owner name>\n*Example:* .setbotowner Wally Jay Tech` 
            }, { quoted: message });
            return;
        }
        
        const newOwner = args.join(' ').trim();
        const success = updateSettings('botOwner', newOwner);
        
        if (success) {
            await sock.sendMessage(chatId, { 
                text: `✅ *BOT OWNER UPDATED!*\n\n👑 *Old:* ${getSetting('botOwner')}\n👑 *New:* ${newOwner}` 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update bot owner.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setBotOwnerCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating bot owner.' 
        }, { quoted: message });
    }
}

// Command: Set Owner Number
async function setOwnerNumberCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('ownerNumber');
            await sock.sendMessage(chatId, { 
                text: `📞 *Current Owner Number:* ${current}\n\n*Usage:* .setownernumber <2348144317152>\n*Example:* .setownernumber 2348144317152\n\n⚠️ Format: Country code + number (no +, no spaces)` 
            }, { quoted: message });
            return;
        }
        
        const newNumber = args[0].replace(/[^0-9]/g, '');
        
        // Basic validation
        if (newNumber.length < 10) {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid number format. Use country code + number (e.g., 2348144317152)' 
            }, { quoted: message });
            return;
        }
        
        const success = updateSettings('ownerNumber', newNumber);
        
        if (success) {
            await sock.sendMessage(chatId, { 
                text: `✅ *OWNER NUMBER UPDATED!*\n\n📞 *Old:* ${getSetting('ownerNumber')}\n📞 *New:* ${newNumber}\n\n⚠️ You MUST be the owner of this new number!\n⚠️ Bot will restart to apply changes...` 
            }, { quoted: message });
            
            // Auto-restart after 5 seconds
            setTimeout(() => {
                console.log('🔄 Restarting bot after owner number change...');
                process.exit(1);
            }, 5000);
            
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update owner number.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setOwnerNumberCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating owner number.' 
        }, { quoted: message });
    }
}

// Command: Set YouTube Channel
async function setYTChannelCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = global.ytch || 'Not set';
            await sock.sendMessage(chatId, { 
                text: `📺 *Current YouTube Channel:* ${current}\n\n*Usage:* .setytchannel <channel name or link>\n*Example:* .setytchannel Wally Jay Tech\n*Example:* .setytchannel https://youtube.com/@wallyjaytechy` 
            }, { quoted: message });
            return;
        }
        
        const newYT = args.join(' ').trim();
        
        // Update global variable
        global.ytch = newYT;
        
        // Also update settings.js if you want it saved
        updateSettings('ytChannel', newYT);
        
        await sock.sendMessage(chatId, { 
            text: `✅ *YOUTUBE CHANNEL UPDATED!*\n\n📺 *New Channel:* ${newYT}\n\nThis will be displayed in the bot menu.` 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in setYTChannelCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating YouTube channel.' 
        }, { quoted: message });
    }
}

// Command: Set Pack Name (for stickers)
async function setPackNameCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('packname');
            await sock.sendMessage(chatId, { 
                text: `📦 *Current Pack Name:* ${current}\n\n*Usage:* .setpackname <new pack name>\n*Example:* .setpackname WALLY-MD Stickers\n\n⚠️ This appears on stickers you create.` 
            }, { quoted: message });
            return;
        }
        
        const newPack = args.join(' ').trim();
        const success = updateSettings('packname', newPack);
        
        if (success) {
            // Update global variable too
            global.packname = newPack;
            
            await sock.sendMessage(chatId, { 
                text: `✅ *PACK NAME UPDATED!*\n\n📦 *Old:* ${getSetting('packname')}\n📦 *New:* ${newPack}\n\nThis will appear on all new stickers.` 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update pack name.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setPackNameCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating pack name.' 
        }, { quoted: message });
    }
}

// Command: Set Author (for stickers)
async function setAuthorCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('author');
            await sock.sendMessage(chatId, { 
                text: `✍️ *Current Author:* ${current}\n\n*Usage:* .setauthor <new author name>\n*Example:* .setauthor Wally Jay\n\n⚠️ This appears on stickers you create.` 
            }, { quoted: message });
            return;
        }
        
        const newAuthor = args.join(' ').trim();
        const success = updateSettings('author', newAuthor);
        
        if (success) {
            // Update global variable too
            global.author = newAuthor;
            
            await sock.sendMessage(chatId, { 
                text: `✅ *AUTHOR UPDATED!*\n\n✍️ *Old:* ${getSetting('author')}\n✍️ *New:* ${newAuthor}\n\nThis will appear on all new stickers.` 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update author.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setAuthorCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating author.' 
        }, { quoted: message });
    }
}

// Command: Set Timezone
async function setTimezoneCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use this command.' 
            }, { quoted: message });
            return;
        }
        
        if (!args || args.length === 0) {
            const current = getSetting('timezone');
            await sock.sendMessage(chatId, { 
                text: `🌍 *Current Timezone:* ${current}\n\n*Usage:* .settimezone <timezone>\n*Examples:*\n• .settimezone Africa/Lagos\n• .settimezone America/New_York\n• .settimezone Asia/Tokyo\n\n📚 See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones` 
            }, { quoted: message });
            return;
        }
        
        const newTimezone = args.join(' ').trim();
        
        // Validate timezone format
        if (!newTimezone.includes('/')) {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid timezone format. Use: Continent/City\nExample: Africa/Lagos' 
            }, { quoted: message });
            return;
        }
        
        const success = updateSettings('timezone', newTimezone);
        
        if (success) {
            await sock.sendMessage(chatId, { 
                text: `✅ *TIMEZONE UPDATED!*\n\n🌍 *Old:* ${getSetting('timezone')}\n🌍 *New:* ${newTimezone}\n\n⏰ Bot time will now use this timezone.` 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to update timezone.' 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setTimezoneCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error updating timezone.' 
        }, { quoted: message });
    }
}

// Command: Show Configuration Commands
async function configHelpCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        if (!isExactOwner(sock, senderId, message)) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *ACCESS DENIED!*\n\nOnly the bot owner can use configuration commands.' 
            }, { quoted: message });
            return;
        }
        
        const helpText = `
🔧 *WALLYJAYTECH-MD CONFIGURATION COMMANDS*

*These commands modify settings.js file directly:*

🤖 *Bot Identity:*
• .setbotname <name> - Change bot display name
• .setbotowner <name> - Change owner display name
• .setownernumber <num> - Change owner WhatsApp number

📺 *Media & Links:*
• .setytchannel <name/link> - Change YouTube channel
• .setpackname <name> - Change sticker pack name
• .setauthor <name> - Change sticker author name

🌍 *Preferences:*
• .settimezone <zone> - Change bot timezone

📊 *Current Settings:*
• Use existing .settings command to view all

⚠️ *Important Notes:*
• Only the owner number can use these commands
• Some changes require bot restart
• All changes are saved to settings.js
• No sudo users can access these commands

*Example Usage:*
.setbotname WALLY-MD PRO
.setbotowner Wally Jay
.setownernumber 2348144317152
.setytchannel https://youtube.com/@wallyjaytechy
.setpackname WALLY Stickers
.setauthor Wally Jay Tech
.settimezone Africa/Lagos
`;
        
        await sock.sendMessage(chatId, { 
            text: helpText
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in configHelpCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error loading help.' 
        }, { quoted: message });
    }
}

// Export all commands
module.exports = {
    setBotNameCommand,
    setBotOwnerCommand,
    setOwnerNumberCommand,
    setYTChannelCommand,
    setPackNameCommand,
    setAuthorCommand,
    setTimezoneCommand,
    configHelpCommand
};
