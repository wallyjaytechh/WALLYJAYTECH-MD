const axios = require('axios');

async function handleSsCommand(sock, chatId, message, url) {
    try {
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: '*❌ Please provide URL!*\n\n*Usage:* .ss https://github.com/wallyjaytechh' 
            }, { quoted: message });
        }

        let websiteUrl = url.trim();
        if (!websiteUrl.startsWith('http')) {
            websiteUrl = 'https://' + websiteUrl;
        }

        await sock.sendMessage(chatId, { 
            text: '*📸 Taking screenshot...*' 
        }, { quoted: message });

        // Your Screenshot Machine API key
        const API_KEY = '6f742f';
        
        // Try different configurations
        const configs = [
            {
                dimension: '1024x768',
                device: 'desktop',
                delay: 1000,
                desc: 'HD Desktop'
            },
            {
                dimension: '800x600', 
                device: 'desktop',
                delay: 1000,
                desc: 'Standard Desktop'
            },
            {
                dimension: '480x800',
                device: 'phone', 
                delay: 2000,
                desc: 'Mobile View'
            }
        ];

        let screenshotBuffer = null;
        let usedConfig = null;
        
        for (const config of configs) {
            try {
                const screenshotUrl = `https://api.screenshotmachine.com/?key=${API_KEY}&url=${encodeURIComponent(websiteUrl)}&dimension=${config.dimension}&device=${config.device}&format=png&cacheLimit=0&delay=${config.delay}`;
                
                console.log(`Trying: ${config.desc} - ${config.dimension}`);
                
                const response = await axios({
                    method: 'GET',
                    url: screenshotUrl,
                    responseType: 'arraybuffer',
                    timeout: 15000
                });
                
                if (response.status === 200 && response.data.length > 5000) {
                    screenshotBuffer = Buffer.from(response.data);
                    usedConfig = config;
                    console.log(`*✅ Success with ${config.desc}`);
                    break;
                }
            } catch (error) {
                console.log(`${config.desc} failed: ${error.message}`);
                continue;
            }
        }

        if (screenshotBuffer) {
            await sock.sendMessage(chatId, { 
                image: screenshotBuffer,
                caption: `🌐 *Website Screenshot* 📸\n\n🔗 *URL:* ${websiteUrl}\n📱 *View:* ${usedConfig.desc}\n📊 *Size:* ${usedConfig.dimension}\n⏰ *Time:* ${new Date().toLocaleString()}\n\n*Powered by WALLYJAYTECH-MD*`
            }, { quoted: message });
        } else {
            throw new Error('All configurations failed');
        }

    } catch (error) {
        console.error('SS Error:', error.message);
        await sock.sendMessage(chatId, { 
            text: `*❌ Screenshot failed for* "${url}"\n\n*Try popular sites:*\n.ss https://github.com/wallyjaytechh\n.ss https://tiktok.com/@wallyjaytechh\n.ss whatsapp.com` 
        }, { quoted: message });
    }
}

module.exports = { handleSsCommand };
