const fs = require('fs');
const path = require('path');

// Simple AutoBio configuration
const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');

class SimpleAutoBioManager {
    constructor() {
        this.data = {
            enabled: true, // Default enabled
            text: "POWERED BY WALLYJAYTECH-MD",
            lastUpdate: 0
        };
        this.load();
    }

    // Load data from file
    load() {
        try {
            if (fs.existsSync(AUTOBIO_FILE)) {
                const saved = JSON.parse(fs.readFileSync(AUTOBIO_FILE, 'utf8'));
                this.data = { ...this.data, ...saved };
                console.log('📂 AutoBio data loaded');
            } else {
                this.save();
            }
        } catch (error) {
            console.error('❌ Error loading autobio:', error);
        }
    }

    // Save data to file
    save() {
        try {
            const dir = path.dirname(AUTOBIO_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(AUTOBIO_FILE, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('❌ Error saving autobio:', error);
        }
    }

    // Update bio with static text
    async updateBio(sock) {
        if (!this.data.enabled) return false;
        
        const now = Date.now();
        
        // Only update every hour to avoid rate limiting
        if (now - this.data.lastUpdate < 3600000) return false;
        
        try {
            await sock.updateProfileStatus(this.data.text);
            this.data.lastUpdate = now;
            this.save();
            console.log(`✅ Bio updated: "${this.data.text}"`);
            return true;
        } catch (error) {
            console.error('❌ Error updating bio:', error);
            return false;
        }
    }

    // Force immediate update
    async forceUpdate(sock) {
        if (!this.data.enabled) return false;
        try {
            await sock.updateProfileStatus(this.data.text);
            this.data.lastUpdate = Date.now();
            this.save();
            console.log(`✅ Bio forced update: "${this.data.text}"`);
            return true;
        } catch (error) {
            console.error('❌ Error forcing bio update:', error);
            return false;
        }
    }

    // Set custom text
    async setText(sock, newText) {
        if (!newText || newText.length === 0) return false;
        
        // WhatsApp bio max length is 139 characters
        this.data.text = newText.length > 139 ? newText.substring(0, 136) + '...' : newText;
        this.save();
        
        // Immediately update with new text
        return await this.forceUpdate(sock);
    }
}

// Create manager instance
const manager = new SimpleAutoBioManager();

module.exports = {
    name: 'autobio',
    description: 'Simple auto bio',
    
    async execute(sock, chatId, message, args) {
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            
            // Check if user is authorized (owner only)
            const { isOwnerOrSudo } = require('../lib/isOwner');
            const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
            
            if (!isAuthorized) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner can use autobio commands!'
                }, { quoted: message });
                return;
            }
            
            const action = args[0]?.toLowerCase();
            const customText = args.slice(1).join(' ');
            
            switch (action) {
                case 'on':
                case 'enable':
                    manager.data.enabled = true;
                    manager.save();
                    await manager.forceUpdate(sock);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *AutoBio ENABLED*\n\n` +
                              `📱 *Current Bio:* ${manager.data.text}\n\n` +
                              `*Bio updates every hour*`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    manager.data.enabled = false;
                    manager.save();
                    
                    await sock.sendMessage(chatId, {
                        text: `❌ *AutoBio DISABLED*`
                    }, { quoted: message });
                    break;
                    
                case 'set':
                    if (!customText) {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ *Usage:* .autobio set <your text>\n\n` +
                                  `*Example:* .autobio set POWERED BY WALLYJAYTECH-MD`
                        }, { quoted: message });
                        return;
                    }
                    
                    await manager.setText(sock, customText);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Bio text updated!*\n\n` +
                              `📱 *New Bio:* ${manager.data.text}`
                    }, { quoted: message });
                    break;
                    
                case 'status':
                case 'info':
                    const status = manager.data.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = manager.data.lastUpdate > 0 ? 
                        new Date(manager.data.lastUpdate).toLocaleString() : 'Never';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *AutoBio Status*\n\n` +
                              `*Status:* ${status}\n` +
                              `*Current Bio:* ${manager.data.text}\n` +
                              `*Last Update:* ${lastUpdate}\n\n` +
                              `*Commands:*\n` +
                              `• .autobio on - Enable\n` +
                              `• .autobio off - Disable\n` +
                              `• .autobio set <text> - Set custom bio\n` +
                              `• .autobio status - Show status`
                    }, { quoted: message });
                    break;
                    
                default:
                    const currentStatus = manager.data.enabled ? '🟢 ON' : '🔴 OFF';
                    
                    await sock.sendMessage(chatId, {
                        text: `⏰ *AutoBio Commands*\n\n` +
                              `*Status:* ${currentStatus}\n` +
                              `*Current Bio:* ${manager.data.text}\n\n` +
                              `*Commands:*\n` +
                              `• .autobio on - Enable\n` +
                              `• .autobio off - Disable\n` +
                              `• .autobio set <text> - Set custom bio\n` +
                              `• .autobio status - Show status\n\n` +
                              `*Example:*\n` +
                              `.autobio set POWERED BY WALLYJAYTECH-MD`
                    }, { quoted: message });
                    break;
            }
            
        } catch (error) {
            console.error('❌ AutoBio command error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error executing autobio command!'
            }, { quoted: message });
        }
    },
    
    // Called every minute from main.js (but will only update every hour)
    async updateBioIfNeeded(sock) {
        return await manager.updateBio(sock);
    },
    
    // Called on bot connect
    async startOnConnect(sock) {
        if (manager.data.enabled) {
            console.log('🚀 Starting AutoBio...');
            return await manager.forceUpdate(sock);
        }
        return false;
    }
};
