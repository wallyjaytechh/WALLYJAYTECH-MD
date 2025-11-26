 const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

async function getImageBuffer(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return Buffer.concat(chunks);
        }

        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return Buffer.concat(chunks);
        }

        return null;
    } catch (error) {
        console.error('Error getting image:', error);
        return null;
    }
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'tools',
    desc: 'Remove background from images using remove.bg',
    async exec(sock, message, args) {
        const chatId = message.key.remoteJid;
        
        try {
            // Check if remove.bg is configured
            if (!settings.removeBgApi?.apiKey || settings.removeBgApi.apiKey === "YOUR_API_KEY_HERE") {
                return await sock.sendMessage(chatId, { 
                    text: '❌ *Remove.BG Not Configured*\n\nPlease set your remove.bg API key in settings.js\n\nGet free API key from: https://www.remove.bg/api' 
                }, { quoted: message });
            }

            const imageBuffer = await getImageBuffer(sock, message);
            if (!imageBuffer) {
                return await sock.sendMessage(chatId, { 
                    text: '📸 *How to use Remove Background:*\n\n• Reply to an image with `.removebg`\n• Or send an image with `.removebg` as caption\n\n*Note:* Uses official remove.bg API for best quality' 
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, { 
                text: '🔄 *Processing with Remove.BG...*\n\nUsing official API for high-quality background removal...' 
            }, { quoted: message });

            // Use official remove.bg API
            const formData = new FormData();
            formData.append('image_file', imageBuffer, {
                filename: 'image.jpg',
                contentType: 'image/jpeg'
            });
            formData.append('size', 'auto');

            console.log('Sending to remove.bg API...');
            
            const response = await axios({
                method: 'POST',
                url: settings.removeBgApi.apiUrl,
                data: formData,
                headers: {
                    'X-Api-Key': settings.removeBgApi.apiKey,
                    ...formData.getHeaders()
                },
                responseType: 'arraybuffer',
                timeout: 60000
            });

            if (response.status === 200 && response.data && response.data.length > 5000) {
                await sock.sendMessage(chatId, {
                    image: response.data,
                    caption: '✨ *Background Removed Successfully!*\n\n✅ *Powered by Remove.BG Official API*\n🔄 *Processed by WALLYJAYTECH-MD*'
                }, { quoted: message });
                
                console.log('✅ Remove.BG processing successful');
            } else {
                throw new Error('Invalid response from remove.bg');
            }

        } catch (error) {
            console.error('Remove.BG Error:', error.message);
            
            let errorMessage = '❌ *Background Removal Failed*';
            
            if (error.response?.status === 402) {
                errorMessage += '\n💳 *API Limit Reached*\nYour remove.bg credits have been exhausted.\nGet more at: https://www.remove.bg/pricing';
            } else if (error.response?.status === 400) {
                const errorData = JSON.parse(Buffer.from(error.response.data).toString());
                errorMessage += `\n📷 *Image Error:* ${errorData.errors?.[0]?.title || 'Invalid image format'}`;
            } else if (error.response?.status === 403) {
                errorMessage += '\n🔑 *Invalid API Key*\nPlease check your remove.bg API key in settings.js';
            } else if (error.response?.status === 429) {
                errorMessage += '\n⏰ *Rate Limit Exceeded*\nPlease try again in a few minutes.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += '\n⏰ *Request Timeout*\nThe image might be too large. Try a smaller image.';
            } else {
                errorMessage += '\n🔧 *Service Unavailable*\nPlease try again later.';
            }
            
            await sock.sendMessage(chatId, { 
                text: errorMessage 
            }, { quoted: message });
        }
    }
};
