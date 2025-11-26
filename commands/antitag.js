 const fs = require('fs');

// Path for antitag settings
const ANTITAG_SETTINGS = './data/antitag_settings.json';

// Initialize settings
function initSettings() {
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
if (!fs.existsSync(ANTITAG_SETTINGS)) {
fs.writeFileSync(ANTITAG_SETTINGS, JSON.stringify({ enabledGroups: {}, maxMentions: 5 }, null, 2));
}
}

// Load settings
function loadSettings() {
initSettings();
try {
return JSON.parse(fs.readFileSync(ANTITAG_SETTINGS));
} catch (error) {
return { enabledGroups: {}, maxMentions: 5 };
}
}

// Save settings
function saveSettings(settings) {
try {
fs.writeFileSync(ANTITAG_SETTINGS, JSON.stringify(settings, null, 2));
return true;
} catch (error) {
return false;
}
}

// Handle antitag command
async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
try {
const settings = loadSettings();
const args = userMessage.split(' ').slice(1);
const action = args[0]?.toLowerCase();

switch (action) {
case 'on':
case 'enable':
if (!isSenderAdmin && !message.key.fromMe) {
await sock.sendMessage(chatId, {
text: '*❌ Only admins can enable antitag*'
}, { quoted: message });
return;
}
settings.enabledGroups[chatId] = true;
saveSettings(settings);
await sock.sendMessage(chatId, {
text: '✅ *Antitag Enabled*\n\nExcessive mentioning will now be automatically deleted.'
}, { quoted: message });
break;

case 'off':
case 'disable':
if (!isSenderAdmin && !message.key.fromMe) {
await sock.sendMessage(chatId, {
text: '*❌ Only admins can disable antitag*'
}, { quoted: message });
return;
}
settings.enabledGroups[chatId] = false;
saveSettings(settings);
await sock.sendMessage(chatId, {
text: '❌ *Antitag Disabled*\n\nMentioning restrictions removed.'
}, { quoted: message });
break;

case 'limit':
case 'set':
if (!isSenderAdmin && !message.key.fromMe) {
await sock.sendMessage(chatId, {
text: '*❌ Only admins can set mention limits*'
}, { quoted: message });
return;
}
const newLimit = parseInt(args[1]);
if (isNaN(newLimit) || newLimit < 1 || newLimit > 20) {
await sock.sendMessage(chatId, {
text: '*❌ Invalid limit! Use 1-20*\n\nExample: .antitag limit 5'
}, { quoted: message });
return;
}
settings.maxMentions = newLimit;
saveSettings(settings);
await sock.sendMessage(chatId, {
text: `✅ *Mention limit set to ${newLimit}*\n\nMessages with more than ${newLimit} mentions will be deleted.`
}, { quoted: message });
break;

case 'status':
const status = settings.enabledGroups[chatId] ? '🟢 Enabled' : '🔴 Disabled';
const currentLimit = settings.maxMentions || 5;
await sock.sendMessage(chatId, {
text: `*🛡️ ANTITAG STATUS*\n\n*Status:* ${status}\n*Mention Limit:* ${currentLimit}\n*Group:* ${chatId.split('@')[0]}`
}, { quoted: message });
break;

case 'test':
// Test command to simulate mentions
await sock.sendMessage(chatId, {
text: `🧪 *Antitag Test*\n\nSend a message with more than ${settings.maxMentions || 5} mentions to test if antitag is working.`
}, { quoted: message });
break;

default:
await showAntitagHelp(sock, chatId, message);
break;
}

} catch (error) {
console.error('Antitag command error:', error);
await sock.sendMessage(chatId, {
text: '*❌ Error processing antitag command*'
}, { quoted: message });
}
}

// Show antitag help
async function showAntitagHelp(sock, chatId, message) {
const helpText = `
🛡️ *ANTITAG PROTECTION*

*Commands:*
• .antitag on - Enable mention protection
• .antitag off - Disable mention protection
• .antitag limit 5 - Set max mentions allowed (1-20)
• .antitag status - Check current settings
• .antitag test - Test if antitag is working

*Features:*
• Auto-deletes messages with excessive mentions
• Prevents spam and harassment
• Configurable mention limits
• Admin-only management

*Default:* Maximum 5 mentions per message
`.trim();

await sock.sendMessage(chatId, {
text: helpText
}, { quoted: message });
}

// Handle tag detection and deletion
async function handleTagDetection(sock, chatId, message, senderId) {
try {
const settings = loadSettings();

// Check if antitag is enabled for this group
if (!settings.enabledGroups[chatId]) {
console.log(`🔍 Antitag: Disabled for group ${chatId}`);
return;
}

console.log(`🔍 Antitag: Checking message in ${chatId} from ${senderId}`);

// Get mentioned users from the message
const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
const maxMentions = settings.maxMentions || 5;

console.log(`🔍 Antitag: Found ${mentionedJids.length} mentions, Limit: ${maxMentions}`);

// Check if message exceeds mention limit
if (mentionedJids.length > maxMentions) {
console.log(`🚫 Antitag: Deleting message with ${mentionedJids.length} mentions (limit: ${maxMentions})`);

// Delete the message
try {
await sock.sendMessage(chatId, {
delete: message.key
});
console.log(`✅ Antitag: Message deleted successfully`);
} catch (deleteError) {
console.error(`❌ Antitag: Failed to delete message:`, deleteError);
}

// Warn the user
// In handleTagDetection function:
try {
const warningMsg = await sock.sendMessage(chatId, {
text: `🚫 *EXCESSIVE MENTIONS DETECTED*\n\n@${senderId.split('@')[0]} Your message was deleted for mentioning too many users.\n\n*Limit:* ${maxMentions} mentions per message\n*Your mentions:* ${mentionedJids.length}`,
mentions: [senderId],
contextInfo: {
isForwarded: true,
forwardingScore: 999, // Very high forwarding score
forwardedNewsletterMessageInfo: {
newsletterJid: '120363420618370733@newsletter', // Your channel ID
newsletterName: 'SYSTEM ALERT',
serverMessageId: -1
}
}
});

console.log(`✅ Antitag: Sent newsletter-style warning`);

// Optional: Still auto-delete after 3 seconds
setTimeout(async () => {
try {
await sock.sendMessage(chatId, { delete: warningMsg.key });
} catch (error) {
console.log('Warning already handled by system');
}
}, 3000);

} catch (warnError) {
console.error(`❌ Antitag: Failed to send warning:`, warnError);
}

} else {
console.log(`✅ Antitag: Message allowed (${mentionedJids.length} mentions)`);
}

} catch (error) {
console.error('❌ Antitag detection error:', error);
}
}

module.exports = {
handleAntitagCommand,
handleTagDetection
};
