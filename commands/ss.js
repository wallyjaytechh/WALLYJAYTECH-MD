const axios = require('axios');

module.exports = {
    name: 'ss',
    alias: ['ssweb', 'screenshot'],
    desc: 'Take website screenshot',
    category: 'utility',
    
    async execute(sock, chatId, message) {
        try {
            // Extract URL from message
            const text = message.message?.conversation?.trim() ||
                        message.message?.extendedTextMessage?.text?.trim() || '';
            
            // Remove command and get URL
            const url = text.replace(/^\.(ss|ssweb|screenshot)\s+/i, '').trim();
            
            if (!url) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ *Please provide a website URL!*\n\n*Usage:* .ss <url>\n*Example:* .ss google.com\n*Example:* .ss https://github.com' 
                }, { quoted: message });
            }

            // Format URL
            let websiteUrl = url;
            if (!websiteUrl.startsWith('http')) {
                websiteUrl = 'https://' + websiteUrl;
            }

            // Validate URL
            try {
                new URL(websiteUrl);
            } catch {
                return await sock.sendMessage(chatId, { 
                    text: '❌ *Invalid URL!*\nPlease provide a valid website URL.\nExample: .ss google.com' 
                }, { quoted: message });
            }

            // Show processing message
            await sock.sendMessage(chatId, { 
                text: '📸 *Taking screenshot...*\nPlease wait 5-10 seconds...' 
            }, { quoted: message });

            // Use thum.io API (most reliable)
            const screenshotUrl = https://image.thum.io/get/width/1200/crop/900/noanimate/${encodeURIComponent(websiteUrl)};
            
            // Download screenshot
            const response = await axios({
                method: 'GET',
                url: screenshotUrl,
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const screenshotBuffer = Buffer.from(response.data, 'binary');

            // Send screenshot
            await sock.sendMessage(chatId, { 
                image: screenshotBuffer,
                caption: 🌐 *Website Screenshot*\n\n*URL:* ${websiteUrl}\n*Time:* ${new Date().toLocaleString()}\n\n_Powered by WALLYJAYTECH-MD_
            }, { quoted: message });

        } catch (error) {
            console.error('SS Command Error:', error.message);
            
            let errorMsg = '❌ *Failed to capture screenshot!* ';
            
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMsg += 'Website took too long to load.';
            } else if (error.response?.status === 403) {
                errorMsg += 'Website blocked screenshot capture.';
            } else if (error.response?.status === 404) {
                errorMsg += 'Website not found or inaccessible.';
            } else {
                errorMsg += 'Please try a different website.';
            }
            
            await sock.sendMessage(chatId, { 
                text: errorMsg + '\n\n💡 *Try these examples:*\n.ss google.com\n.ss github.com\n.ss youtube.com'
            }, { quoted: message });
        }
    }
};
