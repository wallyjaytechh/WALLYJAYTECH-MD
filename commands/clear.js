async function clearCommand(sock, chatId, message) {
    try {
        // Use chatModify to clear the chat
        await sock.chatModify(
            { 
                delete: true, 
                lastMessages: [{ 
                    key: message.key, 
                    messageTimestamp: message.messageTimestamp 
                }] 
            }, 
            chatId
        );

        // Send confirmation
        await sock.sendMessage(chatId, {
            text: '✅ Chat cleared successfully!',
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
        console.error('Error in clear command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to clear chat',
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

module.exports = clearCommand;
