const fetch = require('node-fetch');
const { writeExifImg } = require('../lib/exif');
const delay = time => new Promise(res => setTimeout(res, time));
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const webp = require('node-webpmux');
const crypto = require('crypto');
const { exec } = require('child_process');
const settings = require('../settings');

async function stickerTelegramCommand(sock, chatId, msg) {
    try {
        const text = msg.message?.conversation?.trim() || 
                    msg.message?.extendedTextMessage?.text?.trim() || '';
        
        const args = text.split(' ').slice(1);
        
        if (!args[0]) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ *TELEGRAM STICKER DOWNLOADER*\n\n📖 Usage: .tg <telegram_sticker_url>\n\n✨ Example: .tg https://t.me/addstickers/Porcientoreal\n\n💡 Get sticker pack URL from Telegram' 
            });
            return;
        }

        if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid URL! Must be a Telegram sticker URL.\n\nExample: https://t.me/addstickers/Porcientoreal' 
            });
            return;
        }

        const packName = args[0].replace("https://t.me/addstickers/", "");

        // ---- MULTIPLE BOT TOKENS (Try one by one) ----
        const botTokens = [
            '7301688610:AAHcVpMxJZ9h7hZwO7qE4qk3xLb8cRfZ5fY', // Token 1
            '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4', // Token 2 (old)
            '7209876543:AAHcVpMxJZ9h7hZwO7qE4qk3xLb8cRfZ5fY', // Token 3
        ];

        let stickerSet = null;
        let workingToken = null;

        for (const token of botTokens) {
            try {
                const response = await fetch(
                    `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(packName)}`,
                    { 
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "User-Agent": "Mozilla/5.0"
                        },
                        timeout: 10000
                    }
                );

                if (!response.ok) continue;

                const data = await response.json();
                if (data.ok && data.result) {
                    stickerSet = data;
                    workingToken = token;
                    console.log(`✅ Working token found: ${token}`);
                    break;
                }
            } catch (e) {
                console.log(`Token failed: ${e.message}`);
            }
        }

        if (!stickerSet || !workingToken) {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to fetch sticker pack!\n\n💡 The sticker pack may be:\n• Private or deleted\n• Contains invalid stickers\n• Temporarily unavailable\n\nTry another pack or use .sticker for images.' 
            });
            return;
        }

        // Send initial message
        await sock.sendMessage(chatId, { 
            text: `📦 Found *${stickerSet.result.stickers.length}* stickers\n⏳ Starting download...` 
        });

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        let successCount = 0;
        for (let i = 0; i < stickerSet.result.stickers.length; i++) {
            try {
                const sticker = stickerSet.result.stickers[i];
                const fileId = sticker.file_id;
                
                const fileInfo = await fetch(
                    `https://api.telegram.org/bot${workingToken}/getFile?file_id=${fileId}`
                );
                
                if (!fileInfo.ok) continue;
                
                const fileData = await fileInfo.json();
                if (!fileData.ok || !fileData.result.file_path) continue;

                const fileUrl = `https://api.telegram.org/file/bot${workingToken}/${fileData.result.file_path}`;
                const imageResponse = await fetch(fileUrl);
                const imageBuffer = await imageResponse.buffer();

                const tempInput = path.join(tmpDir, `temp_${Date.now()}_${i}`);
                const tempOutput = path.join(tmpDir, `sticker_${Date.now()}_${i}.webp`);

                fs.writeFileSync(tempInput, imageBuffer);

                const isAnimated = sticker.is_animated || sticker.is_video;
                
                const ffmpegCommand = isAnimated
                    ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
                    : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

                await new Promise((resolve, reject) => {
                    exec(ffmpegCommand, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                const webpBuffer = fs.readFileSync(tempOutput);
                const img = new webp.Image();
                await img.load(webpBuffer);

                const metadata = {
                    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                    'sticker-pack-name': settings.packname || 'WALLYJAYTECH-MD',
                    'emojis': sticker.emoji ? [sticker.emoji] : ['🤖']
                };

                const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                const jsonBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
                const exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);

                img.exif = exif;
                const finalBuffer = await img.save(null);

                await sock.sendMessage(chatId, { 
                    sticker: finalBuffer 
                });

                successCount++;
                await delay(1000);

                try {
                    fs.unlinkSync(tempInput);
                    fs.unlinkSync(tempOutput);
                } catch (err) {}

            } catch (err) {
                console.error(`Error processing sticker ${i}:`, err);
                continue;
            }
        }

        await sock.sendMessage(chatId, { 
            text: `✅ Successfully downloaded *${successCount}/${stickerSet.result.stickers.length}* stickers!` 
        });

    } catch (error) {
        console.error('Error in stickertelegram command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to process Telegram stickers!\n\n💡 Make sure:\n1. The URL is correct\n2. The sticker pack exists\n3. The sticker pack is public' 
        });
    }
}

module.exports = stickerTelegramCommand;
