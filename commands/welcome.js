/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Welcome Command - Professional welcome messages for new members
 * Multiple API fallback for welcome images
 */

const fetch = require('node-fetch');
const { isWelcomeOn, getWelcome } = require('../lib/index');

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

// Welcome image APIs in priority order
const WELCOME_IMAGE_APIS = [
    {
        name: 'SomeRandomAPI',
        url: (username, groupName, memberCount, avatar) => 
            `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(avatar)}`
    },
    {
        name: 'FluxWavy',
        url: (username, groupName, memberCount, avatar) => 
            `https://api.fluxwavy.com/welcome?username=${encodeURIComponent(username)}&guild=${encodeURIComponent(groupName)}&members=${memberCount}&avatar=${encodeURIComponent(avatar)}`
    },
    {
        name: 'DEGEN',
        url: (username, groupName, memberCount, avatar) => 
            `https://api.degen-dev.com/welcome?username=${encodeURIComponent(username)}&group=${encodeURIComponent(groupName)}&count=${memberCount}&avatar=${encodeURIComponent(avatar)}`
    }
];

async function welcomeCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);

        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: `👋 *WELCOME COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 This command can only be used in groups.\n\n💡 Use in a group to configure welcome messages.`,
                ...channelInfo
            });
            return;
        }

        const { handleWelcome } = require('../lib/welcome');
        await handleWelcome(sock, chatId, message, args.join(' '));
    } catch (error) {
        console.error('❌ Welcome command error:', error);
    }
}

async function fetchWelcomeImage(username, groupName, memberCount, avatar) {
    for (const api of WELCOME_IMAGE_APIS) {
        try {
            console.log(`🖼️ Trying ${api.name}...`);
            const response = await fetch(api.url(username, groupName, memberCount, avatar), { timeout: 10000 });
            if (response.ok) {
                const buffer = await response.buffer();
                if (buffer.length > 1000) {
                    console.log(`✅ ${api.name} success`);
                    return buffer;
                }
            }
        } catch (e) {
            console.log(`⚠️ ${api.name} failed: ${e.message}`);
        }
    }
    return null;
}

async function getUserDisplayName(sock, participantString, groupMetadata) {
    try {
        const userParticipant = groupMetadata.participants.find(p => p.id === participantString);
        if (userParticipant?.name && userParticipant.name !== participantString.split('@')[0]) {
            return userParticipant.name;
        }
        try {
            const contact = await sock.getContact(participantString);
            if (contact?.notify) return contact.notify;
            if (contact?.name) return contact.name;
        } catch (e) {}
        try {
            const profile = await sock.getBusinessProfile(participantString);
            if (profile?.name) return profile.name;
        } catch (e) {}
    } catch (e) {}
    return participantString.split('@')[0];
}

async function handleJoinEvent(sock, id, participants) {
    try {
        const isWelcomeEnabled = await isWelcomeOn(id);
        if (!isWelcomeEnabled) return;

        const customMessage = await getWelcome(id);
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description';
        const memberCount = groupMetadata.participants.length;
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        for (const participant of participants) {
            try {
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                const displayName = await getUserDisplayName(sock, participantString, groupMetadata);

                let finalMessage;
                if (customMessage) {
                    finalMessage = customMessage
                        .replace(/{user}/g, `@${displayName}`)
                        .replace(/{group}/g, groupName)
                        .replace(/{description}/g, groupDesc)
                        .replace(/{count}/g, memberCount);
                } else {
                    finalMessage = `╭╼━≪• 𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁 •≫━╾╮\n` +
                                  `┃ 👋 𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName}\n` +
                                  `┃ 👥 𝙼𝚎𝚖𝚋𝚎𝚛: #${memberCount}\n` +
                                  `┃ ⏰ 𝚃𝙸𝙼𝙴: ${timeString}\n` +
                                  `╰━━━━━━━━━━━━━━━╯\n\n` +
                                  `*@${displayName}* Welcome to *${groupName}*! 🎉\n\n` +
                                  `📋 *𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗:*\n_${groupDesc}_\n\n` +
                                  `> *🤖 𝚆𝙰𝙻𝙻𝚈𝙹𝙰𝚈𝚃𝙴𝙲𝙷-𝙼𝙳*`;
                }

                // Try profile picture for welcome image
                let profilePicUrl = null;
                try { profilePicUrl = await sock.profilePictureUrl(participantString, 'image'); } catch (e) {}

                let imageSent = false;
                if (profilePicUrl) {
                    const welcomeImage = await fetchWelcomeImage(displayName, groupName, memberCount, profilePicUrl);
                    if (welcomeImage) {
                        await sock.sendMessage(id, {
                            image: welcomeImage,
                            caption: finalMessage,
                            mentions: [participantString],
                            ...channelInfo
                        });
                        imageSent = true;
                    }
                }

                if (!imageSent) {
                    await sock.sendMessage(id, {
                        text: finalMessage,
                        mentions: [participantString],
                        ...channelInfo
                    });
                }

            } catch (error) {
                console.error('Error sending welcome:', error);
                const pString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                await sock.sendMessage(id, {
                    text: `👋 Welcome @${pString.split('@')[0]} to *${groupMetadata.subject || 'the group'}*! 🎉\n\n> *🤖 WALLYJAYTECH-MD*`,
                    mentions: [pString],
                    ...channelInfo
                }).catch(() => {});
            }
        }
    } catch (error) {
        console.error('Error in handleJoinEvent:', error);
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
