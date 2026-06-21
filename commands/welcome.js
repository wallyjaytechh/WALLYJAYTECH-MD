/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Welcome Command - Fast welcome with group image
 * Uses bot's configured timezone
 */

const { isWelcomeOn, getWelcome } = require('../lib/index');
const { handleWelcome } = require('../lib/welcome');
const settings = require('../settings');

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

function getFormattedTime() {
    const now = new Date();
    const timezone = settings.timezone || 'Africa/Lagos';
    try {
        return now.toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true, timeZone: timezone
        });
    } catch (e) {
        return now.toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true
        });
    }
}

async function welcomeCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '';
        const match = text.split(' ').slice(1).join(' ');
        await handleWelcome(sock, chatId, message, match);
    } catch (error) {
        console.error('❌ Welcome command error:', error);
    }
}

async function handleJoinEvent(sock, id, participants) {
    try {
        const isWelcomeEnabled = await isWelcomeOn(id);
        if (!isWelcomeEnabled) return;

        const [customMessage, groupMetadata] = await Promise.all([
            getWelcome(id),
            sock.groupMetadata(id).catch(() => null)
        ]);

        if (!groupMetadata) return;

        const groupName = groupMetadata.subject || 'Group';
        const groupDesc = groupMetadata.desc || '';
        const memberCount = groupMetadata.participants.length;
        const timeString = getFormattedTime();

        // Get group picture once
        let groupPic = null;
        try {
            groupPic = await sock.profilePictureUrl(id, 'image');
        } catch (e) {}

        for (const participant of participants) {
            const pString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = pString.split('@')[0];

            // Get name from group participants
            let displayName = user;
            const p = groupMetadata.participants.find(x => x.id === pString);
            if (p?.name && p.name !== user) displayName = p.name;

            // Build message
            let msg;
            if (customMessage && !customMessage.startsWith('Welcome {user} to {group}!')) {
                msg = customMessage
                    .replace(/{user}/g, `@${displayName}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{description}/g, groupDesc)
                    .replace(/{count}/g, memberCount);
            } else {
                msg = `╭╼━≪• 𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁 •≫━╾╮\n` +
                      `┃ 👋 𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName}\n` +
                      `┃ 👥 𝙼𝚎𝚖𝚋𝚎𝚛: #${memberCount}\n` +
                      `┃ ⏰ 𝚃𝙸𝙼𝙴: ${timeString}\n` +
                      `╰━━━━━━━━━━━━━━━╯\n\n` +
                      `*@${displayName}* Welcome to *${groupName}*! 🎉\n\n` +
                      (groupDesc ? `📋 *𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗:*\n_${groupDesc}_\n\n` : '') +
                      `> *🤖 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚆𝙰𝙻𝙻𝚈𝙹𝙰𝚈𝚃𝙴𝙲𝙷-𝙼𝙳*`;
            }

            // Try to send with group image
            if (groupPic) {
                try {
                    await sock.sendMessage(id, {
                        image: { url: groupPic },
                        caption: msg,
                        mentions: [pString],
                        ...channelInfo
                    });
                    continue;
                } catch (e) {}
            }

            // Fallback text
            await sock.sendMessage(id, {
                text: msg,
                mentions: [pString],
                ...channelInfo
            }).catch(() => {});
        }
    } catch (error) {
        console.error('Error in handleJoinEvent:', error);
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
