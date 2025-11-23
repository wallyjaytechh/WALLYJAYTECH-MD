async function getjidCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        const isGroup = chatId.endsWith('@g.us');
        
        if (isGroup) {
            // Group JID information
            await handleGroupJid(sock, chatId, message);
        } else {
            // Private chat JID information
            await handlePrivateJid(sock, chatId, message);
        }

    } catch (error) {
        console.error('Error in getjid command:', error);
        await sock.sendMessage(chatId, {
            text: '*❌ Failed to fetch JID information*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Handle group JID information
async function handleGroupJid(sock, chatId, message) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get participants with admin status
        let participants = [];
        let canFetchDetails = true;
        
        try {
            participants = await sock.groupParticipants(chatId);
        } catch (error) {
            console.error('Cannot fetch detailed participants:', error);
            canFetchDetails = false;
            participants = groupMetadata.participants || [];
        }

        // Filter admins and super admins
        const superAdmins = participants.filter(p => p.admin === 'superadmin');
        const admins = participants.filter(p => p.admin === 'admin');
        const allAdmins = [...superAdmins, ...admins];
        const regularMembers = participants.filter(p => !p.admin);

        // Create JID information
        let jidInfo = `*🏷️ GROUP JID INFORMATION*\n\n`;
        
        jidInfo += `*📛 Group Name:* ${groupMetadata.subject}\n`;
        jidInfo += `*🆔 Group JID:* ${chatId}\n`;
        jidInfo += `*👥 Total Members:* ${participants.length}\n`;
        jidInfo += `*👑 Super Admins:* ${superAdmins.length}\n`;
        jidInfo += `*⚡ Admins:* ${admins.length}\n`;
        jidInfo += `*👤 Regular Members:* ${regularMembers.length}\n\n`;

        // Add admin JIDs if available
        if (allAdmins.length > 0) {
            jidInfo += `*🔧 ADMIN JIDs:*\n`;
            allAdmins.forEach((admin, index) => {
                const name = admin.name || admin.id.split('@')[0];
                const role = admin.admin === 'superadmin' ? '👑 Owner' : '⚡ Admin';
                jidInfo += `${index + 1}. ${role} - ${admin.id}\n   Name: ${name}\n\n`;
            });
        }

        // Add sample member JIDs (first 5 to avoid message too long)
        if (regularMembers.length > 0) {
            jidInfo += `*📋 SAMPLE MEMBER JIDs (5 of ${regularMembers.length}):*\n`;
            const sampleMembers = regularMembers.slice(0, 5);
            sampleMembers.forEach((member, index) => {
                const name = member.name || member.id.split('@')[0];
                jidInfo += `${index + 1}. ${member.id}\n   Name: ${name}\n`;
                if (index < sampleMembers.length - 1) jidInfo += '\n';
            });
            
            if (regularMembers.length > 5) {
                jidInfo += `\n... and ${regularMembers.length - 5} more members`;
            }
        }

        if (!canFetchDetails) {
            jidInfo += `\n\n*⚠️ Note:* Some details limited - bot may need admin permissions`;
        }

        // Send the JID information
        await sock.sendMessage(chatId, {
            text: jidInfo,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in handleGroupJid:', error);
        await sock.sendMessage(chatId, {
            text: `*🆔 GROUP JID*\n\n*Group JID:* ${chatId}\n\n*❌ Could not fetch detailed group information*`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Handle private chat JID information
async function handlePrivateJid(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Try to get user info
        let userInfo = '';
        try {
            const [userProfile, userStatus] = await Promise.allSettled([
                sock.profilePictureUrl(senderId, 'image'),
                sock.fetchStatus(senderId)
            ]);
            
            userInfo = `*👤 User Information:*\n`;
            userInfo += `• Profile Picture: ${userProfile.status === 'fulfilled' ? '✅ Available' : '❌ Not available'}\n`;
            userInfo += `• Status: ${userStatus.status === 'fulfilled' && userStatus.value ? userStatus.value.status : 'Not available'}\n`;
        } catch (userError) {
            userInfo = `*👤 User Information:* Limited details available\n`;
        }

        const jidInfo = `*🏷️ PRIVATE CHAT JID INFORMATION*\n\n` +
                       `*🆔 Your JID:* ${senderId}\n` +
                       `*💬 Chat JID:* ${chatId}\n` +
                       `*🤖 Bot JID:* ${sock.user.id}\n\n` +
                       userInfo +
                       `\n*💡 Tip:* Use this command in a group to see group JID and member information.`;

        await sock.sendMessage(chatId, {
            text: jidInfo,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in handlePrivateJid:', error);
        await sock.sendMessage(chatId, {
            text: `*🆔 YOUR JID*\n\n*Chat JID:* ${chatId}\n*Your JID:* ${message.key.participant || chatId}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Function to get JID of mentioned users
async function getMentionedJids(sock, chatId, message) {
    try {
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJids.length === 0) {
            await sock.sendMessage(chatId, {
                text: '*❌ No users mentioned*\n\nPlease mention users to get their JIDs.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        let jidList = `*📋 MENTIONED USERS JIDs*\n\n`;
        
        for (let i = 0; i < mentionedJids.length; i++) {
            const jid = mentionedJids[i];
            try {
                const name = await sock.getName(jid);
                jidList += `${i + 1}. *${name}*\n   JID: ${jid}\n\n`;
            } catch (error) {
                jidList += `${i + 1}. *${jid.split('@')[0]}*\n   JID: ${jid}\n\n`;
            }
        }

        await sock.sendMessage(chatId, {
            text: jidList,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in getMentionedJids:', error);
        await sock.sendMessage(chatId, {
            text: '*❌ Failed to get mentioned users JIDs*'
        }, { quoted: message });
    }
}

module.exports = {
    getjidCommand,
    getMentionedJids
};
