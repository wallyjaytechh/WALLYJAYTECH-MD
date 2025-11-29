const fs = require('fs');
const path = require('path');

// Store unavailable status settings
const unavailableData = {
    enabled: false,
    lastPresenceUpdate: 0
};

// Load/save unavailable data
const UNAVAILABLE_FILE = path.join(__dirname, '../data/unavailable.json');

function loadUnavailableData() {
    try {
        if (fs.existsSync(UNAVAILABLE_FILE)) {
            const data = JSON.parse(fs.readFileSync(UNAVAILABLE_FILE, 'utf8'));
            unavailableData.enabled = data.enabled || false;
            unavailableData.lastPresenceUpdate = data.lastPresenceUpdate || 0;
        }
    } catch (error) {
        console.error('❌ Error loading unavailable data:', error);
    }
}

function saveUnavailableData() {
    try {
        const data = {
            enabled: unavailableData.enabled,
            lastPresenceUpdate: unavailableData.lastPresenceUpdate
        };
        
        // Ensure data directory exists
        const dataDir = path.dirname(UNAVAILABLE_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(UNAVAILABLE_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Unavailable data saved');
    } catch (error) {
        console.error('❌ Error saving unavailable data:', error);
    }
}

// Initialize unavailable system
loadUnavailableData();

class UnavailableSystem {
    // Set presence to "unavailable"
    static async setUnavailablePresence(sock) {
        if (!unavailableData.enabled) return;
        
        try {
            // Set presence to "unavailable" - this makes you appear offline
            await sock.sendPresenceUpdate('unavailable');
            
            const now = Date.now();
            if (now - unavailableData.lastPresenceUpdate > 30000) { // Log every 30 seconds
                console.log('🕶️ Presence set to: unavailable');
                unavailableData.lastPresenceUpdate = now;
                saveUnavailableData();
            }
            
        } catch (error) {
            console.error('❌ Error setting unavailable presence:', error);
        }
    }
    
    // Set presence back to "available" (online)
    static async setAvailablePresence(sock) {
        try {
            await sock.sendPresenceUpdate('available');
            console.log('✅ Presence set to: available');
        } catch (error) {
            console.error('❌ Error setting available presence:', error);
        }
    }
}

module.exports = {
    name: 'unavailable',
    description: 'Show as unavailable/offline even when online',
    
    async execute(sock, chatId, message, args) {
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            
            // Check if user is authorized (owner only)
            const { isOwnerOrSudo } = require('../lib/isOwner');
            const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
            
            if (!isAuthorized) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner can use unavailable commands!'
                }, { quoted: message });
                return;
            }
            
            const action = args[0]?.toLowerCase();
            
            switch (action) {
                case 'on':
                case 'enable':
                    unavailableData.enabled = true;
                    saveUnavailableData();
                    
                    // Set unavailable presence immediately
                    await UnavailableSystem.setUnavailablePresence(sock);
                    
                    await sock.sendMessage(chatId, {
                        text: `🕶️ *Unavailable Mode ENABLED*\n\n👻 You will now appear as "unavailable" even when online.\n\n📱 *What others see:*\n• Status: Unavailable\n• Last seen: Hidden\n• Online status: Never shows online\n\n💡 *Note:* This only affects your bot account's presence.`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    unavailableData.enabled = false;
                    saveUnavailableData();
                    
                    // Set back to available
                    await UnavailableSystem.setAvailablePresence(sock);
                    
                    await sock.sendMessage(chatId, {
                        text: '✅ *Unavailable Mode DISABLED*\n\nYou will now appear as "online" when active.'
                    }, { quoted: message });
                    break;
                    
                case 'status':
                case 'info':
                    const status = unavailableData.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = unavailableData.lastPresenceUpdate ? 
                        new Date(unavailableData.lastPresenceUpdate).toLocaleTimeString() : 'Never';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *Unavailable Status*\n\nMode: ${status}\nLast Update: ${lastUpdate}\n\n*What it does:*\n• Shows "unavailable" instead of "online"\n• Hides your active status\n• People think you\'re offline\n\n*Commands:*\n• .unavailable on - Enable stealth mode\n• .unavailable off - Show as online\n• .unavailable status - Show current status`
                    }, { quoted: message });
                    break;
                    
                case 'test':
                    // Test current presence
                    await UnavailableSystem.setUnavailablePresence(sock);
                    await sock.sendMessage(chatId, {
                        text: '🧪 *Presence Test*\n\nPresence set to "unavailable". Ask a friend to check if you appear offline.'
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `🕶️ *Unavailable Mode*\n\nHide your online status and appear as "unavailable" even when active.\n\n*Current Status:* ${unavailableData.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n\n*Usage:* .unavailable <command>\n\n*Commands:*\n• on - Enable unavailable mode\n• off - Disable unavailable mode\n• status - Show current status\n• test - Test presence setting\n\n*Privacy Features:*\n• Shows "unavailable" status\n• Hides "online" indicator\n• Last seen remains unchanged\n• Perfect for stealth mode`
                    }, { quoted: message });
                    break;
            }
            
        } catch (error) {
            console.error('❌ Unavailable command error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error executing unavailable command!'
            }, { quoted: message });
        }
    },
    
    // Function to maintain unavailable presence (call this periodically)
    async maintainUnavailablePresence(sock) {
        await UnavailableSystem.setUnavailablePresence(sock);
    }
};
