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

        log('📤 Sending subscribe message with card button...');

        await sock.sendMessage(chatId, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "💎 Tap to Subscribe Now",
                    body: "Secure payment gateway powered by Selar",
                    sourceUrl: "https://selar.com/b32x1354lk",
                    mediaType: 1,
                    // FIXED: Used a working public image URL for testing
                    thumbnailUrl: "https://imgur.com", 
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: message });

        log('✅ Subscribe message sent successfully');

    } catch (error) {
        log('❌ Error:', error.message);
        await sock.sendMessage(chatId, { 
            text: caption + '\n\n🔗 https://selar.com/b32x1354lk' 
        }, { quoted: message });
    }
}

module.exports = subscribeCommand;
