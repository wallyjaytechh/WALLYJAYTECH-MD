const axios = require('axios');

async function getppCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const isGroup = chatId.endsWith('@g.us');
        
        let targetJid = null;

        // Check for mentions in groups
        if (isGroup) {
            const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJids.length > 0) {
                targetJid = mentionedJids[0];
            }
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

        // If no target specified, get current chat's PP
        if (!targetJid) {
            targetJid = chatId;
        }

        const targetIsGroup = targetJid.endsWith('@g.us');
        
        // Get profile picture URL
        const ppUrl = await sock.profilePictureUrl(targetJid, 'image');
        
        if (!ppUrl) {
            return await sock.sendMessage(chatId, {
                text: `❌ No profile picture found for ${targetIsGroup ? 'this group' : 'this user'}.`,
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
            caption: `📷 ${targetIsGroup ? 'Group' : 'User'} Profile Picture\n🆔: ${targetJid}`,
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
                text: '❌ No profile picture found for this user/group.',
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
