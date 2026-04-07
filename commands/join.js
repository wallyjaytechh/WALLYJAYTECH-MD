/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Join Command - Join any WhatsApp group via link
 */

// Channel info for professional branding
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// Get bot's JID
function getBotJid(sock) {
    return sock.user.id.split(':')[0] + '@s.whatsapp.net';
}

// Check if bot is already in a group by invite code
async function isBotAlreadyInGroup(sock, groupCode) {
    try {
        // Try to get group invite info first
        const inviteInfo = await sock.groupGetInviteInfo(groupCode).catch(() => null);
        if (!inviteInfo) return false;
        
        const groupId = inviteInfo.id;
        const botJid = getBotJid(sock);
        
        // Get group metadata to check participants
        const metadata = await sock.groupMetadata(groupId).catch(() => null);
        if (!metadata) return false;
        
        // Check if bot is already a participant
        return metadata.participants.some(p => p.id === botJid);
    } catch (error) {
        // If can't check, assume not in group
        return false;
    }
}

// Join any WhatsApp group
async function joinCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        // If no arguments, show usage
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👥 *JOIN COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ .join <group-link>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .join https://chat.whatsapp.com/DNk2fx5wUEeLXCQMnTkEOf\n└ .join https://chat.whatsapp.com/ABC123def456\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Note:*\n└ Only works for WhatsApp GROUP links\n└ Does NOT work for Channels\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *Group link format:*\n└ https://chat.whatsapp.com/XXXXXX`,
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();

        // Show help
        if (action === 'help') {
            await sock.sendMessage(chatId, {
                text: `🆘 *JOIN COMMAND HELP*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *How to use:*\n1. Copy any WhatsApp group invite link\n2. Use: .join <paste-link-here>\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 *Valid link format:*\n└ https://chat.whatsapp.com/XXXXXX\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .join https://chat.whatsapp.com/DNk2fx5wUEeLXCQMnTkEOf\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Note:*\n└ Only works for WhatsApp GROUPS\n└ Does NOT work for Channels\n└ Bot must not be banned from the group`,
                ...channelInfo
            });
            return;
        }

        // Extract the link from arguments
        const link = userMessage.slice(6).trim(); // Remove ".join "
        
        if (!link) {
            await sock.sendMessage(chatId, {
                text: `❌ *INVALID LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Please provide a WhatsApp group link!\n\n✨ *Example:*\n└ .join https://chat.whatsapp.com/DNk2fx5wUEeLXCQMnTkEOf`,
                ...channelInfo
            });
            return;
        }

        // Validate WhatsApp group link format (must be chat.whatsapp.com)
        const groupLinkRegex = /https?:\/\/(?:chat\.)?whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/i;
        const match = link.match(groupLinkRegex);

        if (!match || !link.includes('chat.whatsapp.com')) {
            await sock.sendMessage(chatId, {
                text: `❌ *INVALID GROUP LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 This command only works for WhatsApp GROUP links.\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 *Valid format:*\n└ https://chat.whatsapp.com/XXXXXX\n\n━━━━━━━━━━━━━━━━━━━━\n❌ *Does NOT work for:*\n└ Channel links (whatsapp.com/channel/)\n└ Other WhatsApp links\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *Tip:* Make sure you copied a GROUP invite link.`,
                ...channelInfo
            });
            return;
        }

        const groupCode = match[1];
        
        // CHECK IF BOT IS ALREADY IN THE GROUP
        await sock.sendMessage(chatId, {
            text: `🔄 *CHECKING*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 Link: ${link}\n📌 Code: ${groupCode}\n\n━━━━━━━━━━━━━━━━━━━━\n⏳ Checking if bot is already in this group...`,
            ...channelInfo
        });

        const alreadyJoined = await isBotAlreadyInGroup(sock, groupCode);
        
        if (alreadyJoined) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *ALREADY A MEMBER*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot is already in this group!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 *Link:* ${link}\n\n━━━━━━━━━━━━━━━━━━━━\n💡 No need to join again.`,
                ...channelInfo
            });
            return;
        }
        
        // Show processing message
        await sock.sendMessage(chatId, {
            text: `🔄 *JOINING*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 Link: ${link}\n📌 Code: ${groupCode}\n\n━━━━━━━━━━━━━━━━━━━━\n⏳ Attempting to join the group...`,
            ...channelInfo
        });

        try {
            // Try to join the group
            const result = await sock.groupAcceptInvite(groupCode);
            
            if (result) {
                await sock.sendMessage(chatId, {
                    text: `✅ *SUCCESSFULLY JOINED!*\n\n━━━━━━━━━━━━━━━━━━━━\n🎉 Bot has joined the group!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 *Link:* ${link}\n📛 *Group ID:* ${result}\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 Bot is now active in the group!`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Possible reasons:\n└ Invalid or expired link\n└ Group is full\n└ Link requires admin approval\n└ Bot is banned from the group\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Please check the link and try again.`,
                    ...channelInfo
                });
            }

        } catch (error) {
            console.error('Join group error:', error);
            
            let errorMessage = `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            
            if (error.message.includes('invite') || error.message.includes('Invalid')) {
                errorMessage += `📌 Error: Invalid or expired invite link\n`;
            } else if (error.message.includes('full')) {
                errorMessage += `📌 Error: Group is full\n`;
            } else if (error.message.includes('banned')) {
                errorMessage += `📌 Error: Bot is banned from this group\n`;
            } else if (error.message.includes('approval')) {
                errorMessage += `📌 Error: Group requires admin approval\n`;
            } else if (error.message.includes('already')) {
                errorMessage += `📌 Error: Bot is already in this group\n`;
            } else {
                errorMessage += `📌 Error: ${error.message}\n`;
            }
            
            errorMessage += `\n━━━━━━━━━━━━━━━━━━━━\n💡 Please try a different group link.`;
            
            await sock.sendMessage(chatId, {
                text: errorMessage,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in join command:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *ERROR*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Failed to process join command.\n\n💡 Please try again later.`,
            ...channelInfo
        });
    }
}

// Quick join function for direct group codes
async function quickJoin(sock, chatId, groupCode) {
    try {
        // Check if already joined first
        const alreadyJoined = await isBotAlreadyInGroup(sock, groupCode);
        if (alreadyJoined) {
            return { success: false, error: 'ALREADY_JOINED', message: 'Bot is already in this group' };
        }
        
        const result = await sock.groupAcceptInvite(groupCode);
        return { success: true, groupId: result };
    } catch (error) {
        console.error('Quick join error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    joinCommand,
    quickJoin
};
