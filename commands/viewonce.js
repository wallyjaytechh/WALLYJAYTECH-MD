// commands/viewonce.js - FULL FIXED VERSION
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');
const langManager = require('../language/manager');

// ---- TRANSLATIONS ----
const translations = {
    'en': {
        title: "VIEW ONCE REVEALER",
        processing: "Processing view-once media...",
        not_view_once: "This is not a view-once message!",
        reply_prompt: "📸 Reply to a view-once message with .vv",
        revealed: "🔓 Media revealed in this chat",
        sent_owner: "✅ View-once media sent to owner DM! 🔒",
        only_owner: "Only the bot owner can see it.",
        stealth: "🔒 Media revealed stealthily 🎭",
        unsupported: "Unsupported view-once type!",
        image_revealed: "📸 View Once Image Revealed! 🔓",
        video_revealed: "🎥 View Once Video Revealed! 🔓",
        voice_revealed: "🎵 View Once Voice Revealed! 🔓",
        from: "From",
        time: "Time",
        powered_by: "Powered by WALLYJAYTECH-MD",
        owner_dm_issue: "Owner DM Issue: Make sure the bot is in your contacts!",
        recovery_failed: "Recovery failed!",
        error: "Error"
    },
    // ... other languages ...
};

function getTranslation(langCode, key) {
    return translations[langCode]?.[key] || translations['en'][key] || key;
}

function buildStyledMessage(styleId, title, contentLines) {
    let menu = `╭──◆「 *${title}* 」◆\n├\n`;
    for (const line of contentLines) {
        menu += `├◇ ${line}\n`;
    }
    menu += `├\n╰─┬─★─☆─♪♪─★\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    return menu;
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function viewOnceCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);

        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();

        // ---- CHECK IF REPLIED TO A MESSAGE ----
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            const content = [
                '📸 Reply to a view-once message with .vv',
                '',
                '*Usage:* .vv',
                '*Options:*',
                '  └ .vv       → Reveal in chat',
                '  └ .vv dm    → Send to owner DM',
                '  └ .vv silent → Reveal stealthily'
            ];
            let msg = buildStyledMessage(styleId, t('title'), content);
            msg = applyFont(msg, fontId);
            return await sock.sendMessage(chatId, { text: msg }, { quoted: message });
        }

        // ---- FIND VIEW-ONCE CONTENT ----
        let viewOnceContent = null;
        let foundPath = '';

        // Check all possible paths
        if (quotedMessage.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.viewOnceMessageV2;
            foundPath = 'viewOnceMessageV2';
        } else if (quotedMessage.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.viewOnceMessageV2Extension;
            foundPath = 'viewOnceMessageV2Extension';
        } else if (quotedMessage.viewOnceMessage) {
            viewOnceContent = quotedMessage.viewOnceMessage;
            foundPath = 'viewOnceMessage';
        } else if (quotedMessage.message?.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.message.viewOnceMessageV2;
            foundPath = 'message.viewOnceMessageV2';
        } else if (quotedMessage.message?.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.message.viewOnceMessageV2Extension;
            foundPath = 'message.viewOnceMessageV2Extension';
        } else if (quotedMessage.message?.viewOnceMessage) {
            viewOnceContent = quotedMessage.message.viewOnceMessage;
            foundPath = 'message.viewOnceMessage';
        } else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2;
            foundPath = 'ephemeralMessage.message.viewOnceMessageV2';
        } else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessageV2Extension) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessageV2Extension;
            foundPath = 'ephemeralMessage.message.viewOnceMessageV2Extension';
        } else if (quotedMessage.ephemeralMessage?.message?.viewOnceMessage) {
            viewOnceContent = quotedMessage.ephemeralMessage.message.viewOnceMessage;
            foundPath = 'ephemeralMessage.message.viewOnceMessage';
        }

        // ---- CHECK FOR viewOnce FLAG ON DIRECT MEDIA ----
        if (!viewOnceContent) {
            if (quotedMessage.imageMessage?.viewOnce === true || quotedMessage.imageMessage?.isViewOnce === true) {
                viewOnceContent = { message: { imageMessage: quotedMessage.imageMessage } };
                foundPath = 'imageMessage (viewOnce: true)';
            } else if (quotedMessage.videoMessage?.viewOnce === true || quotedMessage.videoMessage?.isViewOnce === true) {
                viewOnceContent = { message: { videoMessage: quotedMessage.videoMessage } };
                foundPath = 'videoMessage (viewOnce: true)';
            } else if (quotedMessage.audioMessage?.viewOnce === true || quotedMessage.audioMessage?.isViewOnce === true) {
                viewOnceContent = { message: { audioMessage: quotedMessage.audioMessage } };
                foundPath = 'audioMessage (viewOnce: true)';
            }
        }

        console.log('🔍 FOUND PATH:', foundPath);

        if (!viewOnceContent) {
            const content = ['❌ This is not a view-once message!'];
            let msg = buildStyledMessage(styleId, t('error'), content);
            msg = applyFont(msg, fontId);
            return await sock.sendMessage(chatId, { text: msg }, { quoted: message });
        }

        // ---- PROCESS VIEW-ONCE MEDIA ----
        await sock.sendMessage(chatId, { 
            text: '⏳ ' + t('processing')
        }, { quoted: message });

        const mediaMsg = viewOnceContent.message || viewOnceContent;
        let mediaMessage = null;

        if (mediaMsg?.imageMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.imageMessage, 'image');
            const buffer = await streamToBuffer(stream);
            const caption = `${t('image_revealed')}\n\n*${t('powered_by')}*`;
            mediaMessage = { image: buffer, caption: caption };
        } else if (mediaMsg?.videoMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.videoMessage, 'video');
            const buffer = await streamToBuffer(stream);
            const caption = `${t('video_revealed')}\n\n*${t('powered_by')}*`;
            mediaMessage = { video: buffer, caption: caption };
        } else if (mediaMsg?.audioMessage) {
            const stream = await downloadContentFromMessage(mediaMsg.audioMessage, 'audio');
            const buffer = await streamToBuffer(stream);
            const caption = `${t('voice_revealed')}\n\n*${t('powered_by')}*`;
            mediaMessage = {
                audio: buffer,
                ptt: mediaMsg.audioMessage.ptt === true,
                mimetype: mediaMsg.audioMessage.mimetype || 'audio/ogg; codecs=opus',
                caption: caption
            };
        } else {
            const content = ['❌ ' + t('unsupported')];
            let msg = buildStyledMessage(styleId, t('error'), content);
            msg = applyFont(msg, fontId);
            await sock.sendMessage(chatId, { text: msg }, { quoted: message });
            return;
        }

        // ---- SEND REVEALED MEDIA ----
        await sock.sendMessage(chatId, mediaMessage, { quoted: message });

        const content = ['🔓 ' + t('revealed')];
        let msg = buildStyledMessage(styleId, t('title'), content);
        msg = applyFont(msg, fontId);
        await sock.sendMessage(chatId, { text: msg }, { quoted: message });

    } catch (error) {
        console.error('ViewOnce Error:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = viewOnceCommand;
