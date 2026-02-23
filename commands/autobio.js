const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// AutoBio configuration
const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');

class AutoBioManager {
    constructor() {
        this.data = {
            enabled: true, // DEFAULT ENABLED
            watermark: "WALLYJAYTECH-MD",
            lastUpdate: 0,
            timezone: settings.timezone || 'Africa/Lagos', // Use settings.js timezone
            updateCount: 0
        };
        this.load();
        console.log(`🤖 AutoBio initialized - Timezone: ${this.data.timezone}`);
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

    // Get current time in configured timezone (from settings.js)
    getCurrentTime() {
        try {
            return new Date().toLocaleTimeString('en-US', {
                timeZone: this.data.timezone,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            // Fallback if timezone invalid
            const d = new Date();
            let hours = d.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes} ${ampm}`;
        }
    }

    // Get full date
    getCurrentDate() {
        try {
            return new Date().toLocaleDateString('en-US', {
                timeZone: this.data.timezone,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            const d = new Date();
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    // Get greeting based on current hour
    getGreeting() {
        try {
            const hour = parseInt(new Date().toLocaleString('en-US', {
                timeZone: this.data.timezone,
                hour: '2-digit',
                hour12: false
            }));
            
            if (hour >= 5 && hour < 12) return '🌅 GOOD MORNING';
            if (hour >= 12 && hour < 17) return '☀️ GOOD AFTERNOON';
            if (hour >= 17 && hour < 21) return '🌇 GOOD EVENING';
            return '🌙 GOOD NIGHT';
        } catch {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return '🌅 GOOD MORNING';
            if (hour >= 12 && hour < 17) return '☀️ GOOD AFTERNOON';
            if (hour >= 17 && hour < 21) return '🌇 GOOD EVENING';
            return '🌙 GOOD NIGHT';
        }
    }

    // Generate bio text with current real time
    generateBio() {
        const time = this.getCurrentTime();
        const date = this.getCurrentDate();
        const greeting = this.getGreeting();
        const watermark = this.data.watermark;
        
        // Templates that update with real time
        const templates = [
            `⏰ ${time} • ${greeting} • ${watermark}`,
            `🕒 ${time} • ${date} • ${watermark}`,
            `📱 ${time} • ${greeting} • ${watermark}`,
            `🤖 ${time} • ${watermark}`,
            `⏰ ${time} • ${date}`,
            `✨ ${greeting} • ${time}`,
            `⭐ ${time} • ${watermark}`,
            `🌍 ${time} • ${date} • ${watermark}`
        ];
        
        // Rotate template every minute
        const index = Math.floor(Date.now() / 60000) % templates.length;
        return templates[index];
    }

    // Update bio with current time
    async updateBio(sock) {
        if (!this.data.enabled) return false;
        
        const now = Date.now();
        
        // Only update if at least 50 seconds have passed (to avoid duplicate minute updates)
        if (now - this.data.lastUpdate < 50000) return false;
        
        try {
            const bioText = this.generateBio();
            
            // WhatsApp bio max length is 139 characters
            const finalBio = bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
            
            await sock.updateProfileStatus(finalBio);
            
            this.data.lastUpdate = now;
            this.data.updateCount++;
            this.save();
            
            console.log(`✅ Bio updated: "${finalBio}"`);
            return true;
            
        } catch (error) {
            console.error('❌ Error updating bio:', error);
            
            // If rate limited, wait longer
            if (error.message?.includes('rate') || error.data === 429) {
                console.log('⚠️ Rate limited - will retry later');
                this.data.lastUpdate = now + 120000; // Wait 2 minutes
                this.save();
            }
            return false;
        }
    }

    // Force immediate update
    async forceUpdate(sock) {
        this.data.lastUpdate = 0; // Reset last update
        return await this.updateBio(sock);
    }
}

// Create manager instance
const manager = new AutoBioManager();

module.exports = {
    name: 'autobio',
    description: 'Real-time bio that updates every minute',
    
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
            
            // Show current bio as preview
            const currentBio = manager.generateBio();
            const currentTime = manager.getCurrentTime();
            const currentDate = manager.getCurrentDate();
            const currentGreeting = manager.getGreeting();
            
            switch (action) {
                case 'on':
                case 'enable':
                    manager.data.enabled = true;
                    manager.save();
                    
                    // Force immediate update
                    await manager.forceUpdate(sock);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *AutoBio ENABLED*\n\n` +
                              `🌍 *Timezone:* ${manager.data.timezone}\n` +
                              `⏰ *Current Time:* ${currentTime}\n` +
                              `📅 *Date:* ${currentDate}\n` +
                              `👋 *Greeting:* ${currentGreeting}\n` +
                              `🏷️ *Watermark:* ${manager.data.watermark}\n\n` +
                              `📱 *Updates every minute*\n` +
                              `🔄 *Total updates:* ${manager.data.updateCount}\n\n` +
                              `*Preview:*\n${currentBio}`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    manager.data.enabled = false;
                    manager.save();
                    
                    // Clear bio
                    try {
                        await sock.updateProfileStatus("");
                    } catch (error) {}
                    
                    await sock.sendMessage(chatId, {
                        text: `❌ *AutoBio DISABLED*\n\nTotal updates: ${manager.data.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'status':
                case 'info':
                    const status = manager.data.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = manager.data.lastUpdate > 0 ? 
                        new Date(manager.data.lastUpdate).toLocaleTimeString() : 'Never';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *AutoBio Status*\n\n` +
                              `*Status:* ${status}\n` +
                              `*Timezone:* ${manager.data.timezone}\n` +
                              `*Current Time:* ${currentTime}\n` +
                              `*Date:* ${currentDate}\n` +
                              `*Greeting:* ${currentGreeting}\n` +
                              `*Watermark:* ${manager.data.watermark}\n` +
                              `*Last Update:* ${lastUpdate}\n` +
                              `*Total Updates:* ${manager.data.updateCount}\n\n` +
                              `*Current Bio:*\n${currentBio}`
                    }, { quoted: message });
                    break;
                    
                case 'timezone':
                    // Show current timezone from settings.js
                    await sock.sendMessage(chatId, {
                        text: `🌍 *Timezone Information*\n\n` +
                              `*Configured:* ${manager.data.timezone}\n` +
                              `*Current Time:* ${currentTime}\n` +
                              `*Date:* ${currentDate}\n` +
                              `*Greeting:* ${currentGreeting}\n\n` +
                              `To change timezone, edit settings.js`
                    }, { quoted: message });
                    break;
                    
                case 'preview':
                    // Show all template variations with current time
                    const templates = [
                        `⏰ ${currentTime} • ${currentGreeting} • ${manager.data.watermark}`,
                        `🕒 ${currentTime} • ${currentDate} • ${manager.data.watermark}`,
                        `📱 ${currentTime} • ${currentGreeting} • ${manager.data.watermark}`,
                        `🤖 ${currentTime} • ${manager.data.watermark}`,
                        `⏰ ${currentTime} • ${currentDate}`,
                        `✨ ${currentGreeting} • ${currentTime}`,
                        `⭐ ${currentTime} • ${manager.data.watermark}`,
                        `🌍 ${currentTime} • ${currentDate} • ${manager.data.watermark}`
                    ];
                    
                    const previewList = templates.map((t, i) => `${i+1}. ${t}`).join('\n');
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *AutoBio Preview*\n\n` +
                              `${previewList}\n\n` +
                              `*Current Active:*\n${currentBio}\n\n` +
                              `⏰ *Time:* ${currentTime}\n` +
                              `📅 *Date:* ${currentDate}\n` +
                              `👋 *Greeting:* ${currentGreeting}\n` +
                              `🌍 *Timezone:* ${manager.data.timezone}`
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `⏰ *AutoBio Commands*\n\n` +
                              `*Status:* ${manager.data.enabled ? '🟢 ON' : '🔴 OFF'}\n` +
                              `*Current Bio:*\n${currentBio}\n\n` +
                              `*Commands:*\n` +
                              `• .autobio on - Enable\n` +
                              `• .autobio off - Disable\n` +
                              `• .autobio status - Show status\n` +
                              `• .autobio timezone - Show timezone\n` +
                              `• .autobio preview - Show all formats\n\n` +
                              `🌍 *Timezone:* ${manager.data.timezone}\n` +
                              `⏰ *Time:* ${currentTime}\n` +
                              `📅 *Date:* ${currentDate}`
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
    
    // Called every minute from main.js
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
