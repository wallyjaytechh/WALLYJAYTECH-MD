/**
 * WALLYJAYTECH-MD - AI Video Generation Command (.aivideo)
 * Powered by Hugging Face Inference API (Free & Open Source)
 */

const axios = require('axios');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');

const LOADING_FRAMES = [
    'Generating video [■□□□□□□□□□]',
    'Generating video [■■□□□□□□□□]',
    'Generating video [■■■□□□□□□□]',
    'Generating video [■■■■□□□□□□]',
    'Generating video [■■■■■□□□□□]',
    'Generating video [■■■■■■□□□□]',
    'Generating video [■■■■■■■□□□]',
    'Generating video [■■■■■■■■□□]',
    'Generating video [■■■■■■■■■□]'
];

async function aivideoCommand(sock, chatId, message) {
    let loadingMsg;
    let interval;

    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *AI VIDEO GENERATION* 」◆\n` +
                      `├\n` +
                      `├◇ 🎬 Generate AI videos from text\n` +
                      `├◇ 🤖 Powered by Hugging Face\n` +
                      `├◇ 🆓 Free — No limits\n` +
                      `├\n` +
                      `├◇ *📖 Usage:*\n` +
                      `├  └ .aivideo <prompt>\n` +
                      `├\n` +
                      `├◇ *✨ Example:*\n` +
                      `├  └ .aivideo a cat walking on beach\n` +
                      `├\n` +
                      `╰─┬─★─☆─♪♪─◆\n\n` +
                      `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                      `╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // Check for API Token
        if (!settings.HF_TOKEN || settings.HF_TOKEN === "hf_your_token_here" || settings.HF_TOKEN === "") {
            return sock.sendMessage(chatId, {
                text: `❌ *Missing API Token!*\n\nAsk the owner to add their free Hugging Face token in \`settings.js\` to use this feature.`
            }, { quoted: message });
        }

        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] }, { quoted: message });

        let frame = 0;
        interval = setInterval(async () => {
            try {
                if (frame < LOADING_FRAMES.length - 1) {
                    frame++;
                    await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] });
                }
            } catch (e) {}
        }, 3000);

        // Call Hugging Face Inference API (WAN 2.1)
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/Wan-AI/Wan2.1-T2V-14B",
            {
                inputs: query,
                parameters: {
                    negative_prompt: "low quality, blurry, static, watermark",
                    num_inference_steps: 25,
                    num_frames: 24
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${settings.HF_TOKEN}`,
                    "Content-Type": "application/json",
                    "Accept": "video/mp4"
                },
                responseType: 'arraybuffer',
                timeout: 180000 // 3 minutes timeout
            }
        );

        clearInterval(interval);

        if (!response.data || response.data.byteLength < 10000) {
            throw new Error("Invalid response format or too small file.");
        }

        const outputDir = './temp';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        const localPath = path.join(outputDir, `aivideo_${Date.now()}.mp4`);
        
        fs.writeFileSync(localPath, Buffer.from(response.data));

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        await sock.sendMessage(chatId, {
            video: fs.readFileSync(localPath),
            mimetype: 'video/mp4',
            caption: `╭──◆「 *AI VIDEO GENERATED* 」◆\n├\n├◇ 🎬 *Prompt:* ${query}\n├◇ ✅ *Status:* Success!\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });

        // Cleanup file after 10 seconds
        setTimeout(() => { if (fs.existsSync(localPath)) fs.unlinkSync(localPath); }, 10000);

    } catch (error) {
        if (interval) clearInterval(interval);
        console.error('AI Video error:', error.message);
        
        if (loadingMsg) { 
            try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' }); } catch (e) {} 
        }
        
        let errorMsg = "Unable to generate video. The free server might be overloaded.";
        if (error.response?.status === 503) {
            errorMsg = "The AI model is currently loading on the server. Please try again in 2 minutes.";
        } else if (error.response?.status === 401) {
            errorMsg = "Invalid Hugging Face Token. Please check `settings.js`.";
        }

        await sock.sendMessage(chatId, {
            text: `╭──◆「 *AI VIDEO FAILED* 」◆\n├\n├◇ ❌ ${errorMsg}\n├◇ 💡 Try a different prompt\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });
    }
}

module.exports = aivideoCommand;
