 async function staffCommand(sock, chatId, msg) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        
        // Separate super admins and regular admins
        const superAdmins = participants.filter(p => p.admin === 'superadmin');
        const regularAdmins = participants.filter(p => p.admin === 'admin');
        
        // Create admin lists
        let adminList = '';
        
        if (superAdmins.length > 0) {
            adminList += '*👑 GROUP OWNERS*\n';
            superAdmins.forEach((admin, index) => {
                const name = admin.name || admin.id.split('@')[0];
                adminList += `${index + 1}. @${admin.id.split('@')[0]} (${name})\n`;
            });
            adminList += '\n';
        }
        
        if (regularAdmins.length > 0) {
            adminList += '*⚡ ADMINISTRATORS*\n';
            regularAdmins.forEach((admin, index) => {
                const name = admin.name || admin.id.split('@')[0];
                adminList += `${index + 1}. @${admin.id.split('@')[0]} (${name})\n`;
            });
        }

        // Get group owner
        const owner = groupMetadata.owner || superAdmins[0]?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create staff text with better formatting
        const text = `
🏷️ *GROUP STAFF* 🏷️

📛 *Group:* ${groupMetadata.subject}
👥 *Total Members:* ${participants.length}
👑 *Group Owners:* ${superAdmins.length}
⚡ *Administrators:* ${regularAdmins.length}
🔰 *Total Staff:* ${groupAdmins.length}

${adminList.trim()}

💡 *Use .help for more commands*
        `.trim();

        // Collect all mentions
        const allMentions = [...superAdmins.map(v => v.id), ...regularAdmins.map(v => v.id), owner];

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: allMentions
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in staff command:', error);
        await sock.sendMessage(chatId, { 
            text: '*❌ Failed to get admin list!*\n\nMake sure the bot has proper permissions.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: msg });
    }
}

module.exports = staffCommand;
