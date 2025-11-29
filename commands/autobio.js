const fs = require('fs');
const path = require('path');

// Simple autobio settings
const autobioData = {
    enabled: false,
    watermark: "WALLYJAYTECH-MD",
    lastUpdate: 0
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
            lastUpdate: autobioData.lastUpdate
        };
        
        // Ensure data directory exists
        const dataDir = path.dirname(AUTOBIO_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(AUTOBIO_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Autobio data saved');
    } catch (error) {
        console.error('❌ Error saving autobio data:', error);
    }
}

// Initialize autobio system
loadAutobioData();

class SimpleAutoBio {
    // Get current time with seconds
    static getCurrentTime() {
        const now = new Date();
        
        // Format: HH:MM:SS (24-hour format)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Get greeting based on time
    static getGreeting() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) return '🌅 Morning';
        if (hour >= 12 && hour < 17) return '☀️ Afternoon';
        if (hour >= 17 && hour < 21) return '🌇 Evening';
        return '🌙 Night';
    }
    
    // Generate bio text
    static generateBio() {
        const time = this.getCurrentTime();
        const greeting = this.getGreeting();
        const watermark = autobioData.watermark;
        
        // Choose from simple templates
        const templates = [
            `⏰ ${time} | ${watermark}`,
            `🕒 ${time} | ${watermark}`,
            `📱 ${time} | ${watermark}`,
            `🤖 ${time} | ${watermark}`,
            `${greeting} ${time} | ${watermark}`,
            `⏳ ${time} | ${watermark}`,
            `🚀 ${time} | ${watermark}`,
            `💫 ${time} | ${watermark}`
        ];
        
        // Rotate through templates based on minute
        const templateIndex = new Date().getMinutes() % templates.length;
        return templates[templateIndex];
    }
    
    // Update bio
    static async updateBio(sock) {
        if (!autobioData.enabled) return;
        
        try {
            const bioText = this.generateBio();
            
            // Update bio (character limit: 139 for WhatsApp)
            const finalBio = bioText.length > 139 ? bioText.substring(0, 136) + '...' : bioText;
            
            await sock.updateProfileStatus(finalBio);
            
            console.log(`✅ Bio updated: "${finalBio}"`);
            
            autobioData.lastUpdate = Date.now();
            saveAutobioData();
            
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
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Live Time Bio ENABLED*\n\nYour bio will now show live time with seconds!\n\nCurrent format: ⏰ HH:MM:SS | ${autobioData.watermark}`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    autobioData.enabled = false;
                    saveAutobioData();
                    
                    // Clear bio
                    try {
                        await sock.updateProfileStatus("");
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
                    await sock.sendMessage(chatId, {
                        text: '✅ *Bio Updated!*\n\nYour bio has been updated with current time.'
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
                    
                case 'status':
                case 'info':
                    const status = autobioData.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const lastUpdate = autobioData.lastUpdate ? 
                        new Date(autobioData.lastUpdate).toLocaleTimeString() : 'Never';
                    
                    await sock.sendMessage(chatId, {
                        text: `📊 *Live Time Bio Status*\n\nStatus: ${status}\nWatermark: ${autobioData.watermark}\nLast Update: ${lastUpdate}\nCurrent Time: ${SimpleAutoBio.getCurrentTime()}\n\n*Commands:*\n• .autobio on/off - Enable/disable\n• .autobio update - Update now\n• .autobio watermark <text> - Change watermark\n• .autobio status - Show status`
                    }, { quoted: message });
                    break;
                    
                case 'demo':
                    // Show sample bios
                    const samples = [
                        `⏰ ${SimpleAutoBio.getCurrentTime()} | ${autobioData.watermark}`,
                        `🕒 ${SimpleAutoBio.getCurrentTime()} | ${autobioData.watermark}`,
                        `📱 ${SimpleAutoBio.getCurrentTime()} | ${autobioData.watermark}`,
                        `${SimpleAutoBio.getGreeting()} ${SimpleAutoBio.getCurrentTime()} | ${autobioData.watermark}`
                    ];
                    
                    await sock.sendMessage(chatId, {
                        text: `🎯 *Sample Bio Formats:*\n\n${samples.join('\n')}\n\n*Current Watermark:* ${autobioData.watermark}`
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `⏰ *Live Time Bio*\n\nSimple bio that shows live time with seconds and your watermark!\n\n*Usage:* .autobio <command>\n\n*Commands:*\n• on/off - Enable/disable live bio\n• update - Update bio immediately\n• watermark <text> - Set your watermark\n• status - Show system status\n• demo - Show sample formats\n\n*Current Status:* ${autobioData.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n*Watermark:* ${autobioData.watermark}`
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
    },
    
    // Get autobio status
    getStatus() {
        return {
            enabled: autobioData.enabled,
            watermark: autobioData.watermark,
            lastUpdate: autobioData.lastUpdate
        };
    }
};
