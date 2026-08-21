/**
 * WALLYJAYTECH-MD - TikTok Downloader (TEST VERSION)
 */

const axios = require('axios');

async function tiktokCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url || !url.includes('tiktok.com')) {
            return await sock.sendMessage(chatId, {
                text: '🎬 *TIKTOK DOWNLOADER*\n\n📖 Usage: .tiktok <link>\n\n✨ Example: .tiktok https://vt.tiktok.com/xxxxx'
            });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // Try API 1: TikWM
        let videoUrl = null;
        let usedApi = '';

        try {
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
                timeout: 15000
            });
            if (res.data?.data?.play) {
                videoUrl = res.data.data.play;
                usedApi = 'TikWM';
            }
        } catch (e) {
            console.log('TikWM failed:', e.message);
        }

        // Try API 2: Siputzx
        if (!videoUrl) {
            try {
                const res = await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`, {
                    timeout: 15000
                });
                if (res.data?.data?.urls?.[0]) {
                    videoUrl = res.data.data.urls[0];
                    usedApi = 'Siputzx';
                }
            } catch (e) {
                console.log('Siputzx failed:', e.message);
            }
        }

        // Try API 3: Tiktokio
        if (!videoUrl) {
            try {
                const res = await axios.get(`https://tiktokio.com/api/v1/tiktok?url=${encodeURIComponent(url)}`, {
                    timeout: 15000
                });
                if (res.data?.data?.video_url) {
                    videoUrl = res.data.data.video_url;
                    usedApi = 'Tiktokio';
                }
            } catch (e) {
                console.log('Tiktokio failed:', e.message);
            }
        }

        if (!videoUrl) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: '❌ Could not download video.\n\n💡 Try a different video or try again later.'
            });
        }

        // Download and send video
        try {
            const response = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);
            const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

            await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: "video/mp4",
                caption: `🎬 *TikTok Video*\n📦 Size: ${sizeMB}MB\n📌 API: ${usedApi}\n\n*Powered by WALLYJAYTECH-MD*`
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (sendErr) {
            // Try sending as URL
            await sock.sendMessage(chatId, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                caption: `🎬 *TikTok Video*\n📌 API: ${usedApi}\n\n*Powered by WALLYJAYTECH-MD*`
            }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ TikTok error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Error: ' + error.message
        });
    }
}

module.exports = tiktokCommand;
