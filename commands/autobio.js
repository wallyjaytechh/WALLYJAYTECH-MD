const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// AutoBio configuration
const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');

class AutoBioManager {
    constructor() {
        this.data = {
            enabled: true, // DEFAULT ENABLED - bot connects with autobio ON
            watermark: "WALLYJAYTECH-MD",
            lastUpdate: 0,
            timezone: settings.timezone || 'Africa/Lagos',
            updateCount: 0
        };
        this.load();
        console.log('🤖 AutoBio initialized - Default: ENABLED (updates every 30 seconds)');
    }

    // Load data from file
    load() {
        try {
            if (fs.existsSync(AUTOBIO_FILE)) {
                const saved = JSON.parse(fs.readFileSync(AUTOBIO_FILE, 'utf8'));
                this.data = { ...this.data, ...saved };
                console.log('📂 AutoBio data loaded');
            } else {
                // Save default enabled state
                this.save();
                console.log('📂 AutoBio created with default ENABLED state');
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

    // Get short greeting (without "GOOD")
    getShortGreeting() {
        const full = this.getGreeting();
        return full.replace('GOOD ', '');
    }

    // Generate bio text
    generateBio() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const shortGreeting = this.getShortGreeting();
        const watermark = this.data.watermark;
        
        // Templates array - 8 different formats alternating between full and short greeting
        const templates = [
            `⏰ ${time} | ${greeting} | ${watermark}`,
            `🕒 ${time} | ${greeting} | ${watermark}`,
            `📱 ${time} | ${greeting} | ${watermark}`,
            `🤖 ${time} | ${greeting} | ${watermark}`,
            `🚀 ${time} | ${greeting} | ${watermark}`,
            `💫 ${time} | ${shortGreeting} | ${watermark}`,
            `⭐ ${time} | ${shortGreeting} | ${watermark}`,
            `🎯 ${time} | ${shortGreeting} | ${watermark}`
        ];
        
        // Rotate template every 30 seconds
        const index = Math.floor(Date.now() / 30000) % templates.length;
        return templates[index];
    }

    // Update bio if enabled and rate limit allows
    async updateBio(sock) {
        if (!this.data.enabled) {
            return;
        }
        
        const now = Date.now();
        const timeSinceLastUpdate = now - this.data.lastUpdate;
        
        // Rate limiting: Update every 30 seconds
        if (timeSinceLastUpdate < 30000) {
            return;
        }
        
        try {
            const bioText = this.generateBio();
            
            // WhatsApp bio max length is 139 characters
            const finalBio = bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
            
            await sock.updateProfileStatus(finalBio);
            
            this.data.lastUpdate = now;
            this.data.updateCount++;
            this.save();
            
            console.log(`✅ Bio updated (${this.data.updateCount}): "${finalBio}"`);
            
        } catch (error) {
            console.error('❌ Error updating bio:', error);
            
            // If rate limited, wait longer
            if (error.message?.includes('rate-overlimit') || error.data === 429) {
                console.log('⚠️ Rate limit hit, waiting 2 minutes');
                this.data.lastUpdate = now + 120000; // Wait 2 minutes
                this.save();
            }
        }
    }

    // Get demo samples with consistent format
    getDemoSamples() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const shortGreeting = this.getShortGreeting();
        const watermark = this.data.watermark;
        
        return [
            `⏰ ${time} | ${greeting} | ${watermark}`,
            `🕒 ${time} | ${greeting} | ${watermark}`,
            `📱 ${time} | ${greeting} | ${watermark}`,
            `🤖 ${time} | ${greeting} | ${watermark}`,
            `🚀 ${time} | ${greeting} | ${watermark}`,
            `💫 ${time} | ${shortGreeting} | ${watermark}`,
            `⭐ ${time} | ${shortGreeting} | ${watermark}`,
            `🎯 ${time} | ${shortGreeting} | ${watermark}`
        ];
    }
}

// Create manager instance
const manager = new AutoBioManager();

module.exports = {
    name: 'autobio',
    description: 'Live time bio with greeting (updates every 30 seconds)',
    
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
                              `📱 *Update Frequency:* Every 30 seconds\n` +
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
                                      `Examples: Africa/Lagos, America/New_York, Asia/Tokyo`
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
                        `Next update in ${Math.max(0, Math.floor((30000 - (Date.now() - manager.data.lastUpdate)) / 1000))}s` : 
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
                              `📱 *Update Frequency:* Every 30 seconds`
                    }, { quoted: message });
                    break;
                    
                case 'demo':
                    const samples = manager.getDemoSamples();
                    const currentBio = manager.generateBio();
                    
                    // Format samples with numbers
                    const sampleList = samples.map((sample, i) => `${i+1}. ${sample}`).join('\n');
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *AutoBio Sample Formats*\n\n` +
                              `${sampleList}\n\n` +
                              `📱 *Current Active Template:*\n` +
                              `\`${currentBio}\`\n\n` +
                              `⏰ *Current Time:* ${manager.getCurrentTime()}\n` +
                              `${manager.getGreeting()}\n` +
                              `🏷️ *Watermark:* ${manager.data.watermark}\n` +
                              `🌍 *Timezone:* ${manager.data.timezone}\n\n` +
                              `⚡ *Updates every 30 seconds*\n` +
                              `🔄 *Template rotates every 30 seconds*\n` +
                              `📱 *Works on iOS & Android*\n\n` +
                              `*Note:* First 5 samples show FULL greeting (GOOD MORNING/AFTERNOON/EVENING/NIGHT)\n` +
                              `*Note:* Last 3 samples show SHORT greeting (MORNING/AFTERNOON/EVENING/NIGHT)`
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `⏰ *AutoBio Commands*\n\n` +
                              `*Current Status:* ${manager.data.enabled ? '🟢 ON' : '🔴 OFF'}\n` +
                              `*Current Time:* ${manager.getCurrentTime()}\n` +
                              `*${manager.getGreeting()}*\n` +
                              `*Timezone:* ${manager.data.timezone}\n` +
                              `*Watermark:* ${manager.data.watermark}\n` +
                              `*Total Updates:* ${manager.data.updateCount}\n\n` +
                              `📱 *Updates every 30 seconds*\n\n` +
                              `*Commands:*\n` +
                              `• .autobio on - Enable auto bio\n` +
                              `• .autobio off - Disable auto bio\n` +
                              `• .autobio update - Update now\n` +
                              `• .autobio watermark <text> - Change watermark\n` +
                              `• .autobio timezone <zone> - Change timezone\n` +
                              `• .autobio status - Show status\n` +
                              `• .autobio demo - Show all formats`
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
    
    // Function to be called every 30 seconds from main.js
    async updateBioIfNeeded(sock) {
        await manager.updateBio(sock);
    }
};

