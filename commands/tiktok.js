const axios = require('axios');

async function tiktokCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "*❌ Please provide a TikTok link*\n\nExample: .tiktok https://vt.tiktok.com/xxxxx"
            });
        }

        // Validate TikTok URL
        if (!url.includes('tiktok.com')) {
            return await sock.sendMessage(chatId, { 
                text: "*❌ Please provide a valid TikTok link*"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        let videoUrl = null;
        let caption = "*🎬 TikTok Video - Downloaded by WALLYJAYTECH-MD*";

        // API 1: TikWM (most reliable)
        try {
            console.log('🔍 Trying TikWM API...');
            const api1 = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const res1 = await axios.get(api1, { timeout: 15000 });
            
            if (res1.data?.data?.play) {
                videoUrl = res1.data.data.play;
                if (res1.data.data.title) {
                    caption = `*🎬 ${res1.data.data.title}*\n\n*Downloaded by WALLYJAYTECH-MD*`;
                }
                console.log('✅ TikWM success');
            }
        } catch (e) {
            console.log('⚠️ TikWM failed:', e.message);
        }

        // API 2: Ddownr
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Ddownr API...');
                const api2 = `https://api.ddownr.com/api/v1/tiktok?url=${encodeURIComponent(url)}`;
                const res2 = await axios.get(api2, { 
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                if (res2.data?.data?.video) {
                    videoUrl = res2.data.data.video;
                    console.log('✅ Ddownr success');
                }
            } catch (e) {
                console.log('⚠️ Ddownr failed:', e.message);
            }
        }

        // API 3: Siputzx
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Siputzx API...');
                const api3 = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`;
                const res3 = await axios.get(api3, { 
                    timeout: 15000,
                    headers: { 'accept': '*/*' }
                });
                
                if (res3.data?.data?.urls?.[0]) {
                    videoUrl = res3.data.data.urls[0];
                    console.log('✅ Siputzx success');
                } else if (res3.data?.data?.video_url) {
                    videoUrl = res3.data.data.video_url;
                    console.log('✅ Siputzx success (alt)');
                } else if (res3.data?.data?.url) {
                    videoUrl = res3.data.data.url;
                    console.log('✅ Siputzx success (alt2)');
                }
            } catch (e) {
                console.log('⚠️ Siputzx failed:', e.message);
            }
        }

        // API 4: Tiklydown
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Tiklydown API...');
                const api4 = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
                const res4 = await axios.get(api4, { timeout: 15000 });
                
                if (res4.data?.video?.noWatermark) {
                    videoUrl = res4.data.video.noWatermark;
                    console.log('✅ Tiklydown success');
                }
            } catch (e) {
                console.log('⚠️ Tiklydown failed:', e.message);
            }
        }

        // API 5: Tiktokio
        if (!videoUrl) {
            try {
                console.log('🔍 Trying Tiktokio API...');
                const api5 = `https://tiktokio.com/api/v1/tiktok?url=${encodeURIComponent(url)}`;
                const res5 = await axios.get(api5, { timeout: 15000 });
                
                if (res5.data?.data?.video_url) {
                    videoUrl = res5.data.data.video_url;
                    console.log('✅ Tiktokio success');
                } else if (res5.data?.video) {
                    videoUrl = res5.data.video;
                    console.log('✅ Tiktokio success (alt)');
                }
            } catch (e) {
                console.log('⚠️ Tiktokio failed:', e.message);
            }
        }

        // If no API worked
        if (!videoUrl) {
            return await sock.sendMessage(chatId, { 
                text: "*❌ Failed to download TikTok video*\n\nAll APIs are currently unavailable. Please try again later."
            });
        }

        // Send the video
        try {
            console.log('📥 Downloading video...');
            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                maxContentLength: 50 * 1024 * 1024,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'video/mp4,video/*,*/*',
                    'Referer': 'https://www.tiktok.com/'
                }
            });

            const videoBuffer = Buffer.from(videoRes.data);

            if (videoBuffer.length < 1000) {
                throw new Error('Video too small, likely an error page');
            }

            console.log(`📤 Sending video (${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB)...`);

            await sock.sendMessage(chatId, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: caption
            }, { quoted: message });

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });

            console.log('✅ TikTok video sent successfully');

        } catch (downloadErr) {
            console.log('⚠️ Buffer download failed:', downloadErr.message);
            
            // Fallback: send URL directly
            try {
                console.log('📤 Trying URL method...');
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });
                
                await sock.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });
                
                console.log('✅ TikTok video sent (URL method)');
            } catch (urlErr) {
                console.error('❌ URL method also failed:', urlErr.message);
                return await sock.sendMessage(chatId, { 
                    text: "*❌ Failed to send video. The file might be too large or the link expired.*"
                });
            }
        }

    } catch (error) {
        console.error('❌ TikTok command error:', error.message);
        await sock.sendMessage(chatId, { 
            text: "*❌ An error occurred while processing. Please try again.*"
        });
    }
}

module.exports = tiktokCommand;
