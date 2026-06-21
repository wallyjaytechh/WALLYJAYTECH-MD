/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Welcome/Goodbye Message Handler
 * Professional Version
 */

const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');

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

async function handleWelcome(sock, chatId, message, match) {
    try {
        if (!match) {
            const isOn = await isWelcomeOn(chatId);
            await sock.sendMessage(chatId, {
                text: `👋 *WELCOME MESSAGE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Status:* ${isOn ? '✅ ENABLED' : '❌ DISABLED'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .welcome on - Enable welcome messages\n` +
                      `└ .welcome off - Disable welcome messages\n` +
                      `└ .welcome set <message> - Set custom message\n` +
                      `└ .welcome - Show this menu\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📋 *Available Variables:*\n` +
                      `└ {user} - Mentions new member\n` +
                      `└ {group} - Group name\n` +
                      `└ {description} - Group description\n` +
                      `└ {count} - Member count\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .welcome set Welcome {user} to {group}! 🎉\n` +
                      `└ .welcome on`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const [command, ...args] = match.split(' ');
        const lowerCommand = command.toLowerCase();
        const customMessage = args.join(' ');

        if (lowerCommand === 'on') {
            if (await isWelcomeOn(chatId)) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👋 Welcome messages are already *ON*.\n\n💡 Use .welcome off to disable.`,
                    ...channelInfo
                });
                return;
            }
            await addWelcome(chatId, true, 'Welcome {user} to {group}! 🎉');
            await sock.sendMessage(chatId, { 
                text: `✅ *WELCOME ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Welcome messages are now *ON*.\n💡 Use .welcome set <message> to customize.\n\n📋 *Variables:* {user}, {group}, {description}, {count}`,
                ...channelInfo
            });
            return;
        }

        if (lowerCommand === 'off') {
            if (!(await isWelcomeOn(chatId))) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👋 Welcome messages are already *OFF*.\n\n💡 Use .welcome on to enable.`,
                    ...channelInfo
                });
                return;
            }
            await delWelcome(chatId);
            await sock.sendMessage(chatId, { 
                text: `❌ *WELCOME DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Welcome messages are now *OFF*.\n\n💡 Use .welcome on to enable.`,
                ...channelInfo
            });
            return;
        }

        if (lowerCommand === 'set') {
            if (!customMessage) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .welcome set <message>\n\n✨ *Example:*\n└ .welcome set Welcome {user} to {group}!`,
                    ...channelInfo
                });
                return;
            }
            await addWelcome(chatId, true, customMessage);
            await sock.sendMessage(chatId, { 
                text: `✅ *CUSTOM MESSAGE SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Welcome message updated successfully.\n\n📝 *Preview:*\n_${customMessage}_`,
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, { 
            text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use: .welcome on/off/set`,
            ...channelInfo
        });
    } catch (error) {
        console.error('❌ Welcome handler error:', error);
    }
}

async function handleGoodbye(sock, chatId, message, match) {
    try {
        const lower = match?.toLowerCase();

        if (!match) {
            const isOn = await isGoodByeOn(chatId);
            await sock.sendMessage(chatId, {
                text: `👋 *GOODBYE MESSAGE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Status:* ${isOn ? '✅ ENABLED' : '❌ DISABLED'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .goodbye on - Enable goodbye messages\n` +
                      `└ .goodbye off - Disable goodbye messages\n` +
                      `└ .goodbye set <message> - Set custom message\n` +
                      `└ .goodbye - Show this menu\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📋 *Available Variables:*\n` +
                      `└ {user} - Mentions leaving member\n` +
                      `└ {group} - Group name\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .goodbye set Goodbye {user} from {group}! 👋\n` +
                      `└ .goodbye on`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (lower === 'on') {
            if (await isGoodByeOn(chatId)) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👋 Goodbye messages are already *ON*.\n\n💡 Use .goodbye off to disable.`,
                    ...channelInfo
                });
                return;
            }
            await addGoodbye(chatId, true, 'Goodbye {user} 👋');
            await sock.sendMessage(chatId, { 
                text: `✅ *GOODBYE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Goodbye messages are now *ON*.\n💡 Use .goodbye set <message> to customize.`,
                ...channelInfo
            });
            return;
        }

        if (lower === 'off') {
            if (!(await isGoodByeOn(chatId))) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👋 Goodbye messages are already *OFF*.\n\n💡 Use .goodbye on to enable.`,
                    ...channelInfo
                });
                return;
            }
            await delGoodBye(chatId);
            await sock.sendMessage(chatId, { 
                text: `❌ *GOODBYE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Goodbye messages are now *OFF*.\n\n💡 Use .goodbye on to enable.`,
                ...channelInfo
            });
            return;
        }

        if (lower.startsWith('set ')) {
            const customMessage = match.substring(4);
            if (!customMessage) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .goodbye set <message>\n\n✨ *Example:*\n└ .goodbye set Goodbye {user}!`,
                    ...channelInfo
                });
                return;
            }
            await addGoodbye(chatId, true, customMessage);
            await sock.sendMessage(chatId, { 
                text: `✅ *CUSTOM MESSAGE SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Goodbye message updated successfully.\n\n📝 *Preview:*\n_${customMessage}_`,
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, { 
            text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use: .goodbye on/off/set`,
            ...channelInfo
        });
    } catch (error) {
        console.error('❌ Goodbye handler error:', error);
    }
}

module.exports = { handleWelcome, handleGoodbye };
