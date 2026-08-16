// commands/viewonce.js - DEBUG VERSION
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

        // ---- DEBUG: Log the entire quoted message ----
        console.log('📦 FULL QUOTED MESSAGE:');
        console.log(JSON.stringify(quotedMessage, null, 2));
        console.log('📦 KEYS:', Object.keys(quotedMessage));
        
        // ---- CHECK ALL POSSIBLE PATHS ----
        let viewOnceContent = null;
        let foundPath = '';

        // Path 1: Direct
        if (quotedMessage.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.viewOnceMessageV2;
            foundPath = 'viewOnceMessageV2';
        } 
        else if (quotedMessage.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.viewOnceMessageV2Extension;
            foundPath = 'viewOnceMessageV2Extension';
        }
        else if (quotedMessage.viewOnceMessage) {
            viewOnceContent = quotedMessage.viewOnceMessage;
            foundPath = 'viewOnceMessage';
        }
        // Path 2: Inside message
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
        // Path 3: Inside ephemeral
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
        // Path 4: Check if it's a view-once image/video directly
        else if (quotedMessage.imageMessage?.viewOnce === true) {
            viewOnceContent = { message: { imageMessage: quotedMessage.imageMessage } };
            foundPath = 'imageMessage (viewOnce: true)';
        }
        else if (quotedMessage.videoMessage?.viewOnce === true) {
            viewOnceContent = { message: { videoMessage: quotedMessage.videoMessage } };
            foundPath = 'videoMessage (viewOnce: true)';
        }
        else if (quotedMessage.audioMessage?.viewOnce === true) {
            viewOnceContent = { message: { audioMessage: quotedMessage.audioMessage } };
            foundPath = 'audioMessage (viewOnce: true)';
        }

        console.log('🔍 FOUND PATH:', foundPath);
        console.log('📦 VIEW ONCE CONTENT:', viewOnceContent ? 'YES' : 'NO');

        if (!viewOnceContent) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Not a view-once message!\n\nFound keys: ${Object.keys(quotedMessage).join(', ')}`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            text: `✅ Found view-once at: ${foundPath}\n⏳ Processing...`
        }, { quoted: message });

        const mediaMsg = viewOnceContent.message || viewOnceContent;
        let mediaMessage = null;

        if (mediaMsg?.imageMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.imageMessage, 'image');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { image: buffer, caption: '📸 View Once Image Revealed!' };
        } 
        else if (mediaMsg?.videoMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.videoMessage, 'video');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { video: buffer, caption: '🎥 View Once Video Revealed!' };
        }
        else if (mediaMsg?.audioMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.audioMessage, 'audio');
            const buffer = await streamToBuffer(stream);
            mediaMessage = {
                audio: buffer,
                ptt: mediaMsg.audioMessage.ptt === true,
                mimetype: mediaMsg.audioMessage.mimetype || 'audio/ogg; codecs=opus'
            };
        }
        else {
            return await sock.sendMessage(chatId, { 
                text: '❌ No media found in view-once message!'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, mediaMessage, { quoted: message });

    } catch (error) {
        console.error('ViewOnce Error:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = viewOnceCommand;
