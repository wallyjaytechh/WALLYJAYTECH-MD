/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Welcome Command - Professional welcome messages for new members
 */

const fetch = require('node-fetch');
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
        const isWelcomeEnabled = await isWelcomeOn(id);
        if (!isWelcomeEnabled) return;

        const customMessage = await getWelcome(id);
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;
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

            // Get display name fast
            let displayName = user;
            try {
                const p = groupMetadata.participants.find(x => x.id === pString);
                if (p?.name) displayName = p.name;
            } catch (e) {}

            // Build message
            let msg;
            if (customMessage) {
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

            // Try group picture for welcome image - send immediately
            let sent = false;
            try {
                const groupPic = await sock.profilePictureUrl(id, 'image').catch(() => null);
                const userPic = await sock.profilePictureUrl(pString, 'image').catch(() => null);
                
                if (userPic) {
                    try {
                        const imgRes = await fetch(`https://api.fluxwavy.com/welcome?username=${encodeURIComponent(displayName)}&guild=${encodeURIComponent(groupName)}&members=${memberCount}&avatar=${encodeURIComponent(userPic)}`);
                        if (imgRes.ok) {
                            const buf = await imgRes.buffer();
                            if (buf.length > 1000) {
                                await sock.sendMessage(id, { image: buf, caption: msg, mentions: [pString], ...channelInfo });
                                sent = true;
                            }
                        }
                    } catch (e) {}
                }
            } catch (e) {}

            // Text fallback - fast
            if (!sent) {
                await sock.sendMessage(id, { text: msg, mentions: [pString], ...channelInfo });
            }
        }
    } catch (error) {
        console.error('Error in handleJoinEvent:', error);
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
