/**
 * WALLYJAYTECH-MD - Auto Status with Reactions
 * HYBRID: Status reaction + DM fallback
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
}

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

function readConfig() {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { return { enabled: false, reactOn: false }; }
}
function writeConfig(config) {
    try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch (e) {}
}

async function isAutoStatusEnabled() { return readConfig().enabled; }
async function isStatusReactionEnabled() { return readConfig().reactOn; }

async function lidToRealJid(sock, lid) {
    if (!lid || !lid.endsWith('@lid')) return lid;
    try {
        if (sock.signalRepository?.lidMapping?.getPNForLID) {
            const pn = await sock.signalRepository.lidMapping.getPNForLID(lid);
            if (pn) {
                return pn.replace(/:\d+@s\.whatsapp\.net/, '@s.whatsapp.net');
            }
        }
    } catch (e) {}
    return lid;
}

async function handleStatusUpdate(sock, status) {
    try {
        const config = readConfig();
        if (!config.enabled) return;

        if (status.messages && status.messages.length > 0) {
            for (const msg of status.messages) {
                if (!msg.key) continue;
                if (msg.key.remoteJid !== 'status@broadcast') continue;
                if (msg.key.fromMe === true) continue;
                
                const lid = msg.key.participant;
                const realJid = await lidToRealJid(sock, lid);
                
                try {
                    await sock.readMessages([msg.key]);
                    console.log('✅ Viewed:', msg.key.id);
                    
                    if (config.reactOn && realJid) {
                        // Method 1: Status reaction (may not show to user)
                        try {
                            await sock.sendMessage(realJid, {
                                react: {
                                    text: '💚',
                                    key: {
                                        remoteJid: 'status@broadcast',
                                        fromMe: false,
                                        id: msg.key.id,
                                        participant: lid
                                    }
                                }
                            });
                            console.log('✅ Status reaction sent');
                        } catch (e1) {
                            console.log('⚠️ Status reaction failed:', e1.message);
                        }
                        
                        // Method 2: DM notification (user WILL see this)
                        try {
                            await sock.sendMessage(realJid, {
                                text: '💚'
                            });
                            console.log('✅ DM heart sent to:', realJid);
                        } catch (e2) {
                            console.log('⚠️ DM failed:', e2.message);
                        }
                    }
                } catch (err) {
                    console.log('⚠️ Error:', err.message);
                }
            }
        }
    } catch (e) {
        console.log('⚠️ Status error:', e.message);
    }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;
            
            const realJid = await lidToRealJid(sock, msg.key.participant);
            
            try {
                await sock.readMessages([msg.key]);
                if (config.reactOn && realJid) {
                    await sock.sendMessage(realJid, { react: { text: '💚', key: { remoteJid: 'status@broadcast', fromMe: false, id: msg.key.id, participant: msg.key.participant } } });
                    await sock.sendMessage(realJid, { text: '💚' });
                }
            } catch (err) {}
        }
    } catch (e) {}
}

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) return;
        
        let config = readConfig();
        
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '👁️ *AUTO-STATUS*\n\n🟢 View: ' + (config.enabled ? '✅ ON' : '❌ OFF') + '\n🟢 React: ' + (config.reactOn ? '✅ ON' : '❌ OFF') + '\n\n📖 .autostatus on/off\n📖 .autostatus react on/off\n\n🔍 HYBRID MODE (react + DM)',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const cmd = args[0].toLowerCase();
        if (cmd === 'on') { config.enabled = true; writeConfig(config); await sock.sendMessage(chatId, { text: '✅ ON', ...channelInfo }); }
        else if (cmd === 'off') { config.enabled = false; writeConfig(config); await sock.sendMessage(chatId, { text: '❌ OFF', ...channelInfo }); }
        else if (cmd === 'react' && args[1]) {
            config.reactOn = (args[1] === 'on');
            writeConfig(config);
            await sock.sendMessage(chatId, { text: config.reactOn ? '💫 REACT ON' : '❌ REACT OFF', ...channelInfo });
        }
    } catch (e) {}
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    readConfig,
    writeConfig
};
