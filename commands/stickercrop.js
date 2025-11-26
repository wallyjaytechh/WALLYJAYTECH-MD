 const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickercropCommand(sock, chatId, message) {
    const messageToQuote = message;
    let targetMessage = message;

    // If the message is a reply, the target media is in the quoted message.
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedInfo = message.message.extendedTextMessage.contextInfo;
        targetMessage = {
            key: {
                remoteJid: chatId,
                id: quotedInfo.stanzaId,
                participant: quotedInfo.participant
            },
            message: quotedInfo.quotedMessage
        };
    }

    const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage || targetMessage.message?.documentMessage || targetMessage.message?.stickerMessage;

    if (!mediaMessage) {
        await sock.sendMessage(chatId, { 
            text: 'Please reply to an image/video/sticker with .crop, or send an image/video/sticker with .crop as the caption.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        },{ quoted: messageToQuote });
        return;
    }

    try {
        const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { 
            logger: undefined, 
            reuploadRequest: sock.updateMediaMessage 
        });

        if (!mediaBuffer) {
            await sock.sendMessage(chatId, { 
                text: 'Failed to download media. Please try again.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Generate temp file paths
        const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
        const tempOutput = path.join(tmpDir, `crop_${Date.now()}.webp`);

        // Write media to temp file
        fs.writeFileSync(tempInput, mediaBuffer);

        // Detect media type accurately
        const isSticker = targetMessage.message?.stickerMessage;
        const isVideoSticker = isSticker && targetMessage.message.stickerMessage.isAnimated;
        const isVideo = targetMessage.message?.videoMessage;
        const isGif = targetMessage.message?.documentMessage?.mimetype?.includes('gif');
        
        // Check if it's an animated WebP by trying to parse it
        let isAnimatedWebP = false;
        if (isSticker) {
            try {
                const img = new webp.Image();
                await img.load(mediaBuffer);
                // If it has anim property, it's animated
                isAnimatedWebP = img.anim !== undefined;
                console.log(`WebP sticker detected - Animated: ${isAnimatedWebP}`);
            } catch (e) {
                console.log('Could not parse WebP metadata, assuming static');
            }
        }

        const isAnimated = isVideo || isGif || isVideoSticker || isAnimatedWebP;

        console.log(`Media type: ${isVideoSticker ? 'Video Sticker' : isVideo ? 'Video' : isAnimatedWebP ? 'Animated WebP' : isSticker ? 'Static WebP' : 'Image'}, Animated: ${isAnimated}`);

        let ffmpegCommand;
        
        if (isAnimated) {
            if (isAnimatedWebP) {
                // Special handling for animated WebP stickers - convert to video first, then back to WebP
                ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512" -c:v libwebp -lossless 0 -qscale 75 -preset default -loop 0 -an -vsync 0 -r 10 -t 3 "${tempOutput}"`;
            } else if (isVideo || isGif || isVideoSticker) {
                // Regular video/GIF conversion
                ffmpegCommand = `ffmpeg -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=10" -c:v libwebp -lossless 0 -qscale 70 -preset default -loop 0 -an "${tempOutput}"`;
            }
        } else {
            // Static image/WebP conversion
            ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512" -c:v libwebp -lossless 0 -qscale 80 -preset default -loop 0 "${tempOutput}"`;
        }

        console.log(`Running FFmpeg command: ${ffmpegCommand}`);

        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('FFmpeg error:', error);
                    console.error('FFmpeg stderr:', stderr);
                    
                    // Try alternative approach for problematic files
                    console.log('Trying alternative FFmpeg approach...');
                    const altCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=256:256" -c:v libwebp -lossless 0 -qscale 50 -preset default "${tempOutput}"`;
                    
                    exec(altCommand, (altError) => {
                        if (altError) {
                            console.error('Alternative FFmpeg also failed:', altError);
                            reject(new Error('Failed to process media with FFmpeg'));
                        } else {
                            console.log('Alternative FFmpeg succeeded');
                            resolve();
                        }
                    });
                } else {
                    console.log('FFmpeg conversion successful');
                    resolve();
                }
            });
        });

        // Check if output file exists and has content
        if (!fs.existsSync(tempOutput)) {
            throw new Error('FFmpeg failed to create output file');
        }

        const outputStats = fs.statSync(tempOutput);
        if (outputStats.size === 0) {
            throw new Error('FFmpeg created empty output file');
        }

        // Read the WebP file
        let webpBuffer = fs.readFileSync(tempOutput);
        
        // Check final file size
        const finalSizeKB = webpBuffer.length / 1024;
        console.log(`Final sticker size: ${Math.round(finalSizeKB)} KB`);

        // Add metadata using webpmux
        const img = new webp.Image();
        await img.load(webpBuffer);

        // Create metadata
        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': settings.packname || 'WALLYJAYTECH-MD',
            'sticker-pack-publisher': settings.author || 'Wally Jay',
            'emojis': ['✂️']
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

        // Send the sticker
        await sock.sendMessage(chatId, { 
            sticker: finalBuffer
        },{ quoted: messageToQuote });

        // Cleanup temp files
        try {
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        } catch (err) {
            console.error('Error cleaning up temp files:', err);
        }

    } catch (error) {
        console.error('Error in stickercrop command:', error);
        await sock.sendMessage(chatId, { 
            text: `Failed to crop sticker! This media type might not be supported.\n\nError: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        },{ quoted: messageToQuote });
    }
}

module.exports = stickercropCommand;

// Helper: convert a raw media buffer to a cropped sticker using same pipeline
async function stickercropFromBuffer(inputBuffer, isAnimated) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tempInput = path.join(tmpDir, `cropbuf_${Date.now()}`);
    const tempOutput = path.join(tmpDir, `cropbuf_out_${Date.now()}.webp`);

    fs.writeFileSync(tempInput, inputBuffer);

    let ffmpegCommand;
    if (isAnimated) {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=10" -c:v libwebp -lossless 0 -qscale 70 -preset default -loop 0 -an "${tempOutput}"`;
    } else {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512" -c:v libwebp -lossless 0 -qscale 80 -preset default -loop 0 "${tempOutput}"`;
    }

    await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error) => {
            if (error) return reject(error);
            resolve();
        });
    });

    const webpBuffer = fs.readFileSync(tempOutput);

    const img = new webp.Image();
    await img.load(webpBuffer);
    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': settings.packname || 'WALLYJAYTECH-MD',
        'sticker-pack-publisher': settings.author || 'Wally Jay',
        'emojis': ['✂️']
    };
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;
    const finalBuffer = await img.save(null);

    try {
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
    } catch {}

    return finalBuffer;
}

module.exports.stickercropFromBuffer = stickercropFromBuffer;
