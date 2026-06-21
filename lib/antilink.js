const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;

function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

async function Antilink(msg, sock) {
    const jid = msg.key.remoteJid;
    if (!isJidGroup(jid)) return;

    const SenderMessage = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || '';
    
    console.log('🔗 Antilink check:', SenderMessage);
    
    if (!SenderMessage || typeof SenderMessage !== 'string') return;

    const sender = msg.key.participant;
    if (!sender) return;
    
    try {
        const { isSenderAdmin } = await isAdmin(sock, jid, sender);
        if (isSenderAdmin) {
            console.log('⏭️ Sender is admin, skipping');
            return;
        }
    } catch (_) {}
    
    const senderIsSudo = await isSudo(sender);
    if (senderIsSudo) {
        console.log('⏭️ Sender is sudo, skipping');
        return;
    }

    const hasUrl = containsURL(SenderMessage.trim());
    console.log('🔗 Has URL:', hasUrl);
    
    if (!hasUrl) return;
    
    const antilinkConfig = await getAntilink(jid, 'on');
    console.log('🔗 Antilink config:', JSON.stringify(antilinkConfig));
    
    if (!antilinkConfig || !antilinkConfig.enabled) {
        console.log('⏭️ Antilink not enabled');
        return;
    }

    const action = antilinkConfig.action || 'delete';
    console.log('🔗 Action:', action);
    
    try {
        await sock.sendMessage(jid, { delete: msg.key });
        console.log('✅ Message deleted');

        switch (action) {
            case 'delete':
                await sock.sendMessage(jid, { 
                    text: `🚫 *LINK DETECTED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 @${sender.split('@')[0]} links are not allowed here!`,
                    mentions: [sender] 
                });
                break;

            case 'kick':
                await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                await sock.sendMessage(jid, {
                    text: `🚫 *USER KICKED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 @${sender.split('@')[0]} has been kicked for sending links.`,
                    mentions: [sender]
                });
                break;

            case 'warn':
                const warningCount = await incrementWarningCount(jid, sender);
                if (warningCount >= WARN_COUNT) {
                    await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                    await resetWarningCount(jid, sender);
                    await sock.sendMessage(jid, {
                        text: `🚫 *USER KICKED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 @${sender.split('@')[0]} kicked after ${WARN_COUNT} warnings.`,
                        mentions: [sender]
                    });
                } else {
                    await sock.sendMessage(jid, {
                        text: `⚠️ *WARNING ${warningCount}/${WARN_COUNT}*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 @${sender.split('@')[0]} no links allowed!`,
                        mentions: [sender]
                    });
                }
                break;
        }
    } catch (error) {
        console.error('❌ Antilink error:', error);
    }
}

module.exports = { Antilink };
