const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');

async function emojimixCommand(sock, chatId, msg) {
    try {
        // Get the text after command
        const text = msg.message?.conversation?.trim() || 
                    msg.message?.extendedTextMessage?.text?.trim() || '';
        
        const args = text.split(' ').slice(1);
        
        if (!args[0]) {
            await sock.sendMessage(chatId, { 
                text: '🎴 *EMOJI MIXER*\n\n*Usage:* .emojimix 😊+😂\n*Example:* .emojimix 😎+❤️' 
            });
            return;
        }

        if (!text.includes('+')) {
            await sock.sendMessage(chatId, { 
                text: '⚡ *EMOJI MIXER*\n\nPlease separate emojis with a *+* symbol\n\n*Format:* .emojimix [emoji1]+[emoji2]\n*Example:* .emojimix 😊+😂' 
            });
            return;
        }

        let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());

        // Validate emojis
        if (!emoji1 || !emoji2) {
            await sock.sendMessage(chatId, { 
                text: '❌ *INVALID INPUT*\n\nPlease provide two valid emojis separated by +\n\n*Example:* .emojimix 😎+🥰' 
            });
            return;
        }

        // Using Tenor API endpoint
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ *EMOJI COMBINATION ERROR*\n\nThese emojis cannot be mixed. Try different combinations.\n\n*Working Examples:*\n• 😂+😊\n• ❤️+🔥\n• 🎉+✨' 
            });
            return;
        }

        // Get the first result URL
        const imageUrl = data.results[0].url;

        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Generate random filenames with escaped paths
        const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
        const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');

        // Download and save the image
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.buffer();
        fs.writeFileSync(tempFile, buffer);

        // Convert to WebP using ffmpeg with proper path escaping
        const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;
        
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) {
                    console.error('FFmpeg error:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Check if output file exists
        if (!fs.existsSync(outputFile)) {
            throw new Error('Failed to create sticker file');
        }

        // Read the WebP file
        let webpBuffer = fs.readFileSync(outputFile);

        // Add metadata using webpmux
        const img = new webp.Image();
        await img.load(webpBuffer);

        // Create metadata with packname
        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': settings.packname || 'WALLYJAYTECH-MD',
            'sticker-pack-publisher': settings.author || 'Wally Jay',
            'emojis': [emoji1, emoji2]
        };

        // Create exif buffer
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        // Set the exif data
        img.exif = exif;

        // Get the final buffer with metadata
        const finalBuffer = await img.save(null);

        // Send the sticker with professional context
        await sock.sendMessage(chatId, { 
            sticker: finalBuffer 
        }, { 
            quoted: msg 
        });

        // Cleanup temp files
        try {
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);
        } catch (err) {
            console.error('Error cleaning up temp files:', err);
        }

    } catch (error) {
        console.error('Error in emojimix command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *PROCESSING ERROR*\n\nFailed to create emoji mix. Please ensure:\n• You\'re using valid emoji combinations\n• Stable internet connection\n• Try popular combinations\n\n*Working Examples:*\n.emojimix 😂+😊\n.emojimix ❤️+🔥\n.emojimix 🎉+✨' 
        }, { 
            quoted: msg 
        });
    }
}

module.exports = emojimixCommand;
