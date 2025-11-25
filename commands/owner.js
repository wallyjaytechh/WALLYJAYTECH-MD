const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    try {
        // Enhanced vCard with social media and professional details
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
N:;${settings.botOwner};;;
ORG:WALLYJAYTECH-MD;
TITLE:Bot Developer & Owner
TEL;type=CELL;type=VOICE;type=pref;waid=${settings.ownerNumber}:+${settings.ownerNumber}
EMAIL:${settings.botOwner.toLowerCase().replace(/\s+/g, '')}@gmail.com
URL:https://github.com/wallyjaytechh
URL:https://youtube.com/@wallyjaytechy
NOTE:Official ${settings.botName} Bot Owner. Contact for support, customization, and collaboration.
X-ABLabel:WhatsApp Bot Developer
END:VCARD`.trim();

        // Send professional contact card
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: `${settings.botOwner} 👑`,
                contacts: [{ vcard }]
            }
        });

        // Send comprehensive info message
        await sock.sendMessage(chatId, {
            text: `🌟 *OFFICIAL BOT OWNER* 🌟

👤 *Name:* ${settings.botOwner}
📞 *WhatsApp:* +${settings.ownerNumber}
🤖 *Bot Version:* ${settings.version}
📍 *Timezone:* ${settings.timezone}

📧 *Contact For:*
• 🤖 Bot Support & Issues
• 💼 Custom Bot Development
• 🔧 Feature Requests
• 🐛 Bug Reports
• 🤝 Collaboration

🌐 *Connect:*
📷 YouTube: @wallyjaytechy
💻 GitHub: wallyjaytechh

*"Quality bots for better messaging experience"* ✨`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        console.log(`🎯 Owner info sent to ${chatId}`);

    } catch (error) {
        console.error('❌ Owner command failed:', error);
        
        // Enhanced fallback message
        await sock.sendMessage(chatId, {
            text: `👑 *CONTACT THE OWNER* 👑

*${settings.botOwner}*
📱 +${settings.ownerNumber}

*Bot:* ${settings.botName} v${settings.version}

💬 *Available for:*
• Support & Help
• Custom Development
• Bug Fixes
• New Features

🚀 *Powered by WALLYJAYTECH-MD*`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = ownerCommand;
