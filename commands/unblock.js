async function unblockUser(sock, chatId, message) {
    try {
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJids.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please mention a user to unblock. Example: .unblock @username',
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

        const targetJid = mentionedJids[0];
        
        // Unblock the user on WhatsApp
        await sock.updateBlockStatus(targetJid, 'unblock');
        
        await sock.sendMessage(chatId, {
            text: `✅ Successfully unblocked the user on WhatsApp.`,
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
        
    } catch (error) {
        console.error('Error unblocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to unblock user. Please try again.',
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

module.exports = unblockUser;
