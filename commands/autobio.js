const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// Simple autobio settings
const autobioData = {
    enabled: false,
    watermark: "WALLYJAYTECH-MD",
    lastUpdate: 0,
    timezone: settings.timezone || 'Africa/Lagos',
    templateIndex: 0
};

// Load/save autobio data
const AUTOBIO_FILE = path.join(__dirname, '../data/autobio.json');

function loadAutobioData() {
    try {
        if (fs.existsSync(AUTOBIO_FILE)) {
            const data = JSON.parse(fs.readFileSync(AUTOBIO_FILE, 'utf8'));
            autobioData.enabled = data.enabled || false;
            autobioData.watermark = data.watermark || "WALLYJAYTECH-MD";
            autobioData.lastUpdate = data.lastUpdate || 0;
            autobioData.timezone = data.timezone || settings.timezone || 'Africa/Lagos';
            autobioData.templateIndex = data.templateIndex || 0;
        }
    } catch (error) {
        console.error('❌ Error loading autobio data:', error);
    }
}

function saveAutobioData() {
    try {
        const data = {
            enabled: autobioData.enabled,
            watermark: autobioData.watermark,
            lastUpdate: autobioData.lastUpdate,
            timezone: autobioData.timezone,
            templateIndex: autobioData.templateIndex
        };
        
        // Ensure data directory exists
        const dataDir = path.dirname(AUTOBIO_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(AUTOBIO_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving autobio data:', error);
    }
}

// Initialize autobio system
loadAutobioData();

class SimpleAutoBio {
    // Get current time with seconds IN YOUR TIMEZONE (12-hour format)
    static getCurrentTime() {
        try {
            const now = new Date();
            
            // Format in your timezone with seconds (12-hour format)
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: autobioData.timezone,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            return timeString;
        } catch (error) {
            // Fallback to UTC if timezone fails (12-hour format)
            const now = new Date();
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds} ${ampm}`;
        }
    }
    
    // Get greeting based on time IN YOUR TIMEZONE
    static getGreeting() {
        try {
            const now = new Date();
            const hour = now.toLocaleString('en-US', {
                timeZone: autobioData.timezone,
                hour12: false,
                hour: '2-digit'
            });
            
            const hourNum = parseInt(hour);
            
            if (hourNum >= 5 && hourNum < 12) return '🌅 Morning';
            if (hourNum >= 12 && hourNum < 17) return '☀️ Afternoon';
            if (hourNum >= 17 && hourNum < 21) return '🌇 Evening';
            return '🌙 Night';
        } catch (error) {
            // Fallback
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return '🌅 Morning';
            if (hour >= 12 && hour < 17) return '☀️ Afternoon';
            if (hour >= 17 && hour < 21) return '🌇 Evening';
            return '🌙 Night';
        }
    }
    
    // Generate bio text with smooth sequential seconds
    static generateBio() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const watermark = autobioData.watermark;
        
        // Simple templates (no rotation based on seconds)
        const templates = [
            `⏰ ${time} | ${watermark}`,
            `🕒 ${time} | ${watermark}`,
            `📱 ${time} | ${watermark}`,
            `🤖 ${time} | ${watermark}`
        ];
        
        // Use current template index (changes only every minute, not every second)
        return templates[autobioData.templateIndex];
    }
    
    // Update bio
    static async updateBio(sock) {
        if (!autobioData.enabled) return;
        
        try {
            const bioText = this.generateBio();
            
            // Update bio (character limit: 139 for WhatsApp)
            const finalBio = bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
            
            await sock.updateProfileStatus(finalBio);
            
            const now = Date.now();
            // Update template index every minute (not every second)
            const currentMinute = new Date().getMinutes();
            const previousMinute = autobioData.lastUpdate ? new Date(autobioData.lastUpdate).getMinutes() : -1;
            
            if (currentMinute !== previousMinute) {
                autobioData.templateIndex = (autobioData.templateIndex + 1) % 4;
                saveAutobioData();
            }
            
            if (now - autobioData.lastUpdate > 30000) { // Log only every 30 seconds to avoid spam
                console.log(`✅ Bio updated: "${finalBio}"`);
            }
            
            autobioData.lastUpdate = now;
            
        } catch (error) {
            console.error('❌ Error updating bio:', error);
        }
    }
}

module.exports = {
    name: 'autobio',
    description: 'Simple live time bio with watermark',
    
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
                    autobioData.enabled = true;
                    saveAutobioData();
                    
                    // Update bio immediately
                    await SimpleAutoBio.updateBio(sock);
                    
                    const currentTimeOn = SimpleAutoBio.getCurrentTime();
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Live Time Bio ENABLED*\n\nYour bio will now show live time with seconds!\n\n⏰ Timezone: ${autobioData.timezone}\n🕒 Current Time: ${currentTimeOn}\n🏷️ Watermark: ${autobioData.watermark}\n\nBio updates every second with smooth time!`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    autobioData.enabled = false;
                    saveAutobioData();
                    
                    // Clear bio
                    try {
                        await sock.updateProfileStatus("");
                        console.log('✅ Bio cleared');
                    } catch (error) {
                        console.error('Error clearing bio:', error);
                    }
                    
                    await sock.sendMessage(chatId, {
                        text: '❌ *Live Time Bio DISABLED*\n\nBio updates have been turned off and bio cleared.'
                    }, { quoted: message });
                    break;
                    
                case 'update':
                case 'now':
                    await SimpleAutoBio.updateBio(sock);
                    const currentTimeUpdate = SimpleAutoBio.getCurrentTime();
                    await sock.sendMessage(chatId, {
                        text: `✅ *Bio Updated!*\n\nCurrent time: ${currentTimeUpdate}\nYour bio has been updated.`
                    }, { quoted: message });
                    break;
                    
                case 'watermark':
                    const newWatermark = args.slice(1).join(' ');
                    if (newWatermark && newWatermark.length > 0) {
                        autobioData.watermark = newWatermark;
                        saveAutobioData();
                        
                        // Update bio with new watermark
                        await SimpleAutoBio.updateBio(sock);
                        
                        await sock.sendMessage(chatId, {
                            text: `🏷️ *Watermark Updated!*\n\nNew watermark: "${newWatermark}"\n\nBio has been updated with the new watermark.`
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `❌ Please provide a watermark!\n\nCurrent watermark: "${autobioData.watermark}"\n\nExample: .autobio watermark MY-BOT-NAME`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'timezone':
                    const newTimezone = args[1];
                    if (newTimezone) {
                        // Test if timezone is valid
                        try {
                            new Date().toLocaleString('en-US', { timeZone: newTimezone });
                            autobioData.timezone = newTimezone;
                            saveAutobioData();
                            
                            await sock.sendMessage(chatId, {
                                text: `🌍 *Timezone Updated!*\n\nNew timezone: ${newTimezone}\nCurrent time: ${SimpleAutoBio.getCurrentTime()}\n\nBio will now use this timezone.`
                            }, { quoted: message });
                        } catch (error) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid timezone! Use a valid IANA timezone.\n\nCurrent timezone: ${autobioData.timezone}\n\nExamples:\n• Africa/Lagos\n• America/New_York\n• Europe/London\n• Asia/Tokyo`
                            }, { quoted: message });
                        }
                    } else {
                        const currentTimeZone = SimpleAutoBio.getCurrentTime();
                        await sock.sendMessage(chatId, {
                            text: `🌍 *Current Timezone:* ${autobioData.timezone}\n⏰ Current Time: ${currentTimeZone}\n\nTo change: .autobio timezone Africa/Lagos`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'status':
                case 'info':
                    const status = autobioData.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = autobioData.lastUpdate ? 
                        new Date(autobioData.lastUpdate).toLocaleTimeString() : 'Never';
                    const currentTimeStatus = SimpleAutoBio.getCurrentTime();
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *Live Time Bio Status*\n\nStatus: ${status}\nTimezone: ${autobioData.timezone}\nCurrent Time: ${currentTimeStatus}\nWatermark: ${autobioData.watermark}\nTemplate: ${autobioData.templateIndex + 1}/4\nLast Update: ${lastUpdate}\n\n*Commands:*\n• .autobio on/off - Enable/disable\n• .autobio update - Update now\n• .autobio watermark <text> - Change watermark\n• .autobio timezone <zone> - Change timezone\n• .autobio status - Show status`
                    }, { quoted: message });
                    break;
                    
                case 'demo':
                    // Show sample bios
                    const currentTimeDemo = SimpleAutoBio.getCurrentTime();
                    const samples = [
                        `⏰ ${currentTimeDemo} | ${autobioData.watermark}`,
                        `🕒 ${currentTimeDemo} | ${autobioData.watermark}`,
                        `📱 ${currentTimeDemo} | ${autobioData.watermark}`,
                        `🤖 ${currentTimeDemo} | ${autobioData.watermark}`
                    ];
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *Sample Bio Formats:*\n\n${samples.join('\n')}\n\n*Timezone:* ${autobioData.timezone}\n*Watermark:* ${autobioData.watermark}`
                    }, { quoted: message });
                    break;
                    
                default:
                    const currentTimeDefault = SimpleAutoBio.getCurrentTime();
                    await sock.sendMessage(chatId, {
                        text: `⏰ *Live Time Bio*\n\nLive bio with seconds in your timezone!\n\n*Current Time:* ${currentTimeDefault}\n*Timezone:* ${autobioData.timezone}\n*Watermark:* ${autobioData.watermark}\n\n*Usage:* .autobio <command>\n\n*Commands:*\n• on/off - Enable/disable live bio\n• update - Update bio immediately\n• watermark <text> - Set your watermark\n• timezone <zone> - Change timezone\n• status - Show system status\n• demo - Show sample formats\n\n*Current Status:* ${autobioData.enabled ? '🟢 Enabled' : '🔴 Disabled'}`
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
    
    // Function to be called every SECOND from main.js
    async updateBioIfNeeded(sock) {
        await SimpleAutoBio.updateBio(sock);
    },
    
    // Get autobio status
    getStatus() {
        return {
            enabled: autobioData.enabled,
            watermark: autobioData.watermark,
            timezone: autobioData.timezone,
            lastUpdate: autobioData.lastUpdate
        };
    }
};
