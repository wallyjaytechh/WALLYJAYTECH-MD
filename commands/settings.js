const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath, fallback) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return fallback;
}

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

const isOwnerOrSudo = require('../lib/isOwner');

async function settingsCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!' }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';

        // Read all JSON files
        const mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        const autoStatus = readJsonSafe(`${dataDir}/autoStatus.json`, { enabled: false });
        const autoread = readJsonSafe(`${dataDir}/autoread.json`, { enabled: false });
        const autotyping = readJsonSafe(`${dataDir}/autotyping.json`, { enabled: false });
        const autorecord = readJsonSafe(`${dataDir}/autorecord.json`, { enabled: false });
        const autorecordtype = readJsonSafe(`${dataDir}/autorecordtype.json`, { enabled: false });
        const pmblocker = readJsonSafe(`${dataDir}/pmblocker.json`, { enabled: false });
        const anticall = readJsonSafe(`${dataDir}/anticall.json`, { enabled: false });
        const autobio = readJsonSafe(`${dataDir}/autobio.json`, { enabled: false });
        const antiforeign = readJsonSafe(`${dataDir}/antiforeign.json`, { enabled: false });
        const antibot = readJsonSafe(`${dataDir}/antibot.json`, { enabled: false });
        const areact = readJsonSafe(`${dataDir}/areact.json`, { enabled: false });
        
        // Read user/group data
        const userGroupData = readJsonSafe(`${dataDir}/userGroupData.json`, {
            antilink: {}, antibadword: {}, welcome: {}, goodbye: {}, chatbot: {}, antitag: {}
        });
        
        // Bot settings from settings.js
        const botSettings = require('../settings');
        
        // Check which features exist
        const autorecordExists = checkFileExists(`${dataDir}/autorecord.json`);
        const autorecordtypeExists = checkFileExists(`${dataDir}/autorecordtype.json`);
        const autobioExists = checkFileExists(`${dataDir}/autobio.json`);
        const antiforeignExists = checkFileExists(`${dataDir}/antiforeign.json`);
        const antibotExists = checkFileExists(`${dataDir}/antibot.json`);
        const areactExists = checkFileExists(`${dataDir}/areact.json`);

        // Per-group features
        const groupId = isGroup ? chatId : null;
        const antilinkOn = groupId ? Boolean(userGroupData.antilink && userGroupData.antilink[groupId]) : false;
        const antibadwordOn = groupId ? Boolean(userGroupData.antibadword && userGroupData.antibadword[groupId]) : false;
        const welcomeOn = groupId ? Boolean(userGroupData.welcome && userGroupData.welcome[groupId]) : false;
        const goodbyeOn = groupId ? Boolean(userGroupData.goodbye && userGroupData.goodbye[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot && userGroupData.chatbot[groupId]) : false;
        const antitagCfg = groupId ? (userGroupData.antitag && userGroupData.antitag[groupId]) : null;

        // Build settings display
        const lines = [];
        lines.push('🤖 *BOT SETTINGS*');
        lines.push('');
        
        // Bot Configuration
        lines.push('*📝 BOT CONFIGURATION:*');
        lines.push(`• Prefix: "${botSettings.prefix || '.'}"`);
        lines.push(`• Mode: ${mode.isPublic ? 'Public 🌐' : 'Private 🔒'}`);
        lines.push(`• Owner: ${botSettings.botOwner || 'Not set'}`);
        lines.push(`• Timezone: ${botSettings.timezone || 'Not set'}`);
        lines.push(`• Version: ${botSettings.version || '1.0.0'}`);
        lines.push('');
        
        // Global Features
        lines.push('*⚙️ GLOBAL FEATURES:*');
        lines.push(`• Auto Status: ${autoStatus.enabled ? 'ON ✅' : 'OFF ❌'}`);
        lines.push(`• Autoread: ${autoread.enabled ? 'ON ✅' : 'OFF ❌'}`);
        lines.push(`• Autotyping: ${autotyping.enabled ? 'ON ✅' : 'OFF ❌'}`);
        lines.push(`• PM Blocker: ${pmblocker.enabled ? 'ON ✅' : 'OFF ❌'}`);
        lines.push(`• Anticall: ${anticall.enabled ? 'ON ✅' : 'OFF ❌'}`);
        
        // Auto Features
        lines.push('');
        lines.push('*🤖 AUTO FEATURES:*');
        if (autorecordExists) {
            lines.push(`• Autorecord: ${autorecord.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        if (autorecordtypeExists) {
            lines.push(`• Autorecordtype: ${autorecordtype.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        if (autobioExists) {
            lines.push(`• Autobio: ${autobio.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        
        // Security Features
        lines.push('');
        lines.push('*🛡️ SECURITY FEATURES:*');
        if (antiforeignExists) {
            lines.push(`• Antiforeign: ${antiforeign.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        if (antibotExists) {
            lines.push(`• Antibot: ${antibot.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        if (areactExists) {
            lines.push(`• Auto Reaction: ${areact.enabled ? 'ON ✅' : 'OFF ❌'}`);
        }
        
        // Group Settings (if in group)
        if (groupId) {
            lines.push('');
            lines.push(`*👥 GROUP SETTINGS (${groupId.substring(0, 15)}...):*`);
            if (antilinkOn) {
                const al = userGroupData.antilink[groupId];
                lines.push(`• Antilink: ON ✅ (action: ${al.action || 'delete'})`);
            } else {
                lines.push('• Antilink: OFF ❌');
            }
            if (antibadwordOn) {
                const ab = userGroupData.antibadword[groupId];
                lines.push(`• Antibadword: ON ✅ (action: ${ab.action || 'delete'})`);
            } else {
                lines.push('• Antibadword: OFF ❌');
            }
            lines.push(`• Welcome: ${welcomeOn ? 'ON ✅' : 'OFF ❌'}`);
            lines.push(`• Goodbye: ${goodbyeOn ? 'ON ✅' : 'OFF ❌'}`);
            lines.push(`• Chatbot: ${chatbotOn ? 'ON ✅' : 'OFF ❌'}`);
            if (antitagCfg && antitagCfg.enabled) {
                lines.push(`• Antitag: ON ✅ (action: ${antitagCfg.action || 'delete'})`);
            } else {
                lines.push('• Antitag: OFF ❌');
            }
        } else {
            lines.push('');
            lines.push('*📌 NOTE:*');
            lines.push('Per-group settings will be shown when used inside a group.');
        }
        
        // Add footer with commands
        lines.push('');
        lines.push('*📋 COMMANDS TO CHANGE:*');
        lines.push('• `.mode public/private` - Change access');
        lines.push('• `.setprefix` - Change prefix');
        lines.push('• `.autostatus on/off` - Auto status');
        lines.push('• `.autoread on/off` - Auto read');
        lines.push('• `.autotyping on/off` - Auto typing');
        lines.push('• `.autorecord on/off` - Auto record');
        lines.push('• `.autorecordtype on/off` - Auto record type');
        lines.push('• `.autobio on/off` - Auto bio');
        lines.push('• `.pmblocker on/off` - PM blocker');
        lines.push('• `.anticall on/off` - Anti call');
        lines.push('• `.antiforeign on/off` - Anti foreign');
        lines.push('• `.antibot on/off` - Anti bot');
        lines.push('• `.areact on/off` - Auto reaction');
        
        await sock.sendMessage(chatId, { 
            text: lines.join('\n') 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in settings command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to read settings. Error: ' + error.message 
        }, { quoted: message });
    }
}

module.exports = settingsCommand;
