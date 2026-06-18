/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Join Command - Join any WhatsApp group via link
 * Single message with live dot animation
 */

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

function getBotJid(sock) {
    return sock.user.id.split(':')[0] + '@s.whatsapp.net';
}

async function isBotAlreadyInGroup(sock, groupCode) {
    try {
        const inviteInfo = await sock.groupGetInviteInfo(groupCode).catch(() => null);
        if (!inviteInfo) return false;
        const groupId = inviteInfo.id;
        const botJid = getBotJid(sock);
        const metadata = await sock.groupMetadata(groupId).catch(() => null);
        if (!metadata) return false;
        return metadata.participants.some(p => p.id === botJid);
    } catch (error) { return false; }
}

async function joinCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);

        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👥 *JOIN COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ .join <group-link>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .join https://chat.whatsapp.com/DNk2fx5wUEeLXCQMnTkEOf\n└ .join https://chat.whatsapp.com/ABC123def456\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Note:*\n└ Only works for WhatsApp GROUP links\n└ Does NOT work for Channels\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *Group link format:*\n└ https://chat.whatsapp.com/XXXXXX`,
                ...channelInfo
            });
            return;
        }

        const link = userMessage.slice(6).trim();

        if (!link || !link.includes('chat.whatsapp.com')) {
            await sock.sendMessage(chatId, {
                text: `❌ *INVALID GROUP LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 This command only works for WhatsApp GROUP links.\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 *Valid format:*\n└ https://chat.whatsapp.com/XXXXXX\n\n━━━━━━━━━━━━━━━━━━━━\n❌ *Does NOT work for:*\n└ Channel links (whatsapp.com/channel/)\n└ Other WhatsApp links\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *Tip:* Make sure you copied a GROUP invite link.`,
                ...channelInfo
            });
            return;
        }

        const groupLinkRegex = /https?:\/\/(?:chat\.)?whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/i;
        const match = link.match(groupLinkRegex);
        if (!match) {
            await sock.sendMessage(chatId, { text: `❌ *INVALID LINK*\n\nCould not extract group code from the link.`, ...channelInfo });
            return;
        }

        const groupCode = match[1];

        // ── Send initial message ──
        const sent = await sock.sendMessage(chatId, {
            text: `🔍 *CHECKING*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`
        });

        // ── Animate dots ──
        const dots = ['', '.', '..', '...'];
        for (let i = 0; i < 4; i++) {
            await new Promise(r => setTimeout(r, 500));
            await sock.sendMessage(chatId, {
                text: `🔍 *CHECKING${dots[i]}*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`
            }, { edit: sent.key }).catch(() => {});
        }

        // ── Check if already joined ──
        const alreadyJoined = await isBotAlreadyInGroup(sock, groupCode);

        if (alreadyJoined) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *ALREADY A MEMBER*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot is already in this group!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n\n💡 No need to join again.`
            }, { edit: sent.key }).catch(() => {});
            return;
        }

        // ── Animate joining ──
        for (let i = 0; i < 4; i++) {
            await new Promise(r => setTimeout(r, 500));
            await sock.sendMessage(chatId, {
                text: `⏳ *JOINING${dots[i]}*\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`
            }, { edit: sent.key }).catch(() => {});
        }

        // ── Attempt to join ──
        try {
            const result = await sock.groupAcceptInvite(groupCode);

            if (result) {
                await sock.sendMessage(chatId, {
                    text: `✅ *SUCCESSFULLY JOINED!*\n\n━━━━━━━━━━━━━━━━━━━━\n🎉 Bot has joined the group!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📛 *Group ID:* ${result}\n\n🤖 Bot is now active in the group!`
                }, { edit: sent.key }).catch(() => {});
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Possible reasons:\n└ Invalid or expired link\n└ Group is full\n└ Link requires admin approval\n└ Bot is banned from the group\n\n💡 Please check the link and try again.`
                }, { edit: sent.key }).catch(() => {});
            }
        } catch (error) {
            let errorText = `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            if (error.message.includes('invite') || error.message.includes('Invalid')) errorText += `📌 Error: Invalid or expired invite link\n`;
            else if (error.message.includes('full')) errorText += `📌 Error: Group is full\n`;
            else if (error.message.includes('banned')) errorText += `📌 Error: Bot is banned from this group\n`;
            else if (error.message.includes('approval')) errorText += `📌 Error: Group requires admin approval\n`;
            else if (error.message.includes('already')) errorText += `📌 Error: Bot is already in this group\n`;
            else errorText += `📌 Error: ${error.message}\n`;
            errorText += `\n💡 Please try a different group link.`;

            await sock.sendMessage(chatId, {
                text: errorText
            }, { edit: sent.key }).catch(() => {});
        }

    } catch (error) {
        console.error('Join error:', error);
        await sock.sendMessage(chatId, { text: `❌ *ERROR*\n\nFailed to process join command.`, ...channelInfo });
    }
}

module.exports = { joinCommand };
