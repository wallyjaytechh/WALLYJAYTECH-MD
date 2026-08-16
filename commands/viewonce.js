// commands/viewonce.js - SIMPLE TESTING VERSION
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

        // ---- CHECK VIEW-ONCE ----
        let viewOnceContent = null;
        let isViewOnce = false;

        // Check all possible view-once structures
        if (quotedMessage.viewOnceMessageV2) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.viewOnceMessageV2;
        } 
        else if (quotedMessage.viewOnceMessageV2Extension) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.viewOnceMessageV2Extension;
        }
        else if (quotedMessage.viewOnceMessage) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.viewOnceMessage;
        }
        else if (quotedMessage.message?.viewOnceMessageV2) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.message.viewOnceMessageV2;
        }
        else if (quotedMessage.message?.viewOnceMessageV2Extension) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.message.viewOnceMessageV2Extension;
        }
        else if (quotedMessage.message?.viewOnceMessage) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.message.viewOnceMessage;
        }
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2;
        }
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2Extension) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2Extension;
        }
        else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessage) {
            isViewOnce = true;
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessage;
        }

        if (!isViewOnce || !viewOnceContent) {
            return await sock.sendMessage(chatId, { 
                text: '❌ This is NOT a view-once message!'
            }, { quoted: message });
        }

        // ---- SEND PROCESSING ----
        await sock.sendMessage(chatId, { 
            text: '⏳ Processing view-once media...'
        }, { quoted: message });

        // ---- EXTRACT MEDIA ----
        const mediaMsg = viewOnceContent.message || viewOnceContent;
        let mediaMessage = null;

        if (mediaMsg?.imageMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.imageMessage, 'image');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { 
                image: buffer, 
                caption: '📸 View Once Image Revealed!'
            };
        } 
        else if (mediaMsg?.videoMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.videoMessage, 'video');
            const buffer = await streamToBuffer(stream);
            mediaMessage = { 
                video: buffer, 
                caption: '🎥 View Once Video Revealed!'
            };
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
                text: '❌ Unsupported view-once type!'
            }, { quoted: message });
        }

        // ---- SEND REVEALED MEDIA ----
        await sock.sendMessage(chatId, mediaMessage, { quoted: message });
        await sock.sendMessage(chatId, { 
            text: '✅ View-once media revealed successfully!'
        }, { quoted: message });

    } catch (error) {
        console.error('ViewOnce Error:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = viewOnceCommand;
