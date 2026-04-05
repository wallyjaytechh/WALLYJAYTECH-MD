/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Antiforeign Command - Block specific country numbers
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'antiforeign.json');

// Channel info for professional branding
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// Default blocked countries
const DEFAULT_BLOCKED_COUNTRIES = ['91', '92', '1', '44', '86'];

// Initialize configuration file
function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ 
                enabled: false,
                blockedCountries: DEFAULT_BLOCKED_COUNTRIES,
                blockMessage: '🚫 *Access Denied*\n\n━━━━━━━━━━━━━━━━━━━━\nMessages from your country are not allowed.\n━━━━━━━━━━━━━━━━━━━━\nYou have been blocked.'
            }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error('Error initializing antiforeign config:', error);
        return { 
            enabled: false, 
            blockedCountries: DEFAULT_BLOCKED_COUNTRIES, 
            blockMessage: '🚫 Messages from your country are not allowed.' 
        };
    }
}

// Extract country code from phone number
function extractCountryCode(jid) {
    try {
        const phoneNumber = jid.split('@')[0];
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Common country codes
        if (cleanNumber.startsWith('1') && cleanNumber.length === 11) return '1';
        if (cleanNumber.startsWith('91') && cleanNumber.length === 12) return '91';
        if (cleanNumber.startsWith('92') && cleanNumber.length === 12) return '92';
        if (cleanNumber.startsWith('44') && cleanNumber.length === 12) return '44';
        if (cleanNumber.startsWith('86') && cleanNumber.length === 13) return '86';
        if (cleanNumber.startsWith('234') && cleanNumber.length === 13) return '234';
        if (cleanNumber.startsWith('233') && cleanNumber.length === 12) return '233';
        if (cleanNumber.startsWith('254') && cleanNumber.length === 12) return '254';
        if (cleanNumber.startsWith('27') && cleanNumber.length === 11) return '27';
        if (cleanNumber.startsWith('55') && cleanNumber.length === 12) return '55';
        if (cleanNumber.startsWith('52') && cleanNumber.length === 12) return '52';
        if (cleanNumber.startsWith('63') && cleanNumber.length === 12) return '63';
        if (cleanNumber.startsWith('62') && cleanNumber.length === 12) return '62';
        
        return 'unknown';
    } catch (error) {
        return 'unknown';
    }
}

// Get country name from code
function getCountryName(code) {
    const countries = {
        '1': 'USA/Canada', '44': 'UK', '91': 'India', '92': 'Pakistan', '86': 'China',
        '234': 'Nigeria', '233': 'Ghana', '254': 'Kenya', '27': 'South Africa',
        '55': 'Brazil', '52': 'Mexico', '63': 'Philippines', '62': 'Indonesia'
    };
    return countries[code] || code;
}

// Check if number is from blocked country
function isBlockedCountry(jid, blockedCountries) {
    const countryCode = extractCountryCode(jid);
    return blockedCountries.includes(countryCode);
}

// Toggle antiforeign feature
async function antiforeignCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }

        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        const config = initConfig();
        
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            let countriesList = '';
            for (const code of config.blockedCountries) {
                countriesList += `└ ${code} - ${getCountryName(code)}\n`;
            }
            
            const settingText = `🚫 *ANTI-FOREIGN SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries:*\n${countriesList || '└ None'}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antiforeign on/off - Enable/disable\n` +
                      `└ .antiforeign add <code> - Add country\n` +
                      `└ .antiforeign remove <code> - Remove country\n` +
                      `└ .antiforeign list - Show blocked countries\n` +
                      `└ .antiforeign status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Examples:*\n` +
                      `└ .antiforeign on\n` +
                      `└ .antiforeign add 91\n` +
                      `└ .antiforeign remove 44`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `✅ *ANTI-FOREIGN ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Foreign numbers from blocked countries will be automatically blocked.`,
                ...channelInfo
            });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: '❌ *ANTI-FOREIGN DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nAll countries are now allowed.',
                ...channelInfo
            });
        }
        else if (action === 'add') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign add <country_code>\n\n✨ *Example:* .antiforeign add 91`,
                    ...channelInfo
                });
                return;
            }
            
            const countryCode = args[1];
            if (!config.blockedCountries.includes(countryCode)) {
                config.blockedCountries.push(countryCode);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ ${countryCode} - ${getCountryName(countryCode)}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY BLOCKED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ ${countryCode} - ${getCountryName(countryCode)} is already in blocklist.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign remove <country_code>\n\n✨ *Example:* .antiforeign remove 91`,
                    ...channelInfo
                });
                return;
            }
            
            const countryCode = args[1];
            const index = config.blockedCountries.indexOf(countryCode);
            if (index > -1) {
                config.blockedCountries.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ ${countryCode} - ${getCountryName(countryCode)}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *NOT FOUND*\n\n━━━━━━━━━━━━━━━━━━━━\n└ ${countryCode} is not in blocklist.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'list') {
            if (config.blockedCountries.length === 0) {
                await sock.sendMessage(chatId, {
                    text: `📋 *BLOCKED COUNTRIES*\n\n━━━━━━━━━━━━━━━━━━━━\n└ No countries blocked.\n\n💡 Use .antiforeign add <code> to add.`,
                    ...channelInfo
                });
                return;
            }
            
            let countriesList = '';
            for (const code of config.blockedCountries) {
                countriesList += `└ ${code} - ${getCountryName(code)}\n`;
            }
            
            await sock.sendMessage(chatId, {
                text: `📋 *BLOCKED COUNTRIES*\n\n━━━━━━━━━━━━━━━━━━━━\n${countriesList}━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${config.blockedCountries.length}`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            let countriesList = '';
            for (const code of config.blockedCountries) {
                countriesList += `└ ${code} - ${getCountryName(code)}\n`;
            }
            
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked (${config.blockedCountries.length}):*\n${countriesList || '└ None'}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign on/off/add/remove/list/status`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('Error in antiforeign command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            ...channelInfo
        });
    }
}

// ========== THIS IS THE MAIN BLOCKING FUNCTION - KEEP THIS ==========
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        
        // Only block in private chats
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't block bot's own messages
        if (message.key.fromMe) return false;
        
        // Check if feature is enabled
        if (!config.enabled) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        const countryCode = extractCountryCode(senderJid);
        
        console.log(`🔍 Anti-foreign: ${senderJid} | Country: ${countryCode} | Blocked: ${config.blockedCountries.join(', ')}`);
        
        // Check if sender is from blocked country
        if (config.blockedCountries.includes(countryCode)) {
            console.log(`🚫 BLOCKING ${senderJid} (${countryCode})`);
            
            // Send block message
            await sock.sendMessage(chatId, { 
                text: config.blockMessage,
                ...channelInfo
            });
            
            // Block the user
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.updateBlockStatus(senderJid, 'block');
            console.log(`✅ Blocked ${senderJid}`);
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error in antiforeign handler:', error);
        return false;
    }
}
// ========== END BLOCKING FUNCTION ==========

function isAntiforeignEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        return false;
    }
}

function getBlockedCountries() {
    try {
        const config = initConfig();
        return config.blockedCountries;
    } catch (error) {
        return [];
    }
}

module.exports = {
    antiforeignCommand,
    handleAntiforeign,
    isAntiforeignEnabled,
    getBlockedCountries
};
