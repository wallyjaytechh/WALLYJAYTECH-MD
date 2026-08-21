/**
 * WALLYJAYTECH-MD - TikTok Downloader (TEST VERSION 2)
 * More APIs Added
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

        let videoUrl = null;
        let usedApi = '';
        let title = '';
        let stats = '';

        // ---- API 1: TikWM ----
        try {
            console.log('🔍 Trying TikWM...');
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (res.data?.data?.play) {
                videoUrl = res.data.data.play;
                usedApi = 'TikWM';
                title = res.data.data.title || 'No title';
                const views = res.data.data.play_count || 0;
                const likes = res.data.data.digg_count || 0;
                stats = `👁️ ${formatNumber(views)} | ❤️ ${formatNumber(likes)}`;
                console.log('✅ TikWM success');
            }
        } catch (e) {
            console.log('TikWM failed:', e.message);
        }

        // ---- API 2: SSSTikTok ----
        if (!videoUrl) {
            try {
                console.log('🔍 Trying SSSTikTok...');
                const res = await axios.post('https://ssstik.io/api/action', 
                    new URLSearchParams({ url: url }),
                    {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
                if (res.data?.video) {
                    videoUrl = res.data.video;
                    usedApi = 'SSSTikTok';
                    title = res.data.title || 'No title';
                    console.log('✅ SSSTikTok success');
                }
            } catch (e) {
                console.log('SSSTikTok failed:', e.message);
            }
        }

        // ---- API 3: Ddownr ----
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Ddownr...');
                const res = await axios.get(`https://api.ddownr.com/api/v1/tiktok?url=${encodeURIComponent(url)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (res.data?.data?.video) {
                    videoUrl = res.data.data.video;
                    usedApi = 'Ddownr';
                    title = res.data.data.title || 'No title';
                    console.log('✅ Ddownr success');
                }
            } catch (e) {
                console.log('Ddownr failed:', e.message);
            }
        }

        // ---- API 4: Tiktokio ----
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Tiktokio...');
                const res = await axios.get(`https://tiktokio.com/api/v1/tiktok?url=${encodeURIComponent(url)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (res.data?.data?.video_url) {
                    videoUrl = res.data.data.video_url;
                    usedApi = 'Tiktokio';
                    title = res.data.data.title || 'No title';
                    console.log('✅ Tiktokio success');
                }
            } catch (e) {
                console.log('Tiktokio failed:', e.message);
            }
        }

        // ---- API 5: SnapTik ----
        if (!videoUrl) {
            try {
                console.log('🔍 Trying SnapTik...');
                const res = await axios.get(`https://snaptik.app/api/action?url=${encodeURIComponent(url)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (res.data?.video) {
                    videoUrl = res.data.video;
                    usedApi = 'SnapTik';
                    title = res.data.title || 'No title';
                    console.log('✅ SnapTik success');
                }
            } catch (e) {
                console.log('SnapTik failed:', e.message);
            }
        }

        // ---- API 6: MusicallyDown ----
        if (!videoUrl) {
            try {
                console.log('🔍 Trying MusicallyDown...');
                const res = await axios.get(`https://musicallydown.com/api/download?url=${encodeURIComponent(url)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (res.data?.video) {
                    videoUrl = res.data.video;
                    usedApi = 'MusicallyDown';
                    title = res.data.title || 'No title';
                    console.log('✅ MusicallyDown success');
                }
            } catch (e) {
                console.log('MusicallyDown failed:', e.message);
            }
        }

        if (!videoUrl) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: `❌ Could not download video.\n\n💡 All APIs failed.\n\n📌 Link: ${url}\n\nTry:\n• Different video\n• Check if video is public\n• Try again later`
            });
        }

        // Download and send
        try {
            await sock.sendMessage(chatId, { react: { text: '📥', key: message.key } });

            const response = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);
            const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

            const caption = `🎬 *TikTok Video*\n\n📝 ${title}\n${stats ? `📊 ${stats}\n` : ''}📦 Size: ${sizeMB}MB\n📌 API: ${usedApi}\n\n*Powered by WALLYJAYTECH-MD*`;

            await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: "video/mp4",
                caption: caption
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (sendErr) {
            console.log('Send failed:', sendErr.message);
            // Try URL method
            try {
                const caption = `🎬 *TikTok Video*\n\n📝 ${title}\n📌 API: ${usedApi}\n\n*Powered by WALLYJAYTECH-MD*`;
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
            } catch (urlErr) {
                await sock.sendMessage(chatId, {
                    text: `✅ Video URL found but couldn't send:\n\n🔗 ${videoUrl}\n\n📌 API: ${usedApi}`
                });
            }
        }

    } catch (error) {
        console.error('❌ TikTok error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Error: ' + error.message
        });
    }
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

module.exports = tiktokCommand;
