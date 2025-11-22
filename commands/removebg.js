const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys'); // Ensure this matches your Baileys version

async function removeBgCommand(sock, chatId, message) {
    try {
        // 1. Check if the message is an image or a reply to an image
        const isQuotedImage = message.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isImage = message.message.imageMessage;
        
        if (!isQuotedImage && !isImage) {
            await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image or send an image with the caption .removebg' }, { quoted: message });
            return;
        }

        // 2. Download the image buffer
        let mediaKey = isQuotedImage ? isQuotedImage : isImage;
        let stream = await downloadContentFromMessage(mediaKey, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 3. Prepare the data for Remove.bg
        // REPLACE 'YOUR_API_KEY_HERE' WITH YOUR REAL KEY BELOW
        const apiKey = 'dyrbNSNtMf1CE84he61DR7Wx'; 
        
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', buffer, 'image.jpg');

        // 4. Send to API
        await sock.sendMessage(chatId, { text: '⏳ Removing background... Please wait.' }, { quoted: message });

        const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey
            },
            responseType: 'arraybuffer' // Crucial: We need the raw image data back
        });

        // 5. Send the result back to WhatsApp
        await sock.sendMessage(chatId, { 
            image: Buffer.from(response.data), 
            caption: '✨ Background Removed by WALLYJAYTECH-MD!' 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in removebg:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to remove background. Make sure your API Key is valid.' }, { quoted: message });
    }
}

module.exports = { removeBgCommand };
