const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

// Add this at the top if you don't have it
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
            '╰──★─☆─♪♪─◆';

        log('📤 Sending subscribe message...');

        const buttonMessage = {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: { text: caption },
                footer: { text: 'WALLYJAYTECH-MD' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '💎 Subscribe Now',
                                url: 'https://selar.com/b32x1354lk'
                            })
                        }
                    ]
                }
            })
        };

        const msgData = await generateWAMessageFromContent(chatId, buttonMessage, { quoted: message });
        await sock.relayMessage(chatId, msgData.message, { messageId: msgData.key.id });
        log('✅ Subscribe message sent');
    } catch (error) {
        log('❌ Subscribe error:', error.message);
        // Fallback
        await sock.sendMessage(chatId, { 
            text: caption + '\n\n🔗 https://selar.com/b32x1354lk' 
        }, { quoted: message });
    }
}

module.exports = subscribeCommand;
