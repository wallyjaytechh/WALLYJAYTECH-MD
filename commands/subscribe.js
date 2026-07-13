Alright, let's try a different proto structure that's proven to work with Baileys `7.0.0-rc.15`:

```js
const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

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

        const message2 = await generateWAMessageFromContent(
            chatId,
            {
                interactiveMessage: {
                    body: { text: caption },
                    footer: { text: '© WALLYJAYTECH-MD' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '💎 Subscribe Now',
                                    url: 'https://selar.com/b32x1354lk',
                                    merchant_url: 'https://selar.com/b32x1354lk'
                                })
                            }
                        ]
                    }
                }
            },
            { quoted: message }
        );

        await sock.relayMessage(chatId, message2.message, { messageId: message2.key.id });
        log('✅ Subscribe message with button sent');
    } catch (error) {
        log('❌ Subscribe error:', error.message);
        log('Error stack:', error.stack);
        // Fallback
        await sock.sendMessage(chatId, { 
            text: caption + '\n\n🔗 https://selar.com/b32x1354lk' 
        }, { quoted: message });
    }
}

module.exports = subscribeCommand;
```

Key changes:
- Removed `.fromObject()` — just pass the plain object
- Added `merchant_url` param (some versions need it)
- Added detailed error logging so we see what actually breaks

If it still doesn't work, the error log will tell us exactly what's wrong. Run it and paste the full error you get.
