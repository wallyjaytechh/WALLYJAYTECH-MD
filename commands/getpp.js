const axios = require('axios');

async function getppCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const isGroup = chatId.endsWith('@g.us');
        
        // Get profile picture URL
        const ppUrl = await sock.profilePictureUrl(chatId, 'image');
        
        if (!ppUrl) {
            return await sock.sendMessage(chatId, {
                text: '❌ No profile picture found for this chat.',
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
        
        // Download the image
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        // Send the image
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `📷 ${isGroup ? 'Group' : 'User'} Profile Picture`,
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
        console.error('Error in getpp command:', error);
        
        if (error.message.includes('404') || error.message.includes('not found')) {
            await sock.sendMessage(chatId, {
                text: '❌ No profile picture found for this chat.',
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
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to get profile picture. Please try again.',
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
}

module.exports = getppCommand;
