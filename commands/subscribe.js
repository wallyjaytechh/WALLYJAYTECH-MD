```javascript
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */

async function subscribeCommand(sock, chatId, message) {
    const text = `╭──◆「 *PREMIUM SUB* 」◆\n` +
        `├\n` +
        `├◇ ⭐ Unlock all premium features\n` +
        `├  └🤖 *AI* | 🎨 *Images* | 🎵 *Media*\n` +
        `├\n` +
        `├◇ *💰 Plan:*\n` +
        `├  └ *Monthly:* ₦5000\n` +
        `├  └ *Multi Currency Support*\n` +
        `├\n` +
        `├◇ *💳 Payment Methods:*\n` +
        `├\n` +
        `├◇ *1️⃣ Pay Online (Selar)*\n` +
        `├  └ *Card* | *Bank* | *USSD*\n` +
        `├\n` +
        `├◇ *2️⃣ Manual Transfer*\n` +
        `├  └ *Bank:* Opay\n` +
        `├  └ *Acct:* 8155763709\n` +
        `├  └ *Name:* Adewale Joseph\n` +
        `├\n` +
        `├◇ *📞 Contact:* +2348144317152\n` +
        `├◇ *📧 Send proof after payment*\n` +
        `├\n` +
        `╰─┬─★─☆─♪♪─◆\n\n` +
        `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
        `╰──★─☆─♪♪─◆`;

    await sock.sendMessage(chatId, {
        text: text,
        footer: 'Choose an option below',
        buttons: [
            { buttonId: 'subscribe_now', buttonText: { displayText: '💎 Subscribe Now' }, type: 1 },
            { buttonId: 'contact_support', buttonText: { displayText: '📞 Contact Support' }, type: 1 }
        ],
        headerType: 1
    }, { quoted: message });
}

module.exports = subscribeCommand;
```
