 async function resetlinkCommand(sock, chatId, senderId, message) {
    try {
        // Check if sender is bot owner/sudo
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = senderId === botNumber || message.key.fromMe;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '*❌ This command is only available for the bot owner!*',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Reset the group invite link
        const newInviteCode = await sock.groupRevokeInvite(chatId);
        const newInviteLink = `https://chat.whatsapp.com/${newInviteCode}`;

        await sock.sendMessage(chatId, {
            text: `✅ *Group Link Reset Successfully!*\n\n🔗 *New Group Invite Link:*\n${newInviteLink}\n\n*Share this new link with members.*\n\n*Note:* The old link no longer works.`,
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

    } catch (error) {
        console.error('Resetlink error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to reset group link: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = resetlinkCommand;
