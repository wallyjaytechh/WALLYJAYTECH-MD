const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function viewOnceCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation?.trim() ||
                    message.message?.extendedTextMessage?.text?.trim() || '';
        
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            return await sock.sendMessage(chatId, { 
                text: '📸 *View Once Revealer* 🔓\n\n*❌ Reply to a view-once message with* .vv' 
            }, { quoted: message });
        }

        // Check if it's a view-once message
        const isViewOnce = quotedMessage.viewOnceMessageV2 || 
                          quotedMessage.viewOnceMessageV2Extension || 
                          quotedMessage.viewOnceMessage;

        if (!isViewOnce) {
            return await sock.sendMessage(chatId, { 
                text: '❌ *This is not a view-once message!*' 
            }, { quoted: message });
        }

        const viewOnceContent = quotedMessage.viewOnceMessageV2 || 
                               quotedMessage.viewOnceMessageV2Extension || 
                               quotedMessage.viewOnceMessage;

        let mediaMessage = null;
        let mediaType = '';

        await sock.sendMessage(chatId, { 
            text: '⏳ *Processing view-once media...*' 
        }, { quoted: message });

        // Handle different media types
        if (viewOnceContent.message?.imageMessage) {
            mediaType = 'image';
            const imageMsg = viewOnceContent.message.imageMessage;
            const stream = await downloadContentFromMessage(imageMsg, 'image');
            const buffer = await streamToBuffer(stream);
            
            mediaMessage = {
                image: buffer,
                caption: `📸 *View Once Image Revealed!* 🔓\n\n*From:* ${message.key.remoteJid}\n\n*Time:* ${new Date().toLocaleString()}\n\n*Powered by WALLYJAYTECH-MD*`
            };
        } 
        else if (viewOnceContent.message?.videoMessage) {
            mediaType = 'video';
            const videoMsg = viewOnceContent.message.videoMessage;
            const stream = await downloadContentFromMessage(videoMsg, 'video');
            const buffer = await streamToBuffer(stream);
            
            mediaMessage = {
                video: buffer,
                caption: `🎥 *View Once Video Revealed!* 🔓\n\n*From:* ${message.key.remoteJid}\n*Time:* ${new Date().toLocaleString()}\n\n*Powered by WALLYJAYTECH-MD*`
            };
        }
        else if (viewOnceContent.message?.audioMessage) {
            mediaType = 'voice';
            const audioMsg = viewOnceContent.message.audioMessage;
            const stream = await downloadContentFromMessage(audioMsg, 'audio');
            const buffer = await streamToBuffer(stream);
            
            mediaMessage = {
                audio: buffer,
                ptt: audioMsg.ptt === true,
                mimetype: audioMsg.mimetype,
                caption: `🎵 *View Once Voice Revealed!* 🔓\n\n*From:* ${message.key.remoteJid}\n\n*Time:* ${new Date().toLocaleString()}\n\n*Powered by WALLYJAYTECH-MD*`
            };
        }
        else {
            return await sock.sendMessage(chatId, { 
                text: '*❌ Unsupported view-once type!*' 
            }, { quoted: message });
        }

        // Extract option from command
        const option = text.replace(/^\.vv\s*/i, '').trim().toLowerCase();
        
        // Get owner number from settings
        const settings = require('../settings');
        const ownerNumber = settings.ownerNumber; // Should be '2348144317152' from your settings
        
        // Format owner's WhatsApp JID
        const ownerJID = `${ownerNumber}@s.whatsapp.net`;

        // Handle different privacy options
        switch(option) {
            case 'dm':
            case 'private':
            case 'me':
            case 'owner':
                // Send to OWNER'S DM (your personal DM)
                console.log('Sending to owner DM:', ownerJID);
                
                // Send to owner's DM
                await sock.sendMessage(ownerJID, mediaMessage);
                
                // Send confirmation in original chat
                await sock.sendMessage(chatId, { 
                    text: '✅ *View-once media sent to owner DM!* 🔒\n\n*Only the bot owner can see it.*' 
                }, { quoted: message });
                break;

            case 'silent':
            case 'stealth':
            case 'quiet':
                // Send in current chat with stealth mode
                await sock.sendMessage(chatId, mediaMessage);
                await sock.sendMessage(chatId, { 
                    text: '🔒 *Media revealed stealthily* 🎭' 
                }, { quoted: message });
                break;

            case '':
                // No option - reveal in current chat normally
                await sock.sendMessage(chatId, mediaMessage);
                await sock.sendMessage(chatId, { 
                    text: '🔓 *Media revealed in this chat*' 
                }, { quoted: message });
                break;

            default:
                return await sock.sendMessage(chatId, { 
                    text: '❌ *Invalid option!*\n\n*Use:* .vv, .vv dm, *or* .vv silent' 
                }, { quoted: message });
        }

    } catch (error) {
        console.error('ViewOnce Error:', error);
        
        let errorMsg = `❌ *Recovery failed!*\n\n*Error:* ${error.message}`;
        
        if (error.message.includes('not-authorized') || error.message.includes('401')) {
            errorMsg += '\n\n💡 *Owner DM Issue:* Make sure the bot is in your contacts!';
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMsg 
        }, { quoted: message });
    }
}

// Helper function to convert stream to buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

module.exports = viewOnceCommand;
