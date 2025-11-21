const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/**
 * View-once bypass that can run fully silent if silent===true (no error or confirmation sent).
 */
async function viewonce2(sock, chatId, message, silent = false) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const viewOnce = quoted?.viewOnceMessageV2?.message 
                      || quoted?.viewOnceMessageV2Extension?.message 
                      || quoted;

        const quotedImage = viewOnce?.imageMessage;
        const quotedVideo = viewOnce?.videoMessage;

        if (!quotedImage && !quotedVideo) {
            return; // silently ignore
        }

        const ownerJid = sock.user.id; // bot's own DM

        let content;
        if (quotedImage) {
            const stream = await downloadContentFromMessage(quotedImage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            content = {
                image: buffer,
                fileName: 'media.jpg',
                caption: quotedImage.caption || ''
            };
        } else if (quotedVideo) {
            const stream = await downloadContentFromMessage(quotedVideo, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            content = {
                video: buffer,
                fileName: 'media.mp4',
                caption: quotedVideo.caption || ''
            };
        }

        if (content) {
            await sock.sendMessage(ownerJid, content);
        }
    } catch (err) {
        // Only show error in logs if not silent
        if (!silent) {
            console.error('viewonce2 error:', err.message);
        }
    }
}

module.exports = viewonce2;
