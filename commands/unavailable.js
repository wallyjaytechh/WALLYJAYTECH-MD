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
    // Set presence to "unavailable" - THE CORRECT WAY
    static async setUnavailablePresence(sock) {
        if (!unavailableData.enabled) return;
        
        try {
            // Method 1: Set composing state to false (makes you appear inactive)
            await sock.sendPresenceUpdate('paused');
            
            // Method 2: Use unavailable presence
            await sock.sendPresenceUpdate('unavailable');
            
            // Method 3: Stop any active presence
            await sock.sendPresenceUpdate('paused');
            
            const now = Date.now();
            if (now - unavailableData.lastPresenceUpdate > 30000) {
                console.log('🕶️ Presence set to: unavailable/offline');
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
            // Set to composing to appear online
            await sock.sendPresenceUpdate('composing');
            
            // Then set to available
            await sock.sendPresenceUpdate('available');
            
            console.log('✅ Presence set to: available');
        } catch (error) {
            console.error('❌ Error setting available presence:', error);
        }
    }
    
    // Completely hide online status (most effective method)
    static async hideOnlineStatus(sock) {
        try {
            // This combination works best for hiding online status
            await sock.sendPresenceUpdate('unavailable');
            await sock.sendPresenceUpdate('paused');
            
            // Add a small delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('👻 Online status hidden');
        } catch (error) {
            console.error('❌ Error hiding online status:', error);
        }
    }
}

// Add this to your main.js or index.js to continuously maintain presence
let presenceInterval = null;

function startUnavailableMaintenance(sock) {
    if (presenceInterval) {
        clearInterval(presenceInterval);
    }
    
    presenceInterval = setInterval(async () => {
        if (unavailableData.enabled) {
            await UnavailableSystem.setUnavailablePresence(sock);
            await UnavailableSystem.hideOnlineStatus(sock);
        }
    }, 15000); // Update every 15 seconds
}

function stopUnavailableMaintenance() {
    if (presenceInterval) {
        clearInterval(presenceInterval);
        presenceInterval = null;
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
                    
                    // Start maintaining unavailable presence
                    startUnavailableMaintenance(sock);
                    
                    // Set unavailable presence immediately
                    await UnavailableSystem.setUnavailablePresence(sock);
                    await UnavailableSystem.hideOnlineStatus(sock);
                    
                    await sock.sendMessage(chatId, {
                        text: `🕶️ *Unavailable Mode ENABLED*\n\n👻 You will now appear as "unavailable" even when online.\n\n📱 *What others see:*\n• Status: Unavailable\n• Last seen: Hidden\n• Online status: Never shows online\n\n🔄 *Maintenance:* Presence updated every 15 seconds\n\n💡 *Note:* This affects your bot account's presence only.`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    unavailableData.enabled = false;
                    saveUnavailableData();
                    
                    // Stop maintenance
                    stopUnavailableMaintenance();
                    
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
                        text: `📊 *Unavailable Status*\n\nMode: ${status}\nLast Update: ${lastUpdate}\nMaintenance: ${presenceInterval ? 'Active' : 'Inactive'}\n\n*What it does:*\n• Shows "unavailable" instead of "online"\n• Hides your active status\n• People think you're offline\n\n*Commands:*\n• .unavailable on - Enable stealth mode\n• .unavailable off - Show as online\n• .unavailable status - Show current status`
                    }, { quoted: message });
                    break;
                    
                case 'test':
                    // Test current presence
                    await UnavailableSystem.setUnavailablePresence(sock);
                    await UnavailableSystem.hideOnlineStatus(sock);
                    await sock.sendMessage(chatId, {
                        text: '🧪 *Presence Test*\n\nPresence set to "unavailable". Ask a friend to check if you appear offline.\n\nIf it still shows online, try enabling the full mode with `.unavailable on`'
                    }, { quoted: message });
                    break;
                    
                case 'force':
                    // Force immediate presence update
                    await UnavailableSystem.setUnavailablePresence(sock);
                    await UnavailableSystem.hideOnlineStatus(sock);
                    await sock.sendMessage(chatId, {
                        text: '⚡ *Force Update*\n\nPresence forcefully set to unavailable. Maintenance system activated.'
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `🕶️ *Unavailable Mode*\n\nHide your online status and appear as "unavailable" even when active.\n\n*Current Status:* ${unavailableData.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n\n*Usage:* .unavailable <command>\n\n*Commands:*\n• on - Enable unavailable mode\n• off - Disable unavailable mode\n• status - Show current status\n• test - Test presence setting\n• force - Force immediate update\n\n*Privacy Features:*\n• Shows "unavailable" status\n• Hides "online" indicator\n• Continuous presence maintenance\n• Perfect for stealth mode`
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
        await UnavailableSystem.hideOnlineStatus(sock);
    },
    
    // Get current status
    getStatus() {
        return unavailableData.enabled;
    },
    
    // Initialize with sock
    initialize(sock) {
        if (unavailableData.enabled) {
            console.log('🕶️ Unavailable mode was enabled, starting maintenance...');
            startUnavailableMaintenance(sock);
        }
    }
};
