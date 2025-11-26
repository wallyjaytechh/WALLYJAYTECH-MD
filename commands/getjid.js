 const os = require('os');
const process = require('process');

async function getjidCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        const isGroup = chatId.endsWith('@g.us');
        
        if (isGroup) {
            // Enhanced Group JID information
            await handleGroupJid(sock, chatId, message);
        } else {
            // Enhanced Private chat JID information
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

// Enhanced Group JID information
async function handleGroupJid(sock, chatId, message) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Get bot performance metrics
        const botUptime = formatUptime(process.uptime());
        const memoryUsage = process.memoryUsage();
        const memoryMB = Math.round(memoryUsage.rss / 1024 / 1024);

        // Filter participants by role
        const superAdmins = participants.filter(p => p.admin === 'superadmin');
        const admins = participants.filter(p => p.admin === 'admin');
        const allAdmins = [...superAdmins, ...admins];
        const regularMembers = participants.filter(p => !p.admin);

        // Create professional JID information
        let jidInfo = `*🔐 GROUP INFORMATION PANEL*\n\n`;
        
        jidInfo += `*🏷️ GROUP DETAILS:*\n`;
        jidInfo += `📛 Name: ${groupMetadata.subject || 'Unnamed'}\n`;
        jidInfo += `🆔 JID: ${chatId}\n`;
        jidInfo += `👥 Members: ${participants.length}\n`;
        jidInfo += `📅 Created: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n`;
        jidInfo += `🔒 Restriction: ${groupMetadata.restrict ? 'Enabled' : 'Disabled'}\n`;
        jidInfo += `👑 Announcements: ${groupMetadata.announce ? 'Enabled' : 'Disabled'}\n\n`;

        jidInfo += `*👥 MEMBER DISTRIBUTION:*\n`;
        jidInfo += `👑 Super Admins: ${superAdmins.length}\n`;
        jidInfo += `⚡ Admins: ${admins.length}\n`;
        jidInfo += `👤 Regular Members: ${regularMembers.length}\n\n`;

        // Add admin details
        if (allAdmins.length > 0) {
            jidInfo += `*🔧 ADMINISTRATORS:*\n`;
            allAdmins.slice(0, 3).forEach((admin, index) => {
                const name = admin.name || admin.notify || admin.id.split('@')[0];
                const role = admin.admin === 'superadmin' ? '👑 Owner' : '⚡ Admin';
                jidInfo += `${index + 1}. ${role} - ${name}\n   📱 ${admin.id}\n`;
                if (index < Math.min(allAdmins.length, 3) - 1) jidInfo += '\n';
            });
            
            if (allAdmins.length > 3) {
                jidInfo += `\n... and ${allAdmins.length - 3} more admins\n`;
            }
        }

        jidInfo += `\n*🤖 BOT STATUS:*\n`;
        jidInfo += `⚡ Uptime: ${botUptime}\n`;
        jidInfo += `💾 Memory: ${memoryMB}MB\n`;
        jidInfo += `📡 Connection: ${sock.user ? 'Connected ✅' : 'Disconnected ❌'}\n`;
        jidInfo += `🔧 Platform: ${os.platform()}\n\n`;

        jidInfo += `*💡 COMMANDS:*\n`;
        jidInfo += `• Use .getjid @mention to get user JID\n`;

        // Send the enhanced JID information
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
            text: `*🔐 BASIC GROUP INFO*\n\n*Group JID:* ${chatId}\n\n*⚠️ Limited details - bot may need admin permissions*`,
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

// Enhanced Private chat JID information
async function handlePrivateJid(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Get comprehensive user and system info
        const [userProfile, userStatus, botUptime, memoryMB] = await Promise.all([
            sock.profilePictureUrl(senderId, 'image').catch(() => null),
            sock.fetchStatus(senderId).catch(() => null),
            formatUptime(process.uptime()),
            Math.round(process.memoryUsage().rss / 1024 / 1024)
        ]);

        // Create professional private chat info - ONLY STATUS LINE CHANGED
        const jidInfo = `*🔐 PRIVATE CHAT INFORMATION*\n\n` +
                       `*👤 YOUR ACCOUNT:*\n` +
                       `🆔 JID: ${senderId}\n` +
                       `📱 Platform: WhatsApp Mobile\n` +
                       `🖼️ Profile: ${userProfile ? '✅ Available' : '❌ Not set'}\n` +
                       `📝 Status: 🔒 Restricted by WhatsApp API\n\n` +  // ONLY THIS LINE CHANGED

                       `*🤖 BOT SYSTEM:*\n` +
                       `🆔 Bot JID: ${sock.user?.id || 'Unknown'}\n` +
                       `⚡ Uptime: ${botUptime}\n` +
                       `💾 Memory: ${memoryMB}MB\n` +
                       `📡 Connection: ${sock.user ? 'Stable ✅' : 'Unstable ❌'}\n` +
                       `🔧 Platform: ${os.platform()}\n\n` +

                       `*💬 CHAT INFO:*\n` +
                       `💬 Type: Private Chat\n` +
                       `🆔 Chat JID: ${chatId}\n` +
                       `🔒 Privacy: Standard\n\n` +

                       `*🔧 TECHNICAL:*\n` +
                       `🌐 Server: s.whatsapp.net\n` +
                       `⏰ Timestamp: ${new Date().toLocaleString()}\n` +
                       `💡 Use in groups for member details`;

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
            text: `*🔐 BASIC JID INFO*\n\n*Your JID:* ${message.key.participant || chatId}\n*Chat JID:* ${chatId}\n*Bot JID:* ${sock.user?.id || 'Unknown'}`,
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

// Enhanced function to get JID of mentioned users
async function getMentionedJids(sock, chatId, message) {
    try {
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJids.length === 0) {
            await sock.sendMessage(chatId, {
                text: '*❌ No users mentioned*\n\nPlease mention users with @ to get their JIDs.',
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

        let jidList = `*📋 MENTIONED USERS INFORMATION*\n\n`;
        
        for (let i = 0; i < mentionedJids.length; i++) {
            const jid = mentionedJids[i];
            try {
                const name = await sock.getName(jid);
                const isAdmin = await isUserAdmin(sock, chatId, jid);
                const role = isAdmin ? '⚡ Admin' : '👤 Member';
                
                jidList += `${i + 1}. *${name}*\n`;
                jidList += `   📱 JID: ${jid}\n`;
                jidList += `   🔧 Role: ${role}\n`;
                if (i < mentionedJids.length - 1) jidList += '\n';
            } catch (error) {
                jidList += `${i + 1}. *${jid.split('@')[0]}*\n`;
                jidList += `   📱 JID: ${jid}\n`;
                jidList += `   🔧 Role: Unknown\n`;
                if (i < mentionedJids.length - 1) jidList += '\n';
            }
        }

        jidList += `\n*📊 Total Mentioned: ${mentionedJids.length} users*`;

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
            text: '*❌ Failed to get mentioned users information*'
        }, { quoted: message });
    }
}

// Helper function to check if user is admin
async function isUserAdmin(sock, chatId, userId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        const metadata = await sock.groupMetadata(chatId);
        const user = metadata.participants.find(p => p.id === userId);
        return user && (user.admin === 'admin' || user.admin === 'superadmin');
    } catch (error) {
        return false;
    }
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

module.exports = {
    getjidCommand,
    getMentionedJids
};
