/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Welcome Command - Instant welcome for new members
 */

const { isWelcomeOn, getWelcome } = require('../lib/index');
const { handleWelcome } = require('../lib/welcome');

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
        // Fast check - skip if disabled
        const isWelcomeEnabled = await isWelcomeOn(id);
        if (!isWelcomeEnabled) return;

        // Get everything in parallel for speed
        const [customMessage, groupMetadata] = await Promise.all([
            getWelcome(id),
            sock.groupMetadata(id).catch(() => null)
        ]);

        if (!groupMetadata) return;

        const groupName = groupMetadata.subject || 'Group';
        const groupDesc = groupMetadata.desc || '';
        const memberCount = groupMetadata.participants.length;
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        for (const participant of participants) {
            const pString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = pString.split('@')[0];

            // Get name instantly from group participants
            let displayName = user;
            const p = groupMetadata.participants.find(x => x.id === pString);
            if (p?.name && p.name !== user) displayName = p.name;

            // Build message instantly
            let msg;
            if (customMessage && customMessage !== 'Welcome {user} to {group}! 🎉') {
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
                      `> *🤖 𝚆𝙰𝙻𝙻𝚈𝙹𝙰𝚈𝚃𝙴𝙲𝙷-𝙼𝙳*`;
            }

            // Send text instantly - no image API delays
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
