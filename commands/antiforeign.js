/**
 * WALLYJAYTECH-MD - Anti-Foreign - Simple Working Version
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

// Simple country code extractor
function getCountryCode(jid) {
    const number = jid.split('@')[0];
    if (number.startsWith('91')) return '91';
    if (number.startsWith('92')) return '92';
    if (number.startsWith('1')) return '1';
    if (number.startsWith('44')) return '44';
    if (number.startsWith('86')) return '86';
    if (number.startsWith('234')) return '234';
    if (number.startsWith('233')) return '233';
    if (number.startsWith('254')) return '254';
    return 'other';
}

// Command handler
async function antiforeignCommand(sock, chatId, message) {
    try {
        const msg = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = msg.split(' ').slice(1);
        
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN*\n\nStatus: ${settings.enabled ? '✅ ON' : '❌ OFF'}\nBlocked: ${settings.blockedCountries.join(', ')}\n\nCommands:\n.antiforeign on\n.antiforeign off\n.antiforeign add 91\n.antiforeign remove 91\n\nTest: .testblock`
            });
            return;
        }
        
        const action = args[0].toLowerCase();
        
        if (action === 'on') {
            settings.enabled = true;
            saveSettings();
            await sock.sendMessage(chatId, { text: '✅ Anti-foreign ENABLED. Numbers from blocked countries will be blocked.' });
        }
        else if (action === 'off') {
            settings.enabled = false;
            saveSettings();
            await sock.sendMessage(chatId, { text: '❌ Anti-foreign DISABLED.' });
        }
        else if (action === 'add' && args[1]) {
            if (!settings.blockedCountries.includes(args[1])) {
                settings.blockedCountries.push(args[1]);
                saveSettings();
                await sock.sendMessage(chatId, { text: `✅ Added country code: ${args[1]}` });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ ${args[1]} already blocked.` });
            }
        }
        else if (action === 'remove' && args[1]) {
            settings.blockedCountries = settings.blockedCountries.filter(c => c !== args[1]);
            saveSettings();
            await sock.sendMessage(chatId, { text: `✅ Removed country code: ${args[1]}` });
        }
        else {
            await sock.sendMessage(chatId, { text: 'Invalid command. Use: on/off/add/remove' });
        }
    } catch (error) {
        console.error('Error:', error);
        await sock.sendMessage(chatId, { text: 'Error processing command.' });
    }
}

// MAIN BLOCKING FUNCTION
async function handleAntiforeign(sock, chatId, message) {
    try {
        console.log(`🔍 ANTI-FOREIGN CHECK - Enabled: ${settings.enabled}`);
        console.log(`🔍 Chat ID: ${chatId}`);
        console.log(`🔍 From Me: ${message.key.fromMe}`);
        
        // Only block private chats
        if (chatId.includes('@g.us')) {
            console.log(`⏭️ Group chat - skipping`);
            return false;
        }
        
        // Don't block bot's own messages
        if (message.key.fromMe) {
            console.log(`⏭️ Bot's own message - skipping`);
            return false;
        }
        
        // Check if enabled
        if (!settings.enabled) {
            console.log(`⏭️ Anti-foreign disabled - skipping`);
            return false;
        }
        
        // Get sender's number
        const sender = message.key.participant || message.key.remoteJid;
        const countryCode = getCountryCode(sender);
        
        console.log(`📱 Incoming from: ${sender}`);
        console.log(`🌍 Country code: ${countryCode}`);
        console.log(`🚫 Blocked list: ${settings.blockedCountries.join(', ')}`);
        
        // Check if blocked
        if (settings.blockedCountries.includes(countryCode)) {
            console.log(`🚫🚫🚫 BLOCKING ${sender} (${countryCode}) 🚫🚫🚫`);
            
            // Send warning
            await sock.sendMessage(chatId, { text: '🚫 Your country is blocked. Goodbye.' });
            
            // Wait 1 second
            await new Promise(r => setTimeout(r, 1000));
            
            // Block the user
            await sock.updateBlockStatus(sender, 'block');
            console.log(`✅ Successfully blocked ${sender}`);
            
            return true; // Message blocked
        }
        
        console.log(`✅ Allowed - ${countryCode} not blocked`);
        return false;
    } catch (error) {
        console.error(`❌ Anti-foreign error:`, error.message);
        return false;
    }
}

// TEST FUNCTION - Add this to test blocking
async function testBlock(sock, chatId, message) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        const countryCode = getCountryCode(sender);
        
        await sock.sendMessage(chatId, {
            text: `🧪 *TEST BLOCK*\n\nYour number: ${sender}\nCountry code: ${countryCode}\nBlocked countries: ${settings.blockedCountries.join(', ')}\n\nWould you be blocked? ${settings.blockedCountries.includes(countryCode) ? '✅ YES' : '❌ NO'}`
        });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    antiforeignCommand,
    handleAntiforeign,
    testBlock,
    isAntiforeignEnabled: () => settings.enabled,
    getBlockedCountries: () => settings.blockedCountries
};
