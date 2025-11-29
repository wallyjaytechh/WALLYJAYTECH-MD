/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Block Command - Block users in private chat (bot can't be blocked)
 */

const fs = require('fs');
const path = require('path');

const BLOCKED_USERS_FILE = path.join(__dirname, '../data/blockedUsers.json');

// Initialize blocked users file
function initBlockedUsers() {
    if (!fs.existsSync(BLOCKED_USERS_FILE)) {
        fs.writeFileSync(BLOCKED_USERS_FILE, JSON.stringify({ blockedUsers: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8'));
}

// Save blocked users
function saveBlockedUsers(data) {
    fs.writeFileSync(BLOCKED_USERS_FILE, JSON.stringify(data, null, 2));
}

// Check if user is blocked
function isUserBlocked(userId) {
    const data = initBlockedUsers();
    return data.blockedUsers.includes(userId);
}

// Block a user
function blockUser(userId) {
    const data = initBlockedUsers();
    if (!data.blockedUsers.includes(userId)) {
        data.blockedUsers.push(userId);
        saveBlockedUsers(data);
        return true;
    }
    return false;
}

// Unblock a user
function unblockUser(userId) {
    const data = initBlockedUsers();
    const index = data.blockedUsers.indexOf(userId);
    if (index > -1) {
        data.blockedUsers.splice(index, 1);
        saveBlockedUsers(data);
        return true;
    }
    return false;
}

// Get list of blocked users
function getBlockedUsers() {
    const data = initBlockedUsers();
    return data.blockedUsers;
}

// Extract phone number from various formats
function extractPhoneNumber(input) {
    // Remove all non-digit characters
    let cleanNumber = input.replace(/\D/g, '');
    
    // Handle different formats
    if (cleanNumber.startsWith('0')) {
        // Local number (e.g., 08123456789) - assume Nigeria
        cleanNumber = '234' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('+')) {
        // Remove + from international numbers
        cleanNumber = cleanNumber.substring(1);
    } else if (cleanNumber.length === 10) {
        // 10-digit number without country code
        cleanNumber = '234' + cleanNumber;
    }
    
    return cleanNumber + '@s.whatsapp.net';
}

// Block command
async function blockCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        const senderId = message.key.participant || message.key.remoteJid;

        // If no arguments, show usage
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `🚫 *BLOCK COMMAND* 🚫\n\n*Block users from using the bot*\n\n*Usage:*\n• \`.block @user\` - Block mentioned user\n• \`.block 2348123456789\` - Block by phone number\n• \`.block\` - Block current chat user\n• \`.block list\` - Show blocked users\n• \`.block help\` - Show help\n\n*Examples:*\n• \`.block @user\`\n• \`.block 2348123456789\`\n• \`.block\` (in user's DM)\n• \`.unblock 2348123456789\`\n• \`.unblock list\``,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'list') {
            await showBlockedList(sock, chatId);
            return;
        }

        if (action === 'help') {
            await showBlockHelp(sock, chatId);
            return;
        }

        // Handle blocking
        await handleBlock(sock, chatId, message, args);

    } catch (error) {
        console.error('Error in block command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing block command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Unblock command (standalone)
async function unblockCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        const senderId = message.key.participant || message.key.remoteJid;

        // If no arguments, show usage
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `✅ *UNBLOCK COMMAND* ✅\n\n*Unblock users to let them use the bot again*\n\n*Usage:*\n• \`.unblock @user\` - Unblock mentioned user\n• \`.unblock 2348123456789\` - Unblock by phone number\n• \`.unblock\` - Unblock current chat user\n• \`.unblock list\` - Show blocked users\n• \`.unblock help\` - Show help\n\n*Examples:*\n• \`.unblock @user\`\n• \`.unblock 2348123456789\`\n• \`.unblock\` (in user's DM)\n• \`.unblock all\` - Unblock everyone`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'list') {
            await showBlockedList(sock, chatId);
            return;
        }

        if (action === 'help') {
            await showUnblockHelp(sock, chatId);
            return;
        }

        if (action === 'all') {
            await unblockAllUsers(sock, chatId);
            return;
        }

        // Handle unblocking
        await handleUnblock(sock, chatId, message, args);

    } catch (error) {
        console.error('Error in unblock command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing unblock command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Handle block user
async function handleBlock(sock, chatId, message, args) {
    const senderId = message.key.participant || message.key.remoteJid;

    let targetUserId;

    // Method 1: Mentioned user
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetUserId = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Method 2: Phone number provided
    else if (args.length > 0 && /[\d+]/.test(args[0])) {
        targetUserId = extractPhoneNumber(args[0]);
    }
    // Method 3: Current chat (DM)
    else {
        targetUserId = chatId;
    }

    // Prevent blocking bot itself
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    if (targetUserId === botId) {
        await sock.sendMessage(chatId, {
            text: '❌ You cannot block the bot! The bot is immune to blocking.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
        return;
    }

    // Block the user
    const success = blockUser(targetUserId);
    
    if (success) {
        const shortId = targetUserId.split('@')[0];
        await sock.sendMessage(chatId, {
            text: `✅ *USER BLOCKED!*\n\n📱 User: ${shortId}\n\nThis user can no longer use bot commands.\n\nUse \`.unblock ${shortId}\` to unblock them.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ User is already blocked!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Handle unblock user
async function handleUnblock(sock, chatId, message, args) {
    let targetUserId;

    // Method 1: Mentioned user
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetUserId = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Method 2: Phone number provided
    else if (args.length > 0 && /[\d+]/.test(args[0])) {
        targetUserId = extractPhoneNumber(args[0]);
    }
    // Method 3: Current chat (DM)
    else {
        targetUserId = chatId;
    }

    const success = unblockUser(targetUserId);
    
    if (success) {
        const shortId = targetUserId.split('@')[0];
        await sock.sendMessage(chatId, {
            text: `✅ *USER UNBLOCKED!*\n\n📱 User: ${shortId}\n\nThis user can now use bot commands again.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ User is not blocked!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Unblock all users
async function unblockAllUsers(sock, chatId) {
    const blockedUsers = getBlockedUsers();
    
    if (blockedUsers.length === 0) {
        await sock.sendMessage(chatId, {
            text: '❌ No users are blocked!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
        return;
    }

    // Unblock all users
    const data = initBlockedUsers();
    const unblockedCount = data.blockedUsers.length;
    data.blockedUsers = [];
    saveBlockedUsers(data);

    await sock.sendMessage(chatId, {
        text: `✅ *ALL USERS UNBLOCKED!*\n\n📊 Total unblocked: ${unblockedCount} users\n\nAll users can now use bot commands again.`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420618370733@newsletter',
                newsletterName: 'WALLYJAYTECH-MD BOTS',
                serverMessageId: -1
            }
        }
    });
}

// Show blocked users list
async function showBlockedList(sock, chatId) {
    const blockedUsers = getBlockedUsers();
    
    if (blockedUsers.length === 0) {
        await sock.sendMessage(chatId, {
            text: '📋 *BLOCKED USERS LIST*\n\nNo users are currently blocked.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
        return;
    }

    let listMessage = `📋 *BLOCKED USERS LIST*\n\n`;
    listMessage += `*Total Blocked:* ${blockedUsers.length}\n\n`;
    
    blockedUsers.forEach((userId, index) => {
        const shortId = userId.split('@')[0];
        listMessage += `${index + 1}. ${shortId}\n`;
    });

    listMessage += `\n*Unblock methods:*\n• \`.unblock <number>\`\n• \`.unblock @user\`\n• \`.unblock all\` - Unblock everyone`;

    await sock.sendMessage(chatId, {
        text: listMessage,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420618370733@newsletter',
                newsletterName: 'WALLYJAYTECH-MD BOTS',
                serverMessageId: -1
            }
        }
    });
}

// Show block help
async function showBlockHelp(sock, chatId) {
    await sock.sendMessage(chatId, {
        text: `🆘 *BLOCK COMMAND HELP* 🆘\n\n*Block users from using the bot*\n\n*Methods:*\n1. *Mention:* \`.block @user\`\n2. *Phone number:* \`.block 2348123456789\`\n3. *In DM:* \`.block\` (blocks that user)\n\n*Supported formats:*\n• 2348123456789\n• 08123456789\n• +2348123456789\n• 8123456789\n\n*Examples:*\n• \`.block @user\`\n• \`.block 2348123456789\`\n• \`.block\` (in user's DM)\n• \`.block list\` - See blocked users`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420618370733@newsletter',
                newsletterName: 'WALLYJAYTECH-MD BOTS',
                serverMessageId: -1
            }
        }
    });
}

// Show unblock help
async function showUnblockHelp(sock, chatId) {
    await sock.sendMessage(chatId, {
        text: `🆘 *UNBLOCK COMMAND HELP* 🆘\n\n*Unblock users to let them use bot again*\n\n*Methods:*\n1. *Mention:* \`.unblock @user\`\n2. *Phone number:* \`.unblock 2348123456789\`\n3. *In DM:* \`.unblock\` (unblocks that user)\n4. *All users:* \`.unblock all\`\n\n*Supported formats:*\n• 2348123456789\n• 08123456789\n• +2348123456789\n• 8123456789\n\n*Examples:*\n• \`.unblock @user\`\n• \`.unblock 2348123456789\`\n• \`.unblock\` (in user's DM)\n• \`.unblock all\` - Unblock everyone\n• \`.unblock list\` - See blocked users`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420618370733@newsletter',
                newsletterName: 'WALLYJAYTECH-MD BOTS',
                serverMessageId: -1
            }
        }
    });
}

// Check if user is blocked
function checkIfBlocked(userId) {
    return isUserBlocked(userId);
}

// Handle blocked users in messages
async function handleBlockedUser(sock, chatId, message) {
    const senderId = message.key.participant || message.key.remoteJid;
    
    // Only check in private chats
    if (!chatId.endsWith('@g.us') && isUserBlocked(senderId)) {
        // Send block message occasionally to avoid spam
        if (Math.random() < 0.3) {
            await sock.sendMessage(chatId, {
                text: '🚫 *You are blocked from using this bot!*\n\nContact the bot owner to get unblocked.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        return true;
    }
    
    return false;
}

module.exports = {
    blockCommand,
    unblockCommand,
    checkIfBlocked,
    handleBlockedUser,
    isUserBlocked,
    blockUser,
    unblockUser,
    getBlockedUsers
};
