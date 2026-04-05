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

// Country codes to block (you can modify this list)
const DEFAULT_BLOCKED_COUNTRIES = ['91', '92', '1', '44', '86']; // India, Pakistan, US, UK, China

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify({ 
            enabled: false,
            blockedCountries: DEFAULT_BLOCKED_COUNTRIES,
            blockMessage: '🚫 Messages from your country are not allowed.'
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Extract country code from phone number
function extractCountryCode(jid) {
    try {
        const phoneNumber = jid.split('@')[0];
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Common country code patterns
        if (cleanNumber.startsWith('1') && cleanNumber.length === 11) return '1'; // US/Canada
        if (cleanNumber.startsWith('91') && cleanNumber.length === 12) return '91'; // India
        if (cleanNumber.startsWith('92') && cleanNumber.length === 12) return '92'; // Pakistan
        if (cleanNumber.startsWith('44') && cleanNumber.length === 12) return '44'; // UK
        if (cleanNumber.startsWith('86') && cleanNumber.length === 13) return '86'; // China
        if (cleanNumber.startsWith('234') && cleanNumber.length === 13) return '234'; // Nigeria
        if (cleanNumber.startsWith('233') && cleanNumber.length === 12) return '233'; // Ghana
        if (cleanNumber.startsWith('254') && cleanNumber.length === 12) return '254'; // Kenya
        if (cleanNumber.startsWith('27') && cleanNumber.length === 11) return '27'; // South Africa
        if (cleanNumber.startsWith('55') && cleanNumber.length === 12) return '55'; // Brazil
        if (cleanNumber.startsWith('52') && cleanNumber.length === 12) return '52'; // Mexico
        if (cleanNumber.startsWith('63') && cleanNumber.length === 12) return '63'; // Philippines
        if (cleanNumber.startsWith('62') && cleanNumber.length === 12) return '62'; // Indonesia
        if (cleanNumber.startsWith('66') && cleanNumber.length === 11) return '66'; // Thailand
        if (cleanNumber.startsWith('84') && cleanNumber.length === 11) return '84'; // Vietnam
        
        // Default: first 1-3 digits as country code
        if (cleanNumber.length >= 10) {
            if (cleanNumber.startsWith('1')) return '1';
            if (cleanNumber.startsWith('7')) return '7'; // Russia
            if (cleanNumber.startsWith('33')) return '33'; // France
            if (cleanNumber.startsWith('49')) return '49'; // Germany
            if (cleanNumber.startsWith('81')) return '81'; // Japan
            if (cleanNumber.startsWith('82')) return '82'; // South Korea
        }
        
        return 'unknown';
    } catch (error) {
        return 'unknown';
    }
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
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const countries = config.blockedCountries.join(', ');
            const countryCount = config.blockedCountries.length;
            
            const settingText = `🚫 *ANTI-FOREIGN SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries:* ${countryCount}\n` +
                      `└ ${countries}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💬 *Block Message:*\n└ ${config.blockMessage}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antiforeign on/off - Enable/disable\n` +
                      `└ .antiforeign add <code> - Add country\n` +
                      `└ .antiforeign remove <code> - Remove country\n` +
                      `└ .antiforeign list - Show blocked countries\n` +
                      `└ .antiforeign message <text> - Set block message\n` +
                      `└ .antiforeign status - Show current settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .antiforeign add 91\n` +
                      `└ .antiforeign message "Your country is blocked"`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            const responseText = `✅ *ANTI-FOREIGN ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 Blocking ${config.blockedCountries.length} countries:\n` +
                      `└ ${config.blockedCountries.join(', ')}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Foreign numbers will be automatically blocked.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
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
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign add <country_code>\n\n✨ *Example:*\n└ .antiforeign add 91 (India)\n└ .antiforeign add 1 (USA)\n\n📌 *Common codes:* 91(India), 92(Pakistan), 1(USA), 44(UK), 86(China)`,
                    ...channelInfo
                });
                return;
            }
            
            const countryCode = args[1];
            if (!config.blockedCountries.includes(countryCode)) {
                config.blockedCountries.push(countryCode);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n\n━━━━━━━━━━━━━━━━━━━━\n🌍 Blocked countries: ${config.blockedCountries.join(', ')}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY BLOCKED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Country code ${countryCode} is already in blocklist.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign remove <country_code>\n\n✨ *Example:*\n└ .antiforeign remove 91`,
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
                    text: `✅ *COUNTRY REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n\n━━━━━━━━━━━━━━━━━━━━\n🌍 Blocked countries: ${config.blockedCountries.length > 0 ? config.blockedCountries.join(', ') : 'None'}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *NOT FOUND*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Country code ${countryCode} is not in blocklist.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'list') {
            const countries = config.blockedCountries.length > 0 
                ? config.blockedCountries.join(', ')
                : 'None';
                
            await sock.sendMessage(chatId, {
                text: `📋 *BLOCKED COUNTRIES*\n\n━━━━━━━━━━━━━━━━━━━━\n🌍 ${countries}\n\n━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${config.blockedCountries.length} countries`,
                ...channelInfo
            });
        }
        else if (action === 'message') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign message <text>\n\n✨ *Example:*\n└ .antiforeign message "Your country is not allowed to contact me."`,
                    ...channelInfo
                });
                return;
            }
            
            const newMessage = args.slice(1).join(' ');
            config.blockMessage = newMessage;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, {
                text: `✅ *BLOCK MESSAGE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n💬 New message:\n└ "${newMessage}"`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const countries = config.blockedCountries.join(', ');
            
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries:*\n└ ${countries}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💬 *Block Message:*\n└ ${config.blockMessage}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 Total blocked: ${config.blockedCountries.length} countries`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .antiforeign on/off\n` +
                      `└ .antiforeign add <code>\n` +
                      `└ .antiforeign remove <code>\n` +
                      `└ .antiforeign list\n` +
                      `└ .antiforeign message <text>\n` +
                      `└ .antiforeign status\n` +
                      `└ .antiforeign (shows this menu)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Example:*\n` +
                      `└ .antiforeign add 91\n` +
                      `└ .antiforeign message "Blocked"`,
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

// Handle antiforeign blocking
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;

        if (chatId.endsWith('@g.us') || message.key.fromMe) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        
        if (isBlockedCountry(senderJid, config.blockedCountries)) {
            console.log(`🚫 Blocked message from country: ${extractCountryCode(senderJid)}`);
            
            await sock.sendMessage(chatId, { 
                text: config.blockMessage,
                ...channelInfo
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                await sock.updateBlockStatus(senderJid, 'block');
                console.log(`✅ Blocked user from country code: ${extractCountryCode(senderJid)}`);
            } catch (blockError) {
                console.error('Error blocking user:', blockError);
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error in antiforeign handler:', error);
        return false;
    }
}

// Get current status
function isAntiforeignEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        return false;
    }
}

// Get blocked countries
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
