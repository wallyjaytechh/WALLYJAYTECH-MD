// commands/setprefix.js - Change bot prefix in settings.js
const fs = require('fs');
const path = require('path');

// Function to check if user is owner (simple version)
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

// Function to update prefix in settings.js
async function updateSettingsPrefix(newPrefix) {
    try {
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        // Find and replace the prefix line
        // Looks for: prefix: '.',
        const prefixRegex = /prefix:\s*['"`][^'"`]*['"`],/;
        
        if (prefixRegex.test(settingsContent)) {
            // For "none", we want empty string ''
            const prefixValue = newPrefix === 'none' ? "''" : `'${newPrefix}'`;
            settingsContent = settingsContent.replace(
                prefixRegex,
                `prefix: ${prefixValue},`
            );
            
            fs.writeFileSync(settingsPath, settingsContent, 'utf8');
            return true;
        } else {
            // Alternative pattern: prefix: '.'
            const altRegex = /prefix:\s*['"`][^'"`]*['"`]/;
            if (altRegex.test(settingsContent)) {
                const prefixValue = newPrefix === 'none' ? "''" : `'${newPrefix}'`;
                settingsContent = settingsContent.replace(
                    altRegex,
                    `prefix: ${prefixValue}`
                );
                fs.writeFileSync(settingsPath, settingsContent, 'utf8');
                return true;
            }
            return false;
        }
    } catch (error) {
        console.error('Error updating settings.js:', error);
        throw error;
    }
}

// Main command handler
async function execute(sock, chatId, message, args) {
    try {
        // Clear settings cache so changes take effect immediately
        delete require.cache[require.resolve('../settings')];
        
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Only owner can change prefix globally
        if (!isOwner(senderId) && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ Only bot owner can change the prefix!'
            }, { quoted: message });
            return;
        }
        
        // Show current prefix if no arguments
        if (args.length === 0) {
            const settings = require('../settings');
            const currentPrefix = settings.prefix || '.';
            const prefixDisplay = currentPrefix === '' ? 'none (no prefix)' : `"${currentPrefix}"`;
            
            await sock.sendMessage(chatId, {
                text: `🔤 *PREFIX SETTINGS*\n\n` +
                      `*Current Prefix:* ${prefixDisplay}\n\n` +
                      `📋 *Usage:*\n` +
                      `• \`.setprefix <new-prefix>\` - Change prefix\n` +
                      `• \`.setprefix .\` - Reset to default\n` +
                      `• \`.setprefix none\` - No prefix (commands work without prefix)\n\n` +
                      `💡 *Examples:*\n` +
                      `• \`.setprefix !\` - Change to !\n` +
                      `• \`.setprefix /\` - Change to /\n` +
                      `• \`.setprefix $\` - Change to $\n` +
                      `• \`.setprefix none\` - No prefix needed\n\n` +
                      `🔁 *Restart Command:* \`.restart\`\n\n` +
                      `⚠️ *Note:* You must restart the bot after changing prefix!`
            }, { quoted: message });
            return;
        }
        
        const newPrefix = args[0].toLowerCase();
        
        // Handle "none" prefix (empty string)
        if (newPrefix === 'none') {
            const settings = require('../settings');
            if (settings.prefix === '') {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Prefix is already set to "none" (no prefix)!'
                }, { quoted: message });
                return;
            }
            
            try {
                await updateSettingsPrefix('none');
                await sock.sendMessage(chatId, {
                    text: '✅ *Prefix removed!*\n\n' +
                          'Now commands work **without any prefix**.\n\n' +
                          '*Examples:*\n' +
                          '• Instead of `.menu` just type `menu`\n' +
                          '• Instead of `.help` just type `help`\n' +
                          '• Instead of `.ping` just type `ping`\n\n' +
                          '⚠️ *IMPORTANT:*\n' +
                          'You must **restart the bot** for changes to take effect!\n\n' +
                          'After restart:\n' +
                          '• All commands will work without prefix\n' +
                          '• Example: `menu` instead of `.menu`'
                }, { quoted: message });
            } catch (error) {
                await sock.sendMessage(chatId, {
                    text: `❌ Failed to update prefix: ${error.message}`
                }, { quoted: message });
            }
            return;
        }
        
        // Validate regular prefix
        if (newPrefix.length > 3) {
            await sock.sendMessage(chatId, {
                text: '❌ Prefix must be 3 characters or less!'
            }, { quoted: message });
            return;
        }
        
        // Check if prefix contains only allowed characters
        const validPrefix = /^[!$%&*+\-./:<=>?@^_~a-zA-Z0-9]{1,3}$/.test(newPrefix);
        if (!validPrefix) {
            await sock.sendMessage(chatId, {
                text: '❌ Prefix can only contain letters, numbers, or special symbols!\n\n' +
                      '*Allowed characters:*\n' +
                      '! $ % & * + - . / : < = > ? @ ^ _ ~\n' +
                      'and letters a-z, A-Z, numbers 0-9'
            }, { quoted: message });
            return;
        }
        
        // Check if prefix is already the same
        const settings = require('../settings');
        if (settings.prefix === newPrefix) {
            await sock.sendMessage(chatId, {
                text: `⚠️ Prefix is already "${newPrefix}"!`
            }, { quoted: message });
            return;
        }
        
        // Update prefix
        try {
            await updateSettingsPrefix(newPrefix);
            
            await sock.sendMessage(chatId, {
                text: `✅ *Prefix changed successfully!*\n\n` +
                      `*Old prefix:* "${settings.prefix || '.'}"\n` +
                      `*New prefix:* "${newPrefix}"\n\n` +
                      `💡 *Examples:*\n` +
                      `• \`${newPrefix}menu\` - Show menu\n` +
                      `• \`${newPrefix}help\` - Show help\n` +
                      `• \`${newPrefix}ping\` - Check bot speed\n` +
                      `• \`${newPrefix}owner\` - Contact owner\n\n` +
                      `⚠️ *IMPORTANT:*\n` +
                      `You must **restart the bot** for changes to take effect!\n\n` +
                      `🔁 *Restart Command:* \`.restart\`\n\n` +
                      `After restart, use \`${newPrefix}command\` instead of \`.command\``
            }, { quoted: message });
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed to change prefix: ${error.message}`
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in setprefix command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process prefix command. Please try again.'
        }, { quoted: message });
    }
}

// Export
module.exports = {
    execute,
    command: 'setprefix',
    isOwner // Export if needed elsewhere
};
