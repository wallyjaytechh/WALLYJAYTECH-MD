/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * TikTok Downloader Command - Multiple API fallback
 * Professional Version
 */

const axios = require('axios');
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// API endpoints in priority order
const API_LIST = [
    {
        name: 'TikWM',
        url: (u) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.play || null,
        title: (d) => d?.data?.title || null,
        headers: {}
    },
    {
        name: 'Tiklydown',
        url: (u) => `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.video?.noWatermark || null,
        title: (d) => d?.music?.title || null,
        headers: {}
    },
    {
        name: 'Ddownr',
        url: (u) => `https://api.ddownr.com/api/v1/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video || null,
        title: (d) => d?.data?.title || null,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    },
    {
        name: 'Siputzx',
        url: (u) => `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.urls?.[0] || d?.data?.video_url || d?.data?.url || null,
        title: (d) => d?.data?.metadata?.title || null,
        headers: { 'accept': '*/*' }
    },
    {
        name: 'Tiktokio',
        url: (u) => `https://tiktokio.com/api/v1/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video_url || d?.video || null,
        title: (d) => d?.data?.title || null,
        headers: {}
    },
    {
        name: 'VideoderAPI',
        url: (u) => `https://api.videoder.net/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.video?.url || d?.data?.video || null,
        title: (d) => d?.title || null,
        headers: {}
    },
    {
        name: 'SaveTik',
        url: (u) => `https://savetik.co/api/download?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video || d?.video || null,
        title: (d) => d?.data?.title || null,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    }
];

async function downloadVideo(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'video/mp4,video/*,*/*',
            'Referer': 'https://www.tiktok.com/'
        }
    });
    
    const buffer = Buffer.from(response.data);
    if (buffer.length < 1000) throw new Error('Video too small');
    return buffer;
}

async function tiktokCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: `🎬 *TIKTOK DOWNLOADER*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ .tiktok <link>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .tiktok https://vt.tiktok.com/xxxxx\n└ .tiktok https://www.tiktok.com/@user/video/xxxxx\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Features:*\n└ No watermark video\n└ Multiple API fallback\n└ HD quality`,
                ...channelInfo
            });
        }

        if (!url.includes('tiktok.com')) {
            return await sock.sendMessage(chatId, {
                text: `❌ *INVALID LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Please provide a valid TikTok link.\n\n✨ *Example:*\n└ .tiktok https://vt.tiktok.com/xxxxx`,
                ...channelInfo
            });
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        let videoUrl = null;
        let caption = '*🎬 TikTok Video - Downloaded by WALLYJAYTECH-MD*';
        let usedApi = '';

        // Try each API
        for (const api of API_LIST) {
            try {
                console.log(`🔍 Trying ${api.name}...`);
                const res = await axios.get(api.url(url), {
                    timeout: 15000,
                    headers: api.headers
                });

                const extractedUrl = api.extract(res.data);
                if (extractedUrl) {
                    videoUrl = extractedUrl;
                    usedApi = api.name;
                    const extractedTitle = api.title(res.data);
                    if (extractedTitle) {
                        caption = `*🎬 ${extractedTitle}*\n\n*⬇️ Downloaded by WALLYJAYTECH-MD*`;
                    }
                    console.log(`✅ ${api.name} success`);
                    break;
                }
            } catch (e) {
                console.log(`⚠️ ${api.name} failed: ${e.message}`);
            }
        }

        if (!videoUrl) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: `❌ *DOWNLOAD FAILED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All download APIs are currently unavailable.\n\n💡 *Tips:*\n└ Try a different video\n└ Check if the video is public\n└ Try again later`,
                ...channelInfo
            });
        }

        // Download and send
        try {
            console.log(`📥 Downloading from ${usedApi}...`);
            const videoBuffer = await downloadVideo(videoUrl);
            const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);

            console.log(`📤 Sending video (${sizeMB}MB)...`);
            await sock.sendMessage(chatId, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: caption
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
            console.log('✅ TikTok sent successfully');

        } catch (downloadErr) {
            console.log('⚠️ Buffer download failed, trying URL method...');
            try {
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
            } catch (urlErr) {
                await sock.sendMessage(chatId, {
                    text: `❌ *SEND FAILED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Could not send the video.\n💡 The file may be too large.`,
                    ...channelInfo
                });
            }
        }

    } catch (error) {
        console.error('❌ TikTok error:', error.message);
        try {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        } catch (e) {}
        await sock.sendMessage(chatId, {
            text: `❌ *ERROR*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 An error occurred while processing.\n\n💡 Please try again later.`,
            ...channelInfo
        });
    }
}

module.exports = tiktokCommand;
