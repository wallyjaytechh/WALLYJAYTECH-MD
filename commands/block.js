async function blockUser(sock, chatId, message) {
    try {
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJids.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please mention a user to block. Example: .block @username',
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
        
        // Block the user on WhatsApp
        await sock.updateBlockStatus(targetJid, 'block');
        
        await sock.sendMessage(chatId, {
            text: `✅ Successfully blocked the user on WhatsApp.`,
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
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user. Please try again.',
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

module.exports = blockUser;
