const fs = require('fs');
const path = require('path');

const UNAVAILABLE_FILE = path.join(__dirname, '../data/unavailable.json');

class UnavailableSystem {
    constructor() {
        this.enabled = false;
        this.presenceInterval = null;
        this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(UNAVAILABLE_FILE)) {
                const data = JSON.parse(fs.readFileSync(UNAVAILABLE_FILE, 'utf8'));
                this.enabled = data.enabled || false;
            }
        } catch (error) {
            this.enabled = false;
        }
    }

    saveData() {
        try {
            const dataDir = path.dirname(UNAVAILABLE_FILE);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(UNAVAILABLE_FILE, JSON.stringify({ 
                enabled: this.enabled 
            }, null, 2));
        } catch (error) {
            console.error('Error saving unavailable data:', error);
        }
    }

    async enableUnavailableMode(sock) {
        try {
            this.enabled = true;
            this.saveData();

            // Set initial presence to unavailable
            await sock.sendPresenceUpdate('unavailable');
            
            // Keep presence as unavailable continuously
            this.startPresenceMaintenance(sock);
            
            console.log('🔴 UNAVAILABLE MODE: Maximizing unavailable appearance');
            return true;
        } catch (error) {
            console.error('Error enabling unavailable mode:', error);
            return false;
        }
    }

    async disableUnavailableMode(sock) {
        try {
            this.enabled = false;
            this.saveData();
            this.stopPresenceMaintenance();
            
            // Set back to available
            await sock.sendPresenceUpdate('available');
            
            console.log('🟢 ONLINE MODE: Showing online status');
            return true;
        } catch (error) {
            console.error('Error disabling unavailable mode:', error);
            return false;
        }
    }

    startPresenceMaintenance(sock) {
        // Clear existing interval
        this.stopPresenceMaintenance();
        
        // Update presence every 10 seconds to maintain "unavailable" state
        this.presenceInterval = setInterval(async () => {
            if (this.enabled) {
                try {
                    await sock.sendPresenceUpdate('unavailable');
                } catch (error) {
                    console.error('Error maintaining unavailable presence:', error);
                }
            }
        }, 10000);
    }

    stopPresenceMaintenance() {
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
    }

    isEnabled() {
        return this.enabled;
    }
}

const unavailableSystem = new UnavailableSystem();

module.exports = {
    name: 'unavailable',
    description: 'Show as unavailable instead of online',

    async execute(sock, chatId, message, args) {
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            const { isOwnerOrSudo } = require('../lib/isOwner');
            const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
            
            if (!isAuthorized) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Only bot owner can use this command!' 
                }, { quoted: message });
                return;
            }

            const action = args[0]?.toLowerCase();

            switch (action) {
                case 'on':
                    await unavailableSystem.enableUnavailableMode(sock);
                    await sock.sendMessage(chatId, {
                        text: `🔴 *UNAVAILABLE MODE ACTIVATED*\n\n• Bot shows as "unavailable" when possible\n• Bot remains fully functional\n• All commands work normally\n• Continuous presence maintenance active\n\nUse \`.unavailable off\` to show online again`
                    }, { quoted: message });
                    break;

                case 'off':
                    await unavailableSystem.disableUnavailableMode(sock);
                    await sock.sendMessage(chatId, {
                        text: '🟢 *ONLINE MODE ACTIVATED*\n\nBot now shows online status normally'
                    }, { quoted: message });
                    break;

                case 'status':
                    await sock.sendMessage(chatId, {
                        text: `📊 *Unavailable Mode Status*\n\nCurrent: ${unavailableSystem.isEnabled() ? '🔴 UNAVAILABLE' : '🟢 ONLINE'}\n\nBot will ${unavailableSystem.isEnabled() ? 'show as unavailable when possible' : 'show online status normally'}`
                    }, { quoted: message });
                    break;

                default:
                    await sock.sendMessage(chatId, {
                        text: `🔴 *Unavailable Mode*\n\nCurrent: ${unavailableSystem.isEnabled() ? 'UNAVAILABLE' : 'ONLINE'}\n\n• .unavailable on - Show as unavailable\n• .unavailable off - Show as online\n• .unavailable status - Check current mode\n\n*Note:* This maximizes "unavailable" appearance while keeping the bot 100% functional.`
                    }, { quoted: message });
                    break;
            }
            
        } catch (error) {
            console.error('Unavailable command error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error executing unavailable command'
            }, { quoted: message });
        }
    },

    // Initialize when bot starts
    initialize(sock) {
        if (unavailableSystem.isEnabled()) {
            console.log('🔴 Unavailable mode was enabled, starting maintenance...');
            unavailableSystem.startPresenceMaintenance(sock);
        }
    },

    getStatus() {
        return unavailableSystem.isEnabled();
    }
};
