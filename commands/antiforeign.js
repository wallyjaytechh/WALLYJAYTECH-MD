/**
 * WALLYJAYTECH-MD - Anti-Foreign (LID Compatible)
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'antiforeign.json');

// Simple config
let settings = {
    enabled: false,
    blockedCountries: ['91', '92', '1', '44', '86']
};

// Load settings
try {
    if (fs.existsSync(configPath)) {
        const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        settings.enabled = saved.enabled || false;
        settings.blockedCountries = saved.blockedCountries || ['91', '92', '1', '44', '86'];
    } else {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
    }
} catch (e) {}

function saveSettings() {
    try {
        fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
    } catch (e) {}
}

// Extract country code from any JID format (including LID)
async function getCountryCodeFromJid(sock, jid) {
    try {
        let phoneNumber = null;
        
        // If it's a LID (ends with @lid)
        if (jid.includes('@lid')) {
            // Try to get phone number from contact
            try {
                const contact = await sock.getContact(jid);
                if (contact && contact.phoneNumber) {
                    phoneNumber = contact.phoneNumber;
                }
            } catch (e) {
                // If we can't get contact, try to extract from LID
                const lidNumber = jid.split('@')[0];
                // LIDs often start with the phone number
                phoneNumber = lidNumber;
            }
        } 
        // Normal JID format
        else if (jid.includes('@s.whatsapp.net')) {
            phoneNumber = jid.split('@')[0];
        }
        
        if (!phoneNumber) return 'unknown';
        
        // Extract country code
        const number = String(phoneNumber).replace(/\D/g, '');
        
        if (number.startsWith('91')) return '91';
        if (number.startsWith('92')) return '92';
        if (number.startsWith('1')) return '1';
        if (number.startsWith('44')) return '44';
        if (number.startsWith('86')) return '86';
        if (number.startsWith('234')) return '234';
        if (number.startsWith('233')) return '233';
        if (number.startsWith('254')) return '254';
        if (number.startsWith('27')) return '27';
        if (number.startsWith('55')) return '55';
        if (number.startsWith('52')) return '52';
        if (number.startsWith('63')) return '63';
        if (number.startsWith('62')) return '62';
        
        return 'unknown';
    } catch (error) {
        console.error('Error extracting country code:', error);
        return 'unknown';
    }
}

// Block a user (works with LIDs)
async function blockUser(sock, jid) {
    try {
        // Method 1: Try updateBlockStatus
        try {
            await sock.updateBlockStatus(jid, 'block');
            console.log(`✅ Blocked via updateBlockStatus: ${jid}`);
            return true;
        } catch (err1) {
            // Method 2: Try query method
            try {
                await sock.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'block'
                    },
                    content: [
                        {
                            tag: 'block',
                            attrs: {
                                jid: jid
                            }
                        }
                    ]
                });
                console.log(`✅ Blocked via query: ${jid}`);
                return true;
            } catch (err2) {
                // Method 3: Try to get phone number and block
                try {
                    const contact = await sock.getContact(jid);
                    if (contact && contact.phoneNumber) {
                        await sock.updateBlockStatus(contact.phoneNumber + '@s.whatsapp.net', 'block');
                        console.log(`✅ Blocked via phone: ${contact.phoneNumber}`);
                        return true;
                    }
                } catch (err3) {}
                return false;
            }
        }
    } catch (error) {
        console.error('Block error:', error);
        return false;
    }
}

// Command handler
async function antiforeignCommand(sock, chatId, message) {
    try {
        const msg = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = msg.split(' ').slice(1);
        
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN*\n\nStatus: ${settings.enabled ? '✅ ON' : '❌ OFF'}\nBlocked: ${settings.blockedCountries.join(', ')}\n\nCommands:\n.antiforeign on\n.antiforeign off\n.antiforeign add 91\n.antiforeign remove 91`
            });
            return;
        }
        
        const action = args[0].toLowerCase();
        
        if (action === 'on') {
            settings.enabled = true;
            saveSettings();
            await sock.sendMessage(chatId, { text: '✅ Anti-foreign ENABLED' });
        }
        else if (action === 'off') {
            settings.enabled = false;
            saveSettings();
            await sock.sendMessage(chatId, { text: '❌ Anti-foreign DISABLED' });
        }
        else if (action === 'add' && args[1]) {
            if (!settings.blockedCountries.includes(args[1])) {
                settings.blockedCountries.push(args[1]);
                saveSettings();
                await sock.sendMessage(chatId, { text: `✅ Added: ${args[1]}` });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ ${args[1]} already blocked` });
            }
        }
        else if (action === 'remove' && args[1]) {
            settings.blockedCountries = settings.blockedCountries.filter(c => c !== args[1]);
            saveSettings();
            await sock.sendMessage(chatId, { text: `✅ Removed: ${args[1]}` });
        }
        else {
            await sock.sendMessage(chatId, { text: 'Invalid command. Use: on/off/add/remove' });
        }
    } catch (error) {
        console.error('Error:', error);
        await sock.sendMessage(chatId, { text: 'Error processing command.' });
    }
}

// MAIN BLOCKING FUNCTION - LID Compatible
async function handleAntiforeign(sock, chatId, message) {
    try {
        // Only block private chats
        if (chatId.includes('@g.us')) return false;
        if (message.key.fromMe) return false;
        if (!settings.enabled) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        const countryCode = await getCountryCodeFromJid(sock, senderJid);
        
        console.log(`🔍 Anti-foreign: ${senderJid} | Country: ${countryCode} | Blocked: ${settings.blockedCountries.join(', ')}`);
        
        if (settings.blockedCountries.includes(countryCode)) {
            console.log(`🚫 BLOCKING ${senderJid} (${countryCode})`);
            
            await sock.sendMessage(chatId, { text: '🚫 Your country is blocked. Goodbye.' });
            await new Promise(r => setTimeout(r, 1000));
            
            const blocked = await blockUser(sock, senderJid);
            if (blocked) {
                console.log(`✅ Blocked ${senderJid}`);
            } else {
                console.log(`❌ Failed to block ${senderJid}`);
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Anti-foreign error:`, error.message);
        return false;
    }
}

module.exports = {
    antiforeignCommand,
    handleAntiforeign,
    isAntiforeignEnabled: () => settings.enabled,
    getBlockedCountries: () => settings.blockedCountries
};
