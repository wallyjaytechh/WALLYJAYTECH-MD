const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// AutoBio configuration
const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');

class AutoBioManager {
    constructor() {
        this.data = {
            enabled: false,
            watermark: "WALLYJAYTECH-MD",
            lastUpdate: 0,
            timezone: settings.timezone || 'Africa/Lagos',
            updateCount: 0
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

    // Get current time in configured timezone
    getCurrentTime() {
        try {
            return new Date().toLocaleTimeString('en-US', {
                timeZone: this.data.timezone,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            // Fallback
            const d = new Date();
            let hours = d.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds} ${ampm}`;
        }
    }

    // Get greeting based on time
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

    // Get short greeting
    getShortGreeting() {
        const full = this.getGreeting();
        return full.replace('GOOD ', '');
    }

    // Generate bio text - THIS IS THE KEY FUNCTION
    generateBio() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const shortGreeting = this.getShortGreeting();
        const watermark = this.data.watermark;
        
        // Log what we're generating
        console.log(`⏰ Generating bio with:`);
        console.log(`   Time: ${time}`);
        console.log(`   Greeting: ${greeting}`);
        console.log(`   Short: ${shortGreeting}`);
        console.log(`   Watermark: ${watermark}`);
        
        // Simple template - ALWAYS include greeting
        const bioText = `⏰ ${time} | ${greeting} | ${watermark}`;
        
        // WhatsApp bio max length is 139 characters
        return bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
    }

    // Update bio if enabled and rate limit allows
    async updateBio(sock) {
        if (!this.data.enabled) {
            console.log('⏸️ AutoBio is disabled');
            return;
        }
        
        const now = Date.now();
        const timeSinceLastUpdate = now - this.data.lastUpdate;
        
        // Rate limiting: Only update every minute
        if (timeSinceLastUpdate < 60000) {
            console.log(`⏳ Next update in ${Math.ceil((60000 - timeSinceLastUpdate)/1000)}s`);
            return;
        }
        
        try {
            const bioText = this.generateBio();
            
            console.log(`📝 Updating bio to: "${bioText}"`);
            await sock.updateProfileStatus(bioText);
            
            this.data.lastUpdate = now;
            this.data.updateCount++;
            this.save();
            
            console.log(`✅ Bio updated successfully! (Update #${this.data.updateCount})`);
            
        } catch (error) {
            console.error('❌ Error updating bio:', error);
            
            // If rate limited, wait longer
            if (error.message?.includes('rate-overlimit') || error.data === 429) {
                console.log('⚠️ Rate limit hit, waiting 5 minutes');
                this.data.lastUpdate = now + 300000;
                this.save();
            }
        }
    }

    // Get demo samples
    getDemoSamples() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const shortGreeting = this.getShortGreeting();
        const watermark = this.data.watermark;
        
        return [
            `⏰ ${time} | ${greeting} | ${watermark}`,
            `🕒 ${time} | ${greeting} | ${watermark}`,
            `📱 ${time} | ${greeting} | ${watermark}`,
            `🤖 ${time} | ${shortGreeting} | ${watermark}`,
            `🚀 ${time} | ${shortGreeting} | ${watermark}`
        ];
    }
}

// Create manager instance
const manager = new AutoBioManager();

module.exports = {
    name: 'autobio',
    description: 'Live time bio with greeting',
    
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
            
            switch (action) {
                case 'on':
                case 'enable':
                    manager.data.enabled = true;
                    manager.data.lastUpdate = 0; // Force immediate update
                    manager.save();
                    
                    // Update bio immediately
                    await manager.updateBio(sock);
                    
                    const currentTimeOn = manager.getCurrentTime();
                    const currentGreetingOn = manager.getGreeting();
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Live Time Bio ENABLED*\n\n` +
                              `⏰ Timezone: ${manager.data.timezone}\n` +
                              `🕒 Current Time: ${currentTimeOn}\n` +
                              `${currentGreetingOn}\n` +
                              `🏷️ Watermark: ${manager.data.watermark}\n\n` +
                              `📱 *Update Frequency:* Every minute\n` +
                              `🔄 *Total Updates:* ${manager.data.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    manager.data.enabled = false;
                    manager.save();
                    
                    // Clear bio
                    try {
                        await sock.updateProfileStatus("");
                        console.log('✅ Bio cleared');
                    } catch (error) {
                        console.error('Error clearing bio:', error);
                    }
                    
                    await sock.sendMessage(chatId, {
                        text: `❌ *Live Time Bio DISABLED*\n\nTotal updates: ${manager.data.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'update':
                case 'now':
                    await manager.updateBio(sock);
                    const currentTimeUpdate = manager.getCurrentTime();
                    const currentGreetingUpdate = manager.getGreeting();
                    await sock.sendMessage(chatId, {
                        text: `✅ *Bio Updated!*\n\n` +
                              `Current time: ${currentTimeUpdate}\n` +
                              `${currentGreetingUpdate}\n` +
                              `Total updates: ${manager.data.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'watermark':
                    const newWatermark = args.slice(1).join(' ');
                    if (newWatermark && newWatermark.length > 0) {
                        manager.data.watermark = newWatermark;
                        manager.save();
                        
                        await manager.updateBio(sock);
                        
                        await sock.sendMessage(chatId, {
                            text: `🏷️ *Watermark Updated!*\n\nNew watermark: "${newWatermark}"`
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `❌ Please provide a watermark!\n\n` +
                                  `Current: "${manager.data.watermark}"\n` +
                                  `Example: .autobio watermark MY-BOT`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'timezone':
                    const newTimezone = args[1];
                    if (newTimezone) {
                        try {
                            // Test if timezone is valid
                            new Date().toLocaleString('en-US', { timeZone: newTimezone });
                            manager.data.timezone = newTimezone;
                            manager.save();
                            
                            await sock.sendMessage(chatId, {
                                text: `🌍 *Timezone Updated!*\n\n` +
                                      `New: ${newTimezone}\n` +
                                      `Current: ${manager.getCurrentTime()}\n` +
                                      `${manager.getGreeting()}`
                            }, { quoted: message });
                        } catch (error) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid timezone!\n\n` +
                                      `Current: ${manager.data.timezone}\n` +
                                      `Examples: Africa/Lagos, America/New_York`
                            }, { quoted: message });
                        }
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `🌍 *Current Timezone:* ${manager.data.timezone}\n` +
                                  `⏰ Current Time: ${manager.getCurrentTime()}\n` +
                                  `${manager.getGreeting()}`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'status':
                case 'info':
                    const status = manager.data.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = manager.data.lastUpdate ? 
                        new Date(manager.data.lastUpdate).toLocaleTimeString() : 'Never';
                    const nextUpdate = manager.data.lastUpdate ? 
                        `Next update in ${Math.max(0, Math.floor((60000 - (Date.now() - manager.data.lastUpdate)) / 1000))}s` : 
                        'Next update: Soon';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *Live Time Bio Status*\n\n` +
                              `Status: ${status}\n` +
                              `Timezone: ${manager.data.timezone}\n` +
                              `Current Time: ${manager.getCurrentTime()}\n` +
                              `${manager.getGreeting()}\n` +
                              `Watermark: ${manager.data.watermark}\n` +
                              `Last Update: ${lastUpdate}\n` +
                              `Total Updates: ${manager.data.updateCount}\n` +
                              `${nextUpdate}\n\n` +
                              `📱 *Update Frequency:* Every minute`
                    }, { quoted: message });
                    break;
                    
                case 'demo':
                    const samples = manager.getDemoSamples();
                    const currentBio = manager.generateBio();
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *Sample Bio Formats:*\n\n${samples.join('\n')}\n\n` +
                              `📱 *Current Bio Template:*\n\`${currentBio}\`\n\n` +
                              `*Time:* ${manager.getCurrentTime()}\n` +
                              `*Greeting:* ${manager.getGreeting()}\n` +
                              `*Watermark:* ${manager.data.watermark}\n\n` +
                              `📱 *How it works:*\n` +
                              `• Updates every minute\n` +
                              `• Shows live time with greeting\n` +
                              `• Works on both iOS & Android\n` +
                              `• Timezone: ${manager.data.timezone}`
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `⏰ *Live Time Bio*\n\n` +
                              `*Current Time:* ${manager.getCurrentTime()}\n` +
                              `*${manager.getGreeting()}*\n` +
                              `*Timezone:* ${manager.data.timezone}\n` +
                              `*Watermark:* ${manager.data.watermark}\n` +
                              `*Total Updates:* ${manager.data.updateCount}\n\n` +
                              `📱 *Platforms:* iOS & Android\n` +
                              `🔄 *Updates:* Every minute\n\n` +
                              `*Commands:*\n` +
                              `• on/off - Enable/disable\n` +
                              `• update - Update now\n` +
                              `• watermark <text> - Change watermark\n` +
                              `• timezone <zone> - Change timezone\n` +
                              `• status - Show status\n` +
                              `• demo - Show sample formats`
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
    
    // Function to be called every minute from main.js
    async updateBioIfNeeded(sock) {
        await manager.updateBio(sock);
    }
};
