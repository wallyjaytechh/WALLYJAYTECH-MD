// commands/setprefix.js - Change bot prefix command with "none" option
const fs = require('fs');
const path = require('path');
const { isOwnerOrSudo } = require('../lib/index');

// Store user prefixes (different prefixes per user/group)
const PREFIX_FILE = './data/prefixes.json';

// Initialize prefixes file
function initPrefixes() {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
    }
    
    if (!fs.existsSync(PREFIX_FILE)) {
        const defaultPrefixes = {
            default: '.', // Global default
            users: {},    // User-specific prefixes
            groups: {}    // Group-specific prefixes
        };
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(defaultPrefixes, null, 2));
        return defaultPrefixes;
    }
    
    try {
        return JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading prefixes file:', error);
        return initPrefixes();
    }
}

// Get prefix for a specific chat/user
function getPrefix(chatId, userId = null) {
    const prefixes = initPrefixes();
    
    // Check if chat is a group
    if (chatId.endsWith('@g.us')) {
        // Group-specific prefix
        if (prefixes.groups[chatId]) {
            const groupPrefix = prefixes.groups[chatId];
            return groupPrefix === 'none' ? '' : groupPrefix;
        }
    } 
    // Check if user has personal prefix
    else if (userId && prefixes.users[userId]) {
        const userPrefix = prefixes.users[userId];
        return userPrefix === 'none' ? '' : userPrefix;
    }
    
    // Return global default
    const globalPrefix = prefixes.default;
    return globalPrefix === 'none' ? '' : globalPrefix;
}

// Set prefix
function setPrefix(chatId, userId, newPrefix, scope = 'global') {
    const prefixes = initPrefixes();
    
    // Handle "none" prefix (no prefix needed)
    if (newPrefix.toLowerCase() === 'none') {
        newPrefix = 'none'; // Store as 'none'
    } else {
        // Validate regular prefix
        if (newPrefix.trim() === '') {
            return { success: false, message: 'For no prefix, use "none". For empty prefix, leave as is.' };
        }
        
        if (newPrefix.length > 3) {
            return { success: false, message: 'Prefix must be 3 characters or less!' };
        }
        
        // Check if prefix contains only allowed characters
        const validPrefix = /^[!$%&*+\-./:<=>?@^_~a-zA-Z0-9]{1,3}$/.test(newPrefix);
        if (!validPrefix) {
            return { success: false, message: 'Prefix can only contain letters, numbers, or special symbols!' };
        }
    }
    
    try {
        let oldPrefix;
        switch(scope) {
            case 'global':
                oldPrefix = prefixes.default;
                if (oldPrefix === newPrefix) {
                    const displayOld = oldPrefix === 'none' ? 'no prefix (none)' : `"${oldPrefix}"`;
                    return { success: false, message: `Prefix is already set to ${displayOld}` };
                }
                prefixes.default = newPrefix;
                break;
                
            case 'user':
                oldPrefix = prefixes.users[userId] || prefixes.default;
                if (oldPrefix === newPrefix) {
                    const displayOld = oldPrefix === 'none' ? 'no prefix (none)' : `"${oldPrefix}"`;
                    return { success: false, message: `Your prefix is already ${displayOld}` };
                }
                prefixes.users[userId] = newPrefix;
                break;
                
            case 'group':
                if (!chatId.endsWith('@g.us')) {
                    return { success: false, message: 'Group prefix can only be set in groups!' };
                }
                oldPrefix = prefixes.groups[chatId] || prefixes.default;
                if (oldPrefix === newPrefix) {
                    const displayOld = oldPrefix === 'none' ? 'no prefix (none)' : `"${oldPrefix}"`;
                    return { success: false, message: `Group prefix is already ${displayOld}` };
                }
                prefixes.groups[chatId] = newPrefix;
                break;
                
            default:
                return { success: false, message: 'Invalid scope!' };
        }
        
        // Save to file
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(prefixes, null, 2));
        
        const displayNew = newPrefix === 'none' ? 'no prefix (commands work without prefix)' : `"${newPrefix}"`;
        return { 
            success: true, 
            message: `✅ *Prefix set successfully!*\n\nNew prefix: ${displayNew}\nScope: ${scope}`,
            scope: scope,
            prefix: newPrefix,
            requiresPrefix: newPrefix !== 'none'
        };
        
    } catch (error) {
        return { success: false, message: `❌ Failed to set prefix: ${error.message}` };
    }
}

// Reset prefix
function resetPrefix(chatId, userId, scope = 'global') {
    const prefixes = initPrefixes();
    
    try {
        switch(scope) {
            case 'global':
                prefixes.default = '.';
                break;
                
            case 'user':
                delete prefixes.users[userId];
                break;
                
            case 'group':
                if (!chatId.endsWith('@g.us')) {
                    return { success: false, message: 'Group prefix can only be reset in groups!' };
                }
                delete prefixes.groups[chatId];
                break;
                
            default:
                return { success: false, message: 'Invalid scope!' };
        }
        
        // Save to file
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(prefixes, null, 2));
        
        return { 
            success: true, 
            message: `✅ *Prefix reset successfully!*\n\nPrefix reset to default (.)\nScope: ${scope}`,
            scope: scope
        };
        
    } catch (error) {
        return { success: false, message: `❌ Failed to reset prefix: ${error.message}` };
    }
}

// List all prefixes
function listPrefixes(userId, chatId) {
    const prefixes = initPrefixes();
    
    let text = `🔤 *PREFIX SETTINGS*\n\n`;
    
    // Global prefix
    const globalPrefix = prefixes.default === 'none' ? 'none (no prefix)' : `"${prefixes.default}"`;
    text += `*🌍 Global Prefix:* ${globalPrefix}\n\n`;
    
    // User's personal prefix
    if (prefixes.users[userId]) {
        const userPrefix = prefixes.users[userId] === 'none' ? 'none (no prefix)' : `"${prefixes.users[userId]}"`;
        text += `*👤 Your Personal Prefix:* ${userPrefix}\n`;
    } else {
        text += `*👤 Your Personal Prefix:* Not set (using global)\n`;
    }
    
    // Group prefix (if in group)
    if (chatId.endsWith('@g.us')) {
        if (prefixes.groups[chatId]) {
            const groupPrefix = prefixes.groups[chatId] === 'none' ? 'none (no prefix)' : `"${prefixes.groups[chatId]}"`;
            text += `*👥 Group Prefix:* ${groupPrefix}\n`;
        } else {
            text += `*👥 Group Prefix:* Not set (using global)\n`;
        }
    }
    
    text += `\n📋 *Available Prefix Options:*\n`;
    text += `• Regular prefix: 1-3 characters (e.g., ., !, /, $)\n`;
    text += `• Special prefix: "none" (commands work without prefix)\n\n`;
    
    text += `🎯 *Available Scopes:*\n`;
    text += `• \`global\` - For all users (owner only)\n`;
    text += `• \`user\` - Your personal prefix\n`;
    text += `• \`group\` - Group-specific (admin only)\n\n`;
    
    text += `💡 *Examples:*\n`;
    text += `• \`.setprefix !\` - Set your personal prefix to !\n`;
    text += `• \`.setprefix none user\` - Remove prefix for yourself\n`;
    text += `• \`.setprefix / group\` - Set group prefix to /\n`;
    text += `• \`.setprefix none global\` - No prefix for everyone (owner only)\n`;
    text += `• \`.setprefix reset\` - Reset to default\n`;
    
    return text;
}

// Main command handler
async function execute(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Show help if no arguments
        if (args.length === 0) {
            const helpText = listPrefixes(senderId, chatId);
            await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
            return;
        }
        
        const action = args[0].toLowerCase();
        
        // Handle reset
        if (action === 'reset') {
            const scope = args[1]?.toLowerCase() || 'user';
            
            // Check permissions
            if (scope === 'global' && !isOwner && !message.key.fromMe) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner can reset global prefix!'
                }, { quoted: message });
                return;
            }
            
            if (scope === 'group' && isGroup) {
                // Check if sender is group admin
                const { isAdmin } = require('../lib/isAdmin');
                const adminStatus = await isAdmin(sock, chatId, senderId);
                if (!adminStatus.isSenderAdmin && !message.key.fromMe && !isOwner) {
                    await sock.sendMessage(chatId, {
                        text: '❌ Only group admins can reset group prefix!'
                    }, { quoted: message });
                    return;
                }
            }
            
            const result = resetPrefix(chatId, senderId, scope);
            await sock.sendMessage(chatId, { text: result.message }, { quoted: message });
            return;
        }
        
        // Handle set prefix
        const newPrefix = action;
        const scope = args[1]?.toLowerCase() || 'user';
        
        // Check permissions
        if (scope === 'global' && !isOwner && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ Only bot owner can set global prefix!'
            }, { quoted: message });
            return;
        }
        
        if (scope === 'group' && isGroup) {
            // Check if sender is group admin
            const { isAdmin } = require('../lib/isAdmin');
            const adminStatus = await isAdmin(sock, chatId, senderId);
            if (!adminStatus.isSenderAdmin && !message.key.fromMe && !isOwner) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only group admins can set group prefix!'
                }, { quoted: message });
                return;
            }
        }
        
        const result = setPrefix(chatId, senderId, newPrefix, scope);
        await sock.sendMessage(chatId, { text: result.message }, { quoted: message });
        
        // Show example if prefix was set to "none"
        if (result.success && newPrefix.toLowerCase() === 'none') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.sendMessage(chatId, {
                text: `💡 *Example:*\nNow you can use commands without prefix:\n\n` +
                      `Instead of \`.menu\`, just type \`menu\`\n` +
                      `Instead of \`.help\`, just type \`help\`\n` +
                      `Instead of \`.ping\`, just type \`ping\`\n\n` +
                      `⚠️ *Note:* This only applies to ${scope === 'global' ? 'everyone' : scope === 'group' ? 'this group' : 'you'}!`
            });
        }
        
    } catch (error) {
        console.error('Error in setprefix command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process prefix command. Please try again.'
        }, { quoted: message });
    }
}

// Export functions
module.exports = {
    execute,
    command: 'setprefix',
    getPrefix,
    setPrefix,
    resetPrefix,
    listPrefixes,
    initPrefixes
};
