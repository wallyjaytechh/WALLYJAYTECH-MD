async function unblockCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        
        let targetJid = null;

        // Check for mentions
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids.length > 0) {
            targetJid = mentionedJids[0];
        }
        // Check if replying to a message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for phone number argument
        else if (args.length > 0) {
            let phoneNumber = args[0].replace(/[^0-9]/g, '');
            
            // Add country code if missing (assuming 234 as default)
            if (phoneNumber.length === 10) {
                phoneNumber = '234' + phoneNumber.substring(1);
            }
            
            if (phoneNumber.length >= 10) {
                targetJid = phoneNumber + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to unblock.\n\nExamples:\n.unblock @username (mention in group)\n.unblock 2348155763709 (phone number)\nReply to a message with .unblock',
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

        // Unblock the user on WhatsApp
        await sock.updateBlockStatus(targetJid, 'unblock');
        
        await sock.sendMessage(chatId, {
            text: `✅ Successfully unblocked the user on WhatsApp.\n🆔: ${targetJid}`,
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

module.exports = unblockCommand;
