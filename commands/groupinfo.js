const fs = require('fs');

async function groupInfoCommand(sock, chatId, message) {
try {
// Show typing indicator
await sock.sendPresenceUpdate('composing', chatId);

// Get group metadata
const groupMetadata = await sock.groupMetadata(chatId);

// Get group participants - FIXED METHOD NAME
let groupMembers;
try {
groupMembers = await sock.groupParticipants(chatId);
} catch (participantsError) {
console.error('Error fetching participants:', participantsError);
// If we can't get participants, use basic metadata
groupMembers = [];
}

// Get group description (if available)
let groupDesc = groupMetadata.desc || 'No description';
if (groupDesc.length > 100) {
groupDesc = groupDesc.substring(0, 100) + '...';
}

// Count members by role - with error handling
let admins = [];
let superAdmins = [];
let regularAdmins = [];
let participants = [];

if (groupMembers.length > 0) {
admins = groupMembers.filter(member => member.admin === 'superadmin' || member.admin === 'admin');
superAdmins = groupMembers.filter(member => member.admin === 'superadmin');
regularAdmins = groupMembers.filter(member => member.admin === 'admin');
participants = groupMembers.filter(member => !member.admin);
}

// Get creation date
const creationDate = new Date(groupMetadata.creation * 1000);
const formattedDate = creationDate.toLocaleDateString('en-US', {
year: 'numeric',
month: 'long',
day: 'numeric'
});

// Check if group is restricted
const isRestricted = groupMetadata.restrict || false;
const isAnnouncement = groupMetadata.announce || false;

// Format member counts
const totalMembers = groupMetadata.size || groupMembers.length;
const adminCount = admins.length;
const superAdminCount = superAdmins.length;
const regularAdminCount = regularAdmins.length;
const participantCount = participants.length;

// Get recent activity (message count if available)
const recentActivity = await getRecentActivity(chatId);

// Create group info message
const groupInfo = `
*🏷️ GROUP INFORMATION*

*📛 Group Name:* ${groupMetadata.subject}
*🆔 Group ID:* ${chatId}
*👥 Total Members:* ${totalMembers}
*📅 Created:* ${formattedDate}

*👑 Super Admins:* ${superAdminCount}
*⚡ Admins:* ${regularAdminCount}
*👤 Participants:* ${participantCount}

*📝 Description:*
${groupDesc}

*⚙️ Settings:*
• ${isRestricted ? '🔒 Restricted' : '🔓 Open'} (${isRestricted ? 'Only admins can send messages' : 'Everyone can send messages'})
• ${isAnnouncement ? '📢 Announcement Mode' : '💬 Chat Mode'} (${isAnnouncement ? 'Only admins can send messages' : 'Everyone can send messages'})

*📊 Recent Activity:*
${recentActivity}

*🔗 Group Link:* ${groupMetadata.inviteCode ? `https://chat.whatsapp.com/${groupMetadata.inviteCode}` : 'Not available'}
`.trim();

// Send group info
await sock.sendMessage(chatId, {
text: groupInfo,
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

// Send additional member breakdown if not too large and we have members data
if (groupMembers.length > 0 && groupMembers.length <= 50) {
await sendMemberBreakdown(sock, chatId, groupMembers, message);
}

} catch (error) {
console.error('Error in groupInfoCommand:', error);
await sock.sendMessage(chatId, {
text: '*❌ Failed to fetch group information*\n\nMake sure the bot is an admin in the group.',
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

// Get recent activity data
async function getRecentActivity(chatId) {
try {
// Check if message count data exists
const messageCountFile = './data/messageCount.json';
if (fs.existsSync(messageCountFile)) {
const data = JSON.parse(fs.readFileSync(messageCountFile));
const groupData = data.groups && data.groups[chatId];

if (groupData) {
const totalMessages = Object.values(groupData).reduce((sum, count) => sum + count, 0);
const activeMembers = Object.keys(groupData).length;

return `• Total Messages: ${totalMessages}\n• Active Members: ${activeMembers}`;
}
}

return '• No activity data available';
} catch (error) {
return '• Activity data unavailable';
}
}

// Send detailed member breakdown
async function sendMemberBreakdown(sock, chatId, groupMembers, originalMessage) {
try {
const superAdmins = groupMembers.filter(m => m.admin === 'superadmin');
const admins = groupMembers.filter(m => m.admin === 'admin');
const participants = groupMembers.filter(m => !m.admin);

let memberList = '*👥 MEMBER BREAKDOWN*\n\n';

// Add super admins
if (superAdmins.length > 0) {
memberList += '*👑 Super Admins:*\n';
superAdmins.forEach((member, index) => {
const name = member.name || member.id.split('@')[0];
const phone = member.id.split('@')[0];
memberList += `${index + 1}. ${name} (${phone})\n`;
});
memberList += '\n';
}

// Add admins
if (admins.length > 0) {
memberList += '*⚡ Admins:*\n';
admins.forEach((member, index) => {
const name = member.name || member.id.split('@')[0];
const phone = member.id.split('@')[0];
memberList += `${index + 1}. ${name} (${phone})\n`;
});
memberList += '\n';
}

// Add participants (limit to first 20 to avoid message too long)
if (participants.length > 0) {
memberList += '*👤 Participants:*\n';
const displayParticipants = participants.slice(0, 20);
displayParticipants.forEach((member, index) => {
const name = member.name || member.id.split('@')[0];
const phone = member.id.split('@')[0];
memberList += `${index + 1}. ${name} (${phone})\n`;
});

if (participants.length > 20) {
memberList += `\n... and ${participants.length - 20} more participants`;
}
}

// Send member breakdown
await sock.sendMessage(chatId, {
text: memberList,
contextInfo: {
forwardingScore: 1,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363420618370733@newsletter',
newsletterName: 'WALLYJAYTECH-MD BOTS',
serverMessageId: -1
}
}
}, { quoted: originalMessage });

} catch (error) {
console.error('Error sending member breakdown:', error);
// Don't send error message for this part as main info was already sent
}
}

// Alternative function to get brief group info
async function getBriefGroupInfo(sock, chatId) {
try {
const groupMetadata = await sock.groupMetadata(chatId);
let groupMembers = [];

try {
groupMembers = await sock.groupParticipants(chatId);
} catch (e) {
console.error('Could not fetch participants:', e);
}

return {
name: groupMetadata.subject,
id: chatId,
members: groupMetadata.size || groupMembers.length,
admins: groupMembers.filter(m => m.admin).length,
creation: new Date(groupMetadata.creation * 1000).toLocaleDateString(),
desc: groupMetadata.desc || 'No description'
};
} catch (error) {
return null;
}
}

module.exports = groupInfoCommand;
