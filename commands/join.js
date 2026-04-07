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
        
        // Show processing message
        await sock.sendMessage(chatId, {
            text: `🔄 *PROCESSING*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 Link: ${link}\n📌 Code: ${groupCode}\n\n━━━━━━━━━━━━━━━━━━━━\n⏳ Attempting to join the group...`,
            ...channelInfo
        });

        try {
            // Try to join the group using WhatsApp's group invite acceptance
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
