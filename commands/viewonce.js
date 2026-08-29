// commands/viewonce.js - FIXED VERSION
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function viewOnceCommand(sock, chatId, message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Reply to a view-once message with .vv' 
            }, { quoted: message });
        }

        // ---- CHECK ALL POSSIBLE PATHS (Updated) ----
        let viewOnceContent = null;
        let foundPath = '';
        let mediaType = '';

        // Path 1: Direct viewOnceMessageV2
        if (quotedMessage.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.viewOnceMessageV2;
            foundPath = 'viewOnceMessageV2';
        } 
        // Path 2: Direct viewOnceMessageV2Extension
        else if (quotedMessage.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.viewOnceMessageV2Extension;
            foundPath = 'viewOnceMessageV2Extension';
        }
        // Path 3: Old viewOnceMessage
        else if (quotedMessage.viewOnceMessage) {
            viewOnceContent = quotedMessage.viewOnceMessage;
            foundPath = 'viewOnceMessage';
        }
        // Path 4: Inside message object
        else if (quotedMessage.message?.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.message.viewOnceMessageV2;
            foundPath = 'message.viewOnceMessageV2';
        }
        else if (quotedMessage.message?.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.message.viewOnceMessageV2Extension;
            foundPath = 'message.viewOnceMessageV2Extension';
        }
        else if (quotedMessage.message?.viewOnceMessage) {
            viewOnceContent = quotedMessage.message.viewOnceMessage;
            foundPath = 'message.viewOnceMessage';
        }
        // Path 5: Inside ephemeral message
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2;
            foundPath = 'ephemeralMessage.message.viewOnceMessageV2';
        }
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2Extension;
            foundPath = 'ephemeralMessage.message.viewOnceMessageV2Extension';
        }
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessage) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessage;
            foundPath = 'ephemeralMessage.message.viewOnceMessage';
        }
        // Path 6: NEW - Check for viewOnce flag on media directly
        else if (quotedMessage.imageMessage) {
            // Check if image has viewOnce property
            if (quotedMessage.imageMessage.viewOnce === true || 
                quotedMessage.imageMessage.isViewOnce === true) {
                viewOnceContent = { message: { imageMessage: quotedMessage.imageMessage } };
                foundPath = 'imageMessage (viewOnce: true)';
                mediaType = 'image';
            }
        }
        else if (quotedMessage.videoMessage) {
            if (quotedMessage.videoMessage.viewOnce === true || 
                quotedMessage.videoMessage.isViewOnce === true) {
                viewOnceContent = { message: { videoMessage: quotedMessage.videoMessage } };
                foundPath = 'videoMessage (viewOnce: true)';
                mediaType = 'video';
            }
        }
        else if (quotedMessage.audioMessage) {
            if (quotedMessage.audioMessage.viewOnce === true || 
                quotedMessage.audioMessage.isViewOnce === true) {
                viewOnceContent = { message: { audioMessage: quotedMessage.audioMessage } };
                foundPath = 'audioMessage (viewOnce: true)';
                mediaType = 'audio';
            }
        }
        // Path 7: Check inside message container (new format)
        else if (quotedMessage.message?.imageMessage?.viewOnce === true) {
            viewOnceContent = { message: { imageMessage: quotedMessage.message.imageMessage } };
            foundPath = 'message.imageMessage (viewOnce: true)';
            mediaType = 'image';
        }
        else if (quotedMessage.message?.videoMessage?.viewOnce === true) {
            viewOnceContent = { message: { videoMessage: quotedMessage.message.videoMessage } };
            foundPath = 'message.videoMessage (viewOnce: true)';
            mediaType = 'video';
        }
        else if (quotedMessage.message?.audioMessage?.viewOnce === true) {
            viewOnceContent = { message: { audioMessage: quotedMessage.message.audioMessage } };
            foundPath = 'message.audioMessage (viewOnce: true)';
            mediaType = 'audio';
        }

        console.log('🔍 FOUND PATH:', foundPath);
        console.log('📦 VIEW ONCE CONTENT:', viewOnceContent ? 'YES' : 'NO');

        if (!viewOnceContent) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Not a view-once message!\n\nFound keys: ${Object.keys(quotedMessage).join(', ')}`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            text: `⏳ Processing view-once media...`
        }, { quoted: message });

        // Get the media message
        const mediaMsg = viewOnceContent.message || viewOnceContent;
        let mediaMessage = null;

        // Image
        if (mediaMsg?.imageMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.imageMessage, 'image');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { 
                image: buffer, 
                caption: '📸 View Once Image Revealed! 🔓\n\n*Powered by WALLYJAYTECH-MD*' 
            };
        } 
        // Video
        else if (mediaMsg?.videoMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.videoMessage, 'video');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { 
                video: buffer, 
                caption: '🎥 View Once Video Revealed! 🔓\n\n*Powered by WALLYJAYTECH-MD*' 
            };
        }
        // Audio/Voice
        else if (mediaMsg?.audioMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.audioMessage, 'audio');
            const buffer = await streamToBuffer(stream);
            mediaMessage = {
                audio: buffer,
                ptt: mediaMsg.audioMessage.ptt === true,
                mimetype: mediaMsg.audioMessage.mimetype || 'audio/ogg; codecs=opus',
                caption: '🎵 View Once Voice Revealed! 🔓\n\n*Powered by WALLYJAYTECH-MD*'
            };
        }
        else {
            return await sock.sendMessage(chatId, { 
                text: '❌ Unsupported media type in view-once message!'
            }, { quoted: message });
        }

        if (!mediaMessage) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Failed to extract media from view-once message!'
            }, { quoted: message });
        }

        // Send the revealed media
        await sock.sendMessage(chatId, mediaMessage, { quoted: message });
        
        // Send success confirmation
        await sock.sendMessage(chatId, { 
            text: '✅ View-once media revealed successfully! 🔓'
        }, { quoted: message });

    } catch (error) {
        console.error('ViewOnce Error:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}\n\n💡 Make sure you replied to a view-once message.`
        }, { quoted: message });
    }
}

module.exports = viewOnceCommand;
