/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Antilink Command - Professional link protection
 */

const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: `❌ *ADMIN ONLY*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 This command is only available for group admins.`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const config = await getAntilink(chatId, 'on');
            const status = config?.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config?.enabled ? '🟢' : '🔴';
            const currentAction = config?.action || 'delete';
            
            await sock.sendMessage(chatId, { 
                text: `🔗 *ANTILINK SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚡ *Action:* ${currentAction}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antilink on - Enable link protection\n` +
                      `└ .antilink off - Disable link protection\n` +
                      `└ .antilink set delete - Delete links\n` +
                      `└ .antilink set kick - Delete + kick user\n` +
                      `└ .antilink set warn - Delete + warn user\n` +
                      `└ .antilink status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .antilink on\n` +
                      `└ .antilink set kick`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 Antilink is already *ON*.\n\n💡 Use .antilink off to disable.`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: `✅ *ANTILINK ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Link protection is now *ON*.\n⚡ Action: *Delete*\n\n💡 Use .antilink set kick to change action.`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'off':
                const configOff = await getAntilink(chatId, 'on');
                if (!configOff?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 Antilink is already *OFF*.\n\n💡 Use .antilink on to enable.`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `❌ *ANTILINK DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Link protection is now *OFF*.\n\n💡 Use .antilink on to enable.`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antilink set <delete/kick/warn>\n\n✨ *Example:*\n└ .antilink set kick`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *INVALID ACTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Choose: delete, kick, or warn`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: `⚡ *ACTION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Antilink action set to: *${setAction}*`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'status':
                const configStatus = await getAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `🔗 *ANTILINK STATUS*\n\n━━━━━━━━━━━━━━━━━━━━\n🟢 Status: ${configStatus?.enabled ? '✅ ON' : '❌ OFF'}\n⚡ Action: ${configStatus?.action || 'Not set'}`,
                    ...channelInfo
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .antilink to see options.`,
                    ...channelInfo
                });
        }
    } catch (error) {
        console.error('❌ Antilink command error:', error);
    }
}

module.exports = { handleAntilinkCommand };
