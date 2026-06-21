const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;

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

function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

async function Antilink(msg, sock) {
    const jid = msg.key.remoteJid;
    if (!isJidGroup(jid)) return;

    const SenderMessage = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || '';
    
    if (!SenderMessage || typeof SenderMessage !== 'string') return;

    const sender = msg.key.participant;
    if (!sender) return;
    
    try {
        const { isSenderAdmin } = await isAdmin(sock, jid, sender);
        if (isSenderAdmin) return;
    } catch (_) {}
    
    const senderIsSudo = await isSudo(sender);
    if (senderIsSudo) return;

    if (!containsURL(SenderMessage.trim())) return;
    
    const antilinkConfig = await getAntilink(jid, 'on');
    if (!antilinkConfig || !antilinkConfig.enabled) return;

    const action = antilinkConfig.action || 'delete';
    const senderName = sender.split('@')[0];
    
    try {
        await sock.sendMessage(jid, { delete: msg.key });

        switch (action) {
            case 'delete':
                await sock.sendMessage(jid, { 
                    text: `🚫 *LINK DETECTED*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `👤 *User:* @${senderName}\n` +
                          `⚡ *Action:* Delete\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📌 Links are not allowed in this group.\n` +
                          `⚠️ Further violations may result in a kick.`,
                    mentions: [sender],
                    ...channelInfo
                });
                break;

            case 'kick':
                await sock.sendMessage(jid, {
                    text: `🚫 *USER KICKED*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `👤 *User:* @${senderName}\n` +
                          `⚡ *Action:* Kick\n` +
                          `📋 *Reason:* Sending links\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📌 You have been removed for violating group rules.`,
                    mentions: [sender],
                    ...channelInfo
                });
                await new Promise(r => setTimeout(r, 1000));
                await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                break;

            case 'warn':
                const warningCount = await incrementWarningCount(jid, sender);
                if (warningCount >= WARN_COUNT) {
                    await sock.sendMessage(jid, {
                        text: `🚫 *USER KICKED*\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━\n` +
                              `👤 *User:* @${senderName}\n` +
                              `⚡ *Action:* Kick\n` +
                              `📋 *Reason:* ${WARN_COUNT}/${WARN_COUNT} warnings\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━\n` +
                              `📌 Maximum warnings reached. You have been removed.`,
                        mentions: [sender],
                        ...channelInfo
                    });
                    await new Promise(r => setTimeout(r, 1000));
                    await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                    await resetWarningCount(jid, sender);
                } else {
                    await sock.sendMessage(jid, {
                        text: `⚠️ *WARNING ${warningCount}/${WARN_COUNT}*\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━\n` +
                              `👤 *User:* @${senderName}\n` +
                              `⚡ *Action:* Warn\n` +
                              `📋 *Reason:* Sending links\n` +
                              `📊 *Warnings:* ${warningCount} of ${WARN_COUNT}\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━\n` +
                              `📌 Further violations will result in a kick.`,
                        mentions: [sender],
                        ...channelInfo
                    });
                }
                break;
        }
    } catch (error) {
        console.error('❌ Antilink action error:', error);
    }
}

module.exports = { Antilink };
