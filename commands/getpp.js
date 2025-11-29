const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function getProfilePicture(sock, chatId, message, targetJid = null) {
    try {
        // Determine the target JID
        const jidToGet = targetJid || chatId;
        const isGroup = jidToGet.endsWith('@g.us');
        
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);
        
        let profilePictureUrl;
        
        if (isGroup) {
            // Get group profile picture
            try {
                const groupMetadata = await sock.groupMetadata(jidToGet);
                profilePictureUrl = await sock.profilePictureUrl(jidToGet, 'image');
                
                await sock.sendMessage(chatId, {
                    text: `📷 *Group Profile Picture*\n\n🏷️ *Group:* ${groupMetadata.subject}\n👥 *Participants:* ${groupMetadata.participants.length}\n🆔 *Group JID:* ${jidToGet}`,
                    ...global.channelInfo
                }, { quoted: message });
                
            } catch (error) {
                if (error.message.includes('404') || error.message.includes('not found')) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ This group does not have a profile picture set.',
                        ...global.channelInfo
                    }, { quoted: message });
                }
                throw error;
            }
        } else {
            // Get user profile picture
            try {
                profilePictureUrl = await sock.profilePictureUrl(jidToGet, 'image');
                const contact = await sock.contact.getContact(jidToGet, sock);
                const userName = contact?.name || contact?.pushname || 'User';
                
                await sock.sendMessage(chatId, {
                    text: `📷 *Profile Picture*\n\n👤 *User:* ${userName}\n🆔 *JID:* ${jidToGet}`,
                    ...global.channelInfo
                }, { quoted: message });
                
            } catch (error) {
                if (error.message.includes('404') || error.message.includes('not found')) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ This user does not have a profile picture set.',
                        ...global.channelInfo
                    }, { quoted: message });
                }
                throw error;
            }
        }
        
        // Download and send the profile picture
        if (profilePictureUrl) {
            const response = await axios.get(profilePictureUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🖼️ ${isGroup ? 'Group' : 'User'} Profile Picture`,
                ...global.channelInfo
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in getProfilePicture:', error);
        
        let errorMessage = '❌ Failed to get profile picture. ';
        
        if (error.message.includes('404') || error.message.includes('not found')) {
            errorMessage += 'No profile picture found.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage += 'Access denied.';
        } else {
            errorMessage += 'Please try again later.';
        }
        
        await sock.sendMessage(chatId, {
            text: errorMessage,
            ...global.channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    getProfilePicture
};
