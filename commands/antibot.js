const fs = require('fs');
const path = require('path');

// Store bot detection data
const antibotData = {
    detectedBots: new Set(), // JIDs of detected bots
    suspiciousActivities: new Map(), // Suspicious activity tracking
    enabled: true,
    autoAction: 'warn', // warn, mute, kick, ban
    protectedGroups: new Set() // Groups where antibot is active
};

// Bot detection patterns
const BOT_PATTERNS = {
    // Common bot names and signatures
    names: [
        'bot', 'wabot', 'whatsapp bot', 'md bot', 'whatsapp-bot', 'wabot-inc',
        'baileys', 'venom', 'whatsapp-web.js', 'wppconnect', 'whatsapp-web',
        'automation', 'script', 'crawler', 'spider', 'scanner', 'whatsappbot',
        'userbot', 'multi-device', 'baileys-md', 'wamd', 'wame'
    ],
    
    // Suspicious message patterns (common in bots)
    messagePatterns: [
        /\.\w+\s+@\d{10,}/g, // Commands with phone number mentions
        /https?:\/\/[^\s]+\.[^\s]+/gi, // URLs (bots often send links)
        /[@#][0-9]{10,}/g, // Mentions with long numbers
        /[\u{1F600}-\u{1F64F}]{5,}/gu, // Excessive emojis (5+)
        /(.)\1{10,}/g, // Repeated characters (10+)
        /[0-9]{15,}/g, // Very long numbers
    ],
    
    // Rapid command patterns (bots send commands quickly)
    rapidCommands: [
        /^\.\w+$/g, // Simple commands without spaces
        /^\.\w+\s+@\d+$/g, // Commands with user mentions
    ],
    
    // Known bot user agents
    userAgents: [
        'Baileys', 'Venom', 'WPPConnect', 'WhatsAppWeb.js', 'WhatsApp-Bot',
        'Multi-Device', 'MD-Bot', 'WAMD', 'WAME'
    ]
};

// Load/save antibot data
const ANTIBOT_FILE = path.join(__dirname, '../data/antibot.json');

function loadAntibotData() {
    try {
        if (fs.existsSync(ANTIBOT_FILE)) {
            const data = JSON.parse(fs.readFileSync(ANTIBOT_FILE, 'utf8'));
            antibotData.detectedBots = new Set(data.detectedBots || []);
            antibotData.suspiciousActivities = new Map(Object.entries(data.suspiciousActivities || {}));
            antibotData.enabled = data.enabled !== false;
            antibotData.autoAction = data.autoAction || 'warn';
            antibotData.protectedGroups = new Set(data.protectedGroups || []);
        }
    } catch (error) {
        console.error('❌ Error loading antibot data:', error);
    }
}

function saveAntibotData() {
    try {
        const data = {
            detectedBots: Array.from(antibotData.detectedBots),
            suspiciousActivities: Object.fromEntries(antibotData.suspiciousActivities),
            enabled: antibotData.enabled,
            autoAction: antibotData.autoAction,
            protectedGroups: Array.from(antibotData.protectedGroups)
        };
        
        // Ensure data directory exists
        const dataDir = path.dirname(ANTIBOT_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(ANTIBOT_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Antibot data saved');
    } catch (error) {
        console.error('❌ Error saving antibot data:', error);
    }
}

// Initialize antibot system
loadAntibotData();

// Track user activity for detection
const userActivity = new Map();

class AntiBotSystem {
    // Check if a user is likely a bot
    static async detectBot(sock, chatId, userId, message) {
        if (!antibotData.enabled) return false;
        
        const userJid = userId;
        let botScore = 0;
        const reasons = [];
        
        // Get user info
        try {
            const user = await sock.onWhatsApp(userJid);
            if (user && user[0]) {
                const pushName = user[0].pushname || '';
                const name = pushName.toLowerCase();
                
                // Check name patterns
                for (const pattern of BOT_PATTERNS.names) {
                    if (name.includes(pattern)) {
                        botScore += 30;
                        reasons.push(`Name contains "${pattern}"`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking user info:', error);
        }
        
        // Check message content
        const messageText = this.extractMessageText(message);
        if (messageText) {
            // Check for rapid commands
            if (this.isRapidCommand(userJid, messageText)) {
                botScore += 25;
                reasons.push('Rapid command execution');
            }
            
            // Check message patterns
            for (const pattern of BOT_PATTERNS.messagePatterns) {
                const matches = messageText.match(pattern);
                if (matches && matches.length > 0) {
                    botScore += 20;
                    reasons.push(`Suspicious message pattern: ${pattern}`);
                    break;
                }
            }
            
            // Check for excessive commands
            const commandCount = (messageText.match(/\.\w+/g) || []).length;
            if (commandCount > 3) {
                botScore += 15;
                reasons.push(`Too many commands: ${commandCount}`);
            }
        }
        
        // Check user activity patterns
        const activity = userActivity.get(userJid) || { count: 0, lastActivity: 0 };
        const now = Date.now();
        const timeDiff = now - activity.lastActivity;
        
        if (timeDiff < 1000 && activity.count > 5) { // Too many messages in 1 second
            botScore += 35;
            reasons.push('Extremely rapid messaging');
        }
        
        // Update activity tracking
        userActivity.set(userJid, {
            count: activity.count + 1,
            lastActivity: now
        });
        
        // Clean old activity data (after 1 minute)
        setTimeout(() => {
            if (userActivity.has(userJid)) {
                userActivity.delete(userJid);
            }
        }, 60000);
        
        console.log(`🔍 Bot detection for ${userJid}: Score ${botScore}, Reasons:`, reasons);
        
        return botScore >= 50 ? { isBot: true, score: botScore, reasons } : { isBot: false, score: botScore, reasons };
    }
    
    // Extract text from different message types
    static extractMessageText(message) {
        return (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        ).toLowerCase();
    }
    
    // Check for rapid command execution
    static isRapidCommand(userJid, messageText) {
        const now = Date.now();
        const userKey = `${userJid}_commands`;
        const userCommands = userActivity.get(userKey) || { count: 0, lastCommand: 0 };
        
        if (messageText.startsWith('.')) {
            const timeDiff = now - userCommands.lastCommand;
            if (timeDiff < 2000 && userCommands.count > 2) { // 3+ commands in 2 seconds
                return true;
            }
            
            userActivity.set(userKey, {
                count: userCommands.count + 1,
                lastCommand: now
            });
            
            // Reset after 5 seconds
            setTimeout(() => {
                if (userActivity.has(userKey)) {
                    userActivity.delete(userKey);
                }
            }, 5000);
        }
        
        return false;
    }
    
    // Take action against detected bot
    static async takeAction(sock, chatId, userId, detectionResult) {
        if (!antibotData.enabled) return;
        
        const userJid = userId;
        const isGroup = chatId.endsWith('@g.us');
        
        // Add to detected bots list
        antibotData.detectedBots.add(userJid);
        saveAntibotData();
        
        const action = antibotData.autoAction;
        const reasons = detectionResult.reasons.join(', ');
        
        try {
            switch (action) {
                case 'warn':
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *BOT DETECTED!*\n\n👤 User: @${userJid.split('@')[0]}\n📊 Bot Score: ${detectionResult.score}%\n🔍 Reasons: ${reasons}\n\n❌ Suspected bot activity detected! This user has been flagged.`,
                        mentions: [userJid]
                    });
                    break;
                    
                case 'mute':
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'mute');
                        await sock.sendMessage(chatId, {
                            text: `🔇 *BOT MUTED!*\n\n👤 User: @${userJid.split('@')[0]}\n📊 Bot Score: ${detectionResult.score}%\n🔍 Reasons: ${reasons}\n\n❌ User has been muted for suspected bot activity.`,
                            mentions: [userJid]
                        });
                    }
                    break;
                    
                case 'kick':
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'remove');
                        await sock.sendMessage(chatId, {
                            text: `🚫 *BOT KICKED!*\n\n👤 User: @${userJid.split('@')[0]}\n📊 Bot Score: ${detectionResult.score}%\n🔍 Reasons: ${reasons}\n\n❌ User has been removed for bot activity.`,
                            mentions: [userJid]
                        });
                    }
                    break;
                    
                case 'ban':
                    // Add to global ban list
                    const banList = require('../data/banned.json');
                    if (!banList.includes(userJid)) {
                        banList.push(userJid);
                        fs.writeFileSync('./data/banned.json', JSON.stringify(banList, null, 2));
                    }
                    
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'remove');
                    }
                    
                    await sock.sendMessage(chatId, {
                        text: `🔨 *BOT BANNED!*\n\n👤 User: @${userJid.split('@')[0]}\n📊 Bot Score: ${detectionResult.score}%\n🔍 Reasons: ${reasons}\n\n❌ User has been globally banned for bot activity.`,
                        mentions: [userJid]
                    });
                    break;
            }
            
            console.log(`✅ AntiBot action taken: ${action} for ${userJid}`);
            
        } catch (error) {
            console.error('❌ Error taking antibot action:', error);
        }
    }
}

module.exports = {
    name: 'antibot',
    description: 'Protect groups from other WhatsApp bots',
    
    async execute(sock, chatId, message, args) {
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            
            // Check if user is authorized (owner/admin)
            const { isOwnerOrSudo } = require('../lib/isOwner');
            const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
            
            if (!isAuthorized) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner/admins can use antibot commands!'
                }, { quoted: message });
                return;
            }
            
            const action = args[0]?.toLowerCase();
            
            switch (action) {
                case 'on':
                case 'enable':
                    antibotData.enabled = true;
                    if (isGroup) {
                        antibotData.protectedGroups.add(chatId);
                    }
                    saveAntibotData();
                    await sock.sendMessage(chatId, {
                        text: `✅ *AntiBot System ENABLED*${isGroup ? ' for this group' : ' globally'}\n\nBot protection is now active!`
                    }, { quoted: message });
                    break;
                    
                case 'off':
                case 'disable':
                    antibotData.enabled = false;
                    if (isGroup) {
                        antibotData.protectedGroups.delete(chatId);
                    }
                    saveAntibotData();
                    await sock.sendMessage(chatId, {
                        text: `❌ *AntiBot System DISABLED*${isGroup ? ' for this group' : ' globally'}\n\nBot protection is now inactive.`
                    }, { quoted: message });
                    break;
                    
                case 'action':
                    const newAction = args[1]?.toLowerCase();
                    if (['warn', 'mute', 'kick', 'ban'].includes(newAction)) {
                        antibotData.autoAction = newAction;
                        saveAntibotData();
                        await sock.sendMessage(chatId, {
                            text: `⚙️ *AntiBot Action Updated*\n\nNew action: *${newAction.toUpperCase()}*\n\nBot detection will now: ${newAction} users`
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `❌ Invalid action! Use: warn, mute, kick, or ban\n\nExample: .antibot action warn`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'list':
                case 'bots':
                    const botCount = antibotData.detectedBots.size;
                    if (botCount === 0) {
                        await sock.sendMessage(chatId, {
                            text: `📋 *Detected Bots List*\n\nNo bots detected yet! 🎉`
                        }, { quoted: message });
                    } else {
                        const botList = Array.from(antibotData.detectedBots).slice(0, 10).join('\n• ');
                        await sock.sendMessage(chatId, {
                            text: `📋 *Detected Bots List*\n\nTotal detected: ${botCount}\n\nRecent bots:\n• ${botList}${botCount > 10 ? `\n\n... and ${botCount - 10} more` : ''}`
                        }, { quoted: message });
                    }
                    break;
                    
                case 'status':
                case 'info':
                    const status = antibotData.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    const groups = antibotData.protectedGroups.size;
                    await sock.sendMessage(chatId, {
                        text: `📊 *AntiBot System Status*\n\nStatus: ${status}\nAction: ${antibotData.autoAction.toUpperCase()}\nProtected Groups: ${groups}\nDetected Bots: ${antibotData.detectedBots.size}\n\n*Commands:*\n• .antibot on/off - Enable/disable\n• .antibot action <warn/mute/kick/ban>\n• .antibot list - Show detected bots\n• .antibot status - Show status`
                    }, { quoted: message });
                    break;
                    
                case 'clear':
                    antibotData.detectedBots.clear();
                    antibotData.suspiciousActivities.clear();
                    saveAntibotData();
                    await sock.sendMessage(chatId, {
                        text: `🧹 *AntiBot Data Cleared*\n\nAll detected bots and activity data have been cleared.`
                    }, { quoted: message });
                    break;
                    
                default:
                    await sock.sendMessage(chatId, {
                        text: `🛡️ *AntiBot Protection System*\n\n*Usage:* .antibot <command>\n\n*Commands:*\n• on/off - Enable/disable protection\n• action <warn/mute/kick/ban> - Set action\n• list - Show detected bots\n• status - Show system status\n• clear - Clear all data\n\n*Current Status:*\nEnabled: ${antibotData.enabled ? 'Yes' : 'No'}\nAction: ${antibotData.autoAction}\nProtected Groups: ${antibotData.protectedGroups.size}\nDetected Bots: ${antibotData.detectedBots.size}`
                    }, { quoted: message });
                    break;
            }
            
        } catch (error) {
            console.error('❌ AntiBot command error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error executing antibot command!'
            }, { quoted: message });
        }
    },
    
    // Main detection function to be called from main.js
    async handleMessage(sock, chatId, message) {
        try {
            if (!antibotData.enabled) return false;
            
            const isGroup = chatId.endsWith('@g.us');
            const senderId = message.key.participant || message.key.remoteJid;
            
            // Skip if it's our own bot or in protected groups only
            if (message.key.fromMe) return false;
            if (isGroup && !antibotData.protectedGroups.has(chatId)) return false;
            
            // Skip if user is already detected as bot
            if (antibotData.detectedBots.has(senderId)) return true;
            
            // Detect bot activity
            const detection = await AntiBotSystem.detectBot(sock, chatId, senderId, message);
            
            if (detection.isBot) {
                console.log(`🚨 BOT DETECTED: ${senderId}, Score: ${detection.score}`);
                await AntiBotSystem.takeAction(sock, chatId, senderId, detection);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ AntiBot detection error:', error);
            return false;
        }
    },
    
    // Get antibot status
    getStatus() {
        return {
            enabled: antibotData.enabled,
            autoAction: antibotData.autoAction,
            protectedGroups: antibotData.protectedGroups.size,
            detectedBots: antibotData.detectedBots.size
        };
    }
};
