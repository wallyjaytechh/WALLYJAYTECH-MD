const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// Simple autobio settings
const autobioData = {
    enabled: false,
    watermark: "WALLYJAYTECH-MD",
    lastUpdate: 0,
    timezone: settings.timezone || 'Africa/Lagos',
    templateIndex: 0,
    updateCount: 0
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
            autobioData.updateCount = data.updateCount || 0;
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
            templateIndex: autobioData.templateIndex,
            updateCount: autobioData.updateCount
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
            hours = hours ? hours : 12;
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds} ${ampm}`;
        }
    }
    
    // Get greeting based on time (with emoji and text)
    static getGreeting() {
        try {
            const now = new Date();
            const hour = now.toLocaleString('en-US', {
                timeZone: autobioData.timezone,
                hour12: false,
                hour: '2-digit'
            });
            
            const hourNum = parseInt(hour);
            
            if (hourNum >= 5 && hourNum < 12) return '🌅 GOOD MORNING';
            if (hourNum >= 12 && hourNum < 17) return '☀️ GOOD AFTERNOON';
            if (hourNum >= 17 && hourNum < 21) return '🌇 GOOD EVENING';
            return '🌙 GOOD NIGHT';
        } catch (error) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return '🌅 GOOD MORNING';
            if (hour >= 12 && hour < 17) return '☀️ GOOD AFTERNOON';
            if (hour >= 17 && hour < 21) return '🌇 GOOD EVENING';
            return '🌙 GOOD NIGHT';
        }
    }
    
    // Get abbreviated greeting for shorter bio
    static getShortGreeting() {
        try {
            const now = new Date();
            const hour = now.toLocaleString('en-US', {
                timeZone: autobioData.timezone,
                hour12: false,
                hour: '2-digit'
            });
            
            const hourNum = parseInt(hour);
            
            if (hourNum >= 5 && hourNum < 12) return '🌅 MORNING';
            if (hourNum >= 12 && hourNum < 17) return '☀️ AFTERNOON';
            if (hourNum >= 17 && hourNum < 21) return '🌇 EVENING';
            return '🌙 NIGHT';
        } catch (error) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return '🌅 MORNING';
            if (hour >= 12 && hour < 17) return '☀️ AFTERNOON';
            if (hour >= 17 && hour < 21) return '🌇 EVENING';
            return '🌙 NIGHT';
        }
    }
    
    // Generate bio text with greeting
    static generateBio() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const shortGreeting = this.getShortGreeting();
        const watermark = autobioData.watermark;
        
        // Templates with greeting
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
        
        // Rotate template every 5 minutes
        const current5MinuteBlock = Math.floor(Date.now() / 300000); // 5 minutes in milliseconds
        const templateIndex = current5MinuteBlock % templates.length;
        
        return templates[templateIndex];
    }
    
    // Update bio with minute-by-minute rate limiting
    static async updateBio(sock) {
        if (!autobioData.enabled) return;
        
        const now = Date.now();
        const timeSinceLastUpdate = now - autobioData.lastUpdate;
        
        // Rate limiting: Only update every minute to avoid WhatsApp blocks
        if (timeSinceLastUpdate < 60000) { // 1 minute
            return;
        }
        
        try {
            const bioText = this.generateBio();
            
            // Update bio (WhatsApp bio max length is 139 characters)
            const finalBio = bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
            
            await sock.updateProfileStatus(finalBio);
            
            autobioData.lastUpdate = now;
            autobioData.updateCount++;
            saveAutobioData();
            
            console.log(`✅ Bio updated (${autobioData.updateCount}): "${finalBio}"`);
            
        } catch (error) {
            console.error('❌ Error updating bio:', error);
            
            // If we hit rate limit, wait longer before next update
            if (error.message.includes('rate-overlimit') || error.data === 429) {
                console.log('⚠️ Rate limit hit, waiting 5 minutes before next update');
                autobioData.lastUpdate = now + 300000; // Wait 5 minutes
                saveAutobioData();
            }
        }
    }
}

module.exports = {
    name: 'autobio',
    description: 'Live time bio with minute updates and greeting',
    
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
                    autobioData.lastUpdate = 0; // Force immediate update
                    saveAutobioData();
                    
                    // Update bio immediately
                    await SimpleAutoBio.updateBio(sock);
                    
                    const currentTimeOn = SimpleAutoBio.getCurrentTime();
                    const currentGreetingOn = SimpleAutoBio.getGreeting();
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Live Time Bio ENABLED*\n\n⏰ Timezone: ${autobioData.timezone}\n🕒 Current Time: ${currentTimeOn}\n${currentGreetingOn}\n🏷️ Watermark: ${autobioData.watermark}\n\n📱 *Update Frequency:* Every minute\n🔄 *Total Updates:* ${autobioData.updateCount}`
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
                        text: `❌ *Live Time Bio DISABLED*\n\nTotal updates: ${autobioData.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'update':
                case 'now':
                    await SimpleAutoBio.updateBio(sock);
                    const currentTimeUpdate = SimpleAutoBio.getCurrentTime();
                    const currentGreetingUpdate = SimpleAutoBio.getGreeting();
                    await sock.sendMessage(chatId, {
                        text: `✅ *Bio Updated!*\n\nCurrent time: ${currentTimeUpdate}\n${currentGreetingUpdate}\nTotal updates: ${autobioData.updateCount}`
                    }, { quoted: message });
                    break;
                    
                case 'watermark':
                    const newWatermark = args.slice(1).join(' ');
                    if (newWatermark && newWatermark.length > 0) {
                        autobioData.watermark = newWatermark;
                        saveAutobioData();
                        
                        await SimpleAutoBio.updateBio(sock);
                        
                        await sock.sendMessage(chatId, {
                            text: `🏷️ *Watermark Updated!*\n\nNew watermark: "${newWatermark}"`
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `❌ Please provide a watermark!\n\nCurrent: "${autobioData.watermark}"\nExample: .autobio watermark MY-BOT`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'timezone':
                    const newTimezone = args[1];
                    if (newTimezone) {
                        try {
                            new Date().toLocaleString('en-US', { timeZone: newTimezone });
                            autobioData.timezone = newTimezone;
                            saveAutobioData();
                            
                            await sock.sendMessage(chatId, {
                                text: `🌍 *Timezone Updated!*\n\nNew: ${newTimezone}\nCurrent: ${SimpleAutoBio.getCurrentTime()}\n${SimpleAutoBio.getGreeting()}`
                            }, { quoted: message });
                        } catch (error) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid timezone!\n\nCurrent: ${autobioData.timezone}\nExamples: Africa/Lagos, America/New_York`
                            }, { quoted: message });
                        }
                    } else {
                        const currentTimeZone = SimpleAutoBio.getCurrentTime();
                        const currentGreetingZone = SimpleAutoBio.getGreeting();
                        await sock.sendMessage(chatId, {
                            text: `🌍 *Current Timezone:* ${autobioData.timezone}\n⏰ Current Time: ${currentTimeZone}\n${currentGreetingZone}`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'status':
                case 'info':
                    const status = autobioData.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = autobioData.lastUpdate ? 
                        new Date(autobioData.lastUpdate).toLocaleTimeString() : 'Never';
                    const currentTimeStatus = SimpleAutoBio.getCurrentTime();
                    const currentGreetingStatus = SimpleAutoBio.getGreeting();
                    const nextUpdate = autobioData.lastUpdate ? 
                        `Next update in ${Math.max(0, Math.floor((60000 - (Date.now() - autobioData.lastUpdate)) / 1000))}s` : 
                        'Next update: Soon';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *Live Time Bio Status*\n\nStatus: ${status}\nTimezone: ${autobioData.timezone}\nCurrent Time: ${currentTimeStatus}\n${currentGreetingStatus}\nWatermark: ${autobioData.watermark}\nLast Update: ${lastUpdate}\nTotal Updates: ${autobioData.updateCount}\n${nextUpdate}\n\n📱 *Update Frequency:* Every minute\n🔄 *Template Rotation:* Every 5 minutes`
                    }, { quoted: message });
                    break;
                    
                case 'demo':
                    const currentTimeDemo = SimpleAutoBio.getCurrentTime();
                    const currentGreetingDemo = SimpleAutoBio.getGreeting();
                    const shortGreetingDemo = SimpleAutoBio.getShortGreeting();
                    const samples = [
                        `⏰ ${currentTimeDemo} | ${currentGreetingDemo} | ${autobioData.watermark}`,
                        `🕒 ${currentTimeDemo} | ${currentGreetingDemo} | ${autobioData.watermark}`,
                        `📱 ${currentTimeDemo} | ${currentGreetingDemo} | ${autobioData.watermark}`,
                        `🤖 ${currentTimeDemo} | ${shortGreetingDemo} | ${autobioData.watermark}`,
                        `🚀 ${currentTimeDemo} | ${shortGreetingDemo} | ${autobioData.watermark}`
                    ];
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *Sample Bio Formats:*\n\n${samples.join('\n')}\n\n📱 *How it works:*\n• Updates every minute\n• Shows live time with greeting\n• Works on both iOS & Android\n• Timezone: ${autobioData.timezone}\n• Template rotates every 5 minutes`
                    }, { quoted: message });
                    break;
                    
                default:
                    const currentTimeDefault = SimpleAutoBio.getCurrentTime();
                    const currentGreetingDefault = SimpleAutoBio.getGreeting();
                    await sock.sendMessage(chatId, {
                        text: `⏰ *Live Time Bio*\n\n*Current Time:* ${currentTimeDefault}\n*${currentGreetingDefault}*\n*Timezone:* ${autobioData.timezone}\n*Watermark:* ${autobioData.watermark}\n*Total Updates:* ${autobioData.updateCount}\n\n📱 *Platforms:* iOS & Android\n🔄 *Updates:* Every minute (safe frequency)\n\n*Commands:*\n• on/off - Enable/disable\n• update - Update now\n• watermark <text> - Change watermark\n• timezone <zone> - Change timezone\n• status - Show status\n• demo - Show info`
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
        await SimpleAutoBio.updateBio(sock);
    }
};
