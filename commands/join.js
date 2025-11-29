/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Join Command - Join any WhatsApp group via link
 */

// Join any WhatsApp group
async function joinCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        // If no arguments, show usage
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👥 *JOIN WHATSAPP GROUP* 👥\n\n*Usage:*\n• \`.join <group-link>\` - Join any WhatsApp group\n• \`.join help\` - Show examples\n\n*Examples:*\n• \`.join https://chat.whatsapp.com/ABC123def456\`\n• \`.join https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I\`\n\n*Note:* You can join any valid WhatsApp group or channel link!`,
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

        // Show help
        if (action === 'help') {
            await sock.sendMessage(chatId, {
                text: `🆘 *JOIN COMMAND HELP* 🆘\n\n*How to use:*\n1. Copy any WhatsApp group invite link\n2. Use: \`.join <paste-link-here>\`\n\n*Valid link formats:*\n• https://chat.whatsapp.com/ABC123def456\n• https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I\n• https://whatsapp.com/groups/ABC123def456\n\n*Examples:*\n• \`.join https://chat.whatsapp.com/HggBPlh2UEMEHaGwOcaVkE\`\n• \`.join https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I\`\n\n*Note:* The bot will attempt to join any valid WhatsApp group or channel!`,
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

        // Extract the link from arguments
        const link = userMessage.slice(6).trim(); // Remove ".join "
        
        if (!link) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a WhatsApp group link!\n\nExample: `.join https://chat.whatsapp.com/ABC123def456`',
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

        // Validate WhatsApp link format
        const whatsappLinkRegex = /https?:\/\/(?:chat\.|www\.)?whatsapp\.com\/(?:invite\/|channel\/|groups\/)?([a-zA-Z0-9]+)/i;
        const match = link.match(whatsappLinkRegex);

        if (!match) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid WhatsApp link format!\n\nPlease provide a valid WhatsApp group/channel link.\n\n*Valid formats:*\n• https://chat.whatsapp.com/ABC123\n• https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I\n• https://whatsapp.com/groups/ABC123',
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

        const groupCode = match[1];
        
        // Show processing message
        await sock.sendMessage(chatId, {
            text: `🔄 *Processing your request...*\n\n🔗 Link: ${link}\n\nAttempting to join the group...`,
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

        try {
            // Try to join the group using WhatsApp's group invite acceptance
            const result = await sock.groupAcceptInvite(groupCode);
            
            if (result) {
                await sock.sendMessage(chatId, {
                    text: `✅ *SUCCESS!* ✅\n\n🎉 Successfully joined the group!\n\n🔗 *Link:* ${link}\n📛 *Group ID:* ${result}\n\nYou can now interact with the group members and use bot commands there!`,
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
                    text: `❌ *Failed to join group!*\n\nPossible reasons:\n• Invalid or expired link\n• Group is full\n• Link requires approval\n• Bot is banned from group\n\nPlease check the link and try again.`,
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

        } catch (error) {
            console.error('Join group error:', error);
            
            let errorMessage = '❌ *Failed to join group!*\n\n';
            
            if (error.message.includes('invite')) {
                errorMessage += '• Invalid or expired invite link\n';
            } else if (error.message.includes('full')) {
                errorMessage += '• Group is full\n';
            } else if (error.message.includes('banned')) {
                errorMessage += '• Bot is banned from this group\n';
            } else if (error.message.includes('approval')) {
                errorMessage += '• Group requires admin approval\n';
            } else {
                errorMessage += '• Unknown error occurred\n';
            }
            
            errorMessage += '\nPlease try a different group link.';
            
            await sock.sendMessage(chatId, {
                text: errorMessage,
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

    } catch (error) {
        console.error('Error in join command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing join command!',
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
