/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Facebook Video Downloader Command - Multiple API fallback
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

const API_LIST = [
    {
        name: 'Siputzx',
        url: (u) => `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.urls?.[0] || d?.data?.url || d?.data?.video_url || null,
        title: (d) => d?.data?.metadata?.title || d?.data?.title || null,
        headers: { 'accept': '*/*' }
    },
    {
        name: 'VideoderAPI',
        url: (u) => `https://api.videoder.net/facebook?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.video?.url || d?.data?.video || d?.links?.[0]?.url || null,
        title: (d) => d?.title || d?.data?.title || null,
        headers: {}
    },
    {
        name: 'SaveFrom',
        url: (u) => `https://api.savefrom.net/api/facebook?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video || d?.video || d?.url || null,
        title: (d) => d?.data?.title || null,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    },
    {
        name: 'FBDown',
        url: (u) => `https://fbdown.net/api/download?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.hd || d?.data?.sd || d?.video || null,
        title: (d) => d?.data?.title || null,
        headers: {}
    },
    {
        name: 'Ddownr',
        url: (u) => `https://api.ddownr.com/api/v1/facebook?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video || d?.data?.url || null,
        title: (d) => d?.data?.title || null,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    },
    {
        name: 'TikWM',
        url: (u) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.play || null,
        title: (d) => d?.data?.title || null,
        headers: {}
    },
    {
        name: 'SaveFBS',
        url: (u) => `https://api.savefbs.com/api/download?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video || d?.video || d?.url || null,
        title: (d) => d?.data?.title || null,
        headers: {}
    }
];

async function downloadVideo(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: 100 * 1024 * 1024,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'video/mp4,video/*,*/*',
            'Referer': 'https://www.facebook.com/'
        }
    });
    
    const buffer = Buffer.from(response.data);
    if (buffer.length < 1000) throw new Error('Video too small');
    return buffer;
}

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: `📘 *FACEBOOK DOWNLOADER*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ .fb <link>\n└ .facebook <link>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .fb https://fb.watch/xxxxx\n└ .fb https://www.facebook.com/share/v/xxxxx\n└ .fb https://www.facebook.com/user/videos/xxxxx\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Features:*\n└ HD video download\n└ Multiple API fallback\n└ Supports fb.watch links\n└ Supports share links`,
                ...channelInfo
            });
        }

        if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com')) {
            return await sock.sendMessage(chatId, {
                text: `❌ *INVALID LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Please provide a valid Facebook video link.\n\n✨ *Supported formats:*\n└ fb.watch/xxxxx\n└ facebook.com/share/v/xxxxx\n└ facebook.com/user/videos/xxxxx`,
                ...channelInfo
            });
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        let videoUrl = null;
        let caption = '*📘 Facebook Video - Downloaded by WALLYJAYTECH-MD*';
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
                        caption = `*📘 ${extractedTitle}*\n\n*⬇️ Downloaded by WALLYJAYTECH-MD*`;
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
                text: `❌ *DOWNLOAD FAILED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All download APIs are currently unavailable.\n\n💡 *Tips:*\n└ Try a different video\n└ Check if the video is public\n└ Try again later\n└ Make sure the link is correct`,
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
            console.log('✅ Facebook video sent successfully');

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
        console.error('❌ Facebook error:', error.message);
        try {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        } catch (e) {}
        await sock.sendMessage(chatId, {
            text: `❌ *ERROR*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 An error occurred while processing.\n\n💡 Please try again later.`,
            ...channelInfo
        });
    }
}

module.exports = facebookCommand;
