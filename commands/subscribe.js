const fs = require('fs');
const path = require('path');
const log = (...args) => process.stderr.write(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') + '\n');

async function subscribeCommand(sock, chatId, message) {
    try {
        const caption = '╭──◆「 *PREMIUM SUB* 」◆\n' +
            '├\n' +
            '├◇ ⭐ Unlock all premium features\n' +
            '├  └🤖 *AI* | 🎨 *Images* | 🎵 *Media*\n' +
            '├\n' +
            '├◇ *💰 Plan:*\n' +
            '├  └ *Monthly:* ₦5000\n' +
            '├  └ *Multi Currency Support*\n' +
            '├\n' +
            '├◇ *1️⃣ Pay Online (Selar)*\n' +
            '├  └ *Card* | *Bank* | *USSD*\n' +
            '├\n' +
            '├◇ *2️⃣ Manual Transfer*\n' +
            '├  └ *Bank:* Opay\n' +
            '├  └ *Acct:* 8155763709\n' +
            '├  └ *Name:* Adewale Joseph\n' +
            '├\n' +
            '├◇ *📞 Contact:* +2348144317152\n' +
            '├◇ *📧 Send proof after payment*\n' +
            '├\n' +
            '╰─┬─★─☆─♪♪─◆\n\n' +
            '╭──◆「 *WALLYJAYTECH-MD* 」◆\n' +
            '╰──★─☆─♪♪─◆\n\n' +
            '🔗 *Click below to pay safely:*';

        log('📤 Sending subscribe message with card...');

        // Read the bot's own image as a local buffer instead of a remote URL
        const thumbPath = path.join(__dirname, '../assets/bot_image.jpg');
        const thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

        await sock.sendMessage(chatId, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "💎 Tap to Subscribe Now",
                    body: "Secure payment via Selar",
                    sourceUrl: "https://selar.com/b32x1354lk",
                    mediaType: 1,
                    thumbnail: thumbBuffer, // 👈 raw buffer instead of URL
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: message });

        log('✅ Subscribe message sent');

    } catch (error) {
        log('❌ Error:', error.message);
        await sock.sendMessage(chatId, { 
            text: caption + '\n\n🔗 https://selar.com/b32x1354lk' 
        }, { quoted: message });
    }
}

module.exports = subscribeCommand;
