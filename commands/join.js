/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Join Command - Join any WhatsApp group via link
 * Single message with live editing
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

// Live edit a message with animation
async function liveEdit(sock, chatId, msgKey, baseText, dots) {
    try {
        await sock.sendMessage(chatId, {
            edit: {
                key: msgKey,
                text: baseText + '.'.repeat(dots) + '   '
            }
        });
    } catch (e) {}
}

async function joinCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);

        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👥 *JOIN COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ .join <group-link>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .join https://chat.whatsapp.com/XXXXXX\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Note:* Only works for WhatsApp GROUP links`,
                ...channelInfo
            });
            return;
        }

        const link = userMessage.slice(6).trim();
        
        if (!link || !link.includes('chat.whatsapp.com')) {
            await sock.sendMessage(chatId, {
                text: `❌ *INVALID GROUP LINK*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Only WhatsApp GROUP links work.\n🔗 Format: https://chat.whatsapp.com/XXXXXX`,
                ...channelInfo
            });
            return;
        }

        const groupLinkRegex = /https?:\/\/(?:chat\.)?whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/i;
        const match = link.match(groupLinkRegex);
        if (!match) {
            await sock.sendMessage(chatId, { text: `❌ *INVALID LINK*\n\nCould not extract group code.`, ...channelInfo });
            return;
        }

        const groupCode = match[1];

        // ── SINGLE MESSAGE with live edits ──
        const statusMsg = await sock.sendMessage(chatId, {
            text: `🔍 *CHECKING* .\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`
        });

        // Animate dots while checking
        for (let i = 1; i <= 3; i++) {
            await new Promise(r => setTimeout(r, 400));
            await liveEdit(sock, chatId, statusMsg.key, `🔍 *CHECKING* ${'.'.repeat(i)}\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`, i);
        }

        // Check if already joined
        const alreadyJoined = await isBotAlreadyInGroup(sock, groupCode);
        
        if (alreadyJoined) {
            await sock.sendMessage(chatId, {
                edit: {
                    key: statusMsg.key,
                    text: `⚠️ *ALREADY A MEMBER*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot is already in this group!\n🔗 ${link}\n\n💡 No need to join again.`
                }
            });
            return;
        }

        // Animate joining
        for (let i = 1; i <= 3; i++) {
            await new Promise(r => setTimeout(r, 400));
            await liveEdit(sock, chatId, statusMsg.key, `⏳ *JOINING* ${'.'.repeat(i)}\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 ${link}\n📌 Code: ${groupCode}`, i);
        }

        try {
            const result = await sock.groupAcceptInvite(groupCode);
            
            if (result) {
                await sock.sendMessage(chatId, {
                    edit: {
                        key: statusMsg.key,
                        text: `✅ *SUCCESSFULLY JOINED!*\n\n━━━━━━━━━━━━━━━━━━━━\n🎉 Bot has joined the group!\n🔗 ${link}\n📛 Group: ${result}\n\n🤖 Bot is now active!`
                    }
                });
            } else {
                await sock.sendMessage(chatId, {
                    edit: {
                        key: statusMsg.key,
                        text: `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Reasons:\n└ Invalid/expired link\n└ Group is full\n└ Admin approval required\n└ Bot is banned\n\n💡 Try a different link.`
                    }
                });
            }
        } catch (error) {
            let errText = `❌ *FAILED TO JOIN*\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            if (error.message.includes('invite') || error.message.includes('Invalid')) errText += `📌 Invalid or expired link\n`;
            else if (error.message.includes('full')) errText += `📌 Group is full\n`;
            else if (error.message.includes('banned')) errText += `📌 Bot is banned\n`;
            else if (error.message.includes('approval')) errText += `📌 Admin approval required\n`;
            else if (error.message.includes('already')) errText += `📌 Bot already in group\n`;
            else errText += `📌 ${error.message}\n`;
            errText += `\n💡 Try a different link.`;
            
            await sock.sendMessage(chatId, { edit: { key: statusMsg.key, text: errText } });
        }

    } catch (error) {
        console.error('Join error:', error);
        await sock.sendMessage(chatId, { text: `❌ *ERROR*\n\nFailed to process join command.`, ...channelInfo });
    }
}

module.exports = { joinCommand };
