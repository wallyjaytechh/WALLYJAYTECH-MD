/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Anti-Foreign Command - Blocks users from specified countries
 * LID Compatible with signalRepository resolution
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

// Available country codes with names
const countryList = {
    '1': '🇺🇸 USA/Canada',
    '7': '🇷🇺 Russia',
    '20': '🇪🇬 Egypt',
    '27': '🇿🇦 South Africa',
    '30': '🇬🇷 Greece',
    '31': '🇳🇱 Netherlands',
    '33': '🇫🇷 France',
    '34': '🇪🇸 Spain',
    '39': '🇮🇹 Italy',
    '44': '🇬🇧 UK',
    '49': '🇩🇪 Germany',
    '52': '🇲🇽 Mexico',
    '55': '🇧🇷 Brazil',
    '60': '🇲🇾 Malaysia',
    '62': '🇮🇩 Indonesia',
    '63': '🇵🇭 Philippines',
    '65': '🇸🇬 Singapore',
    '81': '🇯🇵 Japan',
    '84': '🇻🇳 Vietnam',
    '86': '🇨🇳 China',
    '91': '🇮🇳 India',
    '92': '🇵🇰 Pakistan',
    '94': '🇱🇰 Sri Lanka',
    '212': '🇲🇦 Morocco',
    '216': '🇹🇳 Tunisia',
    '218': '🇱🇾 Libya',
    '220': '🇬🇲 Gambia',
    '221': '🇸🇳 Senegal',
    '222': '🇲🇷 Mauritania',
    '224': '🇬🇳 Guinea',
    '225': '🇨🇮 Ivory Coast',
    '226': '🇧🇫 Burkina Faso',
    '227': '🇳🇪 Niger',
    '228': '🇹🇬 Togo',
    '229': '🇧🇯 Benin',
    '230': '🇲🇺 Mauritius',
    '231': '🇱🇷 Liberia',
    '232': '🇸🇱 Sierra Leone',
    '233': '🇬🇭 Ghana',
    '234': '🇳🇬 Nigeria',
    '235': '🇹🇩 Chad',
    '236': '🇨🇫 CAR',
    '237': '🇨🇲 Cameroon',
    '240': '🇬🇶 Equatorial Guinea',
    '241': '🇬🇦 Gabon',
    '242': '🇨🇬 Congo',
    '249': '🇸🇩 Sudan',
    '251': '🇪🇹 Ethiopia',
    '254': '🇰🇪 Kenya',
    '255': '🇹🇿 Tanzania',
    '256': '🇺🇬 Uganda',
    '257': '🇧🇮 Burundi',
    '258': '🇲🇿 Mozambique',
    '260': '🇿🇲 Zambia',
    '263': '🇿🇼 Zimbabwe',
    '264': '🇳🇦 Namibia',
    '267': '🇧🇼 Botswana',
    '351': '🇵🇹 Portugal',
    '355': '🇦🇱 Albania',
    '371': '🇱🇻 Latvia',
    '372': '🇪🇪 Estonia',
    '373': '🇲🇩 Moldova',
    '375': '🇧🇾 Belarus',
    '380': '🇺🇦 Ukraine',
    '386': '🇸🇮 Slovenia',
    '420': '🇨🇿 Czech Republic',
    '421': '🇸🇰 Slovakia',
    '506': '🇨🇷 Costa Rica',
    '507': '🇵🇦 Panama',
    '855': '🇰🇭 Cambodia',
    '880': '🇧🇩 Bangladesh',
    '961': '🇱🇧 Lebanon',
    '966': '🇸🇦 Saudi Arabia',
    '971': '🇦🇪 UAE'
};

// Initialize configuration file if it doesn't exist
function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ 
                enabled: false,
                blockedCountries: ['91', '92', '1', '44', '86']
            }, null, 2));
            console.log('📁 Created new antiforeign config file');
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        return config;
    } catch (error) {
        console.error('❌ Error initializing antiforeign config:', error);
        return { enabled: false, blockedCountries: ['91', '92', '1', '44', '86'] };
    }
}

// Resolve LID to real phone number JID
async function resolveLidToJid(sock, jid) {
    if (!jid) return jid;
    
    // Already a real JID - return as is
    if (jid.endsWith('@s.whatsapp.net')) return jid;
    
    // Try to resolve LID to phone number
    if (jid.endsWith('@lid')) {
        try {
            if (sock.signalRepository?.lidMapping?.getPNForLID) {
                const pn = await sock.signalRepository.lidMapping.getPNForLID(jid);
                if (pn) {
                    const clean = pn.replace(/:\d+@s\.whatsapp\.net/, '@s.whatsapp.net');
                    console.log(`🔍 Anti-Foreign: Resolved LID ${jid} -> ${clean}`);
                    return clean;
                }
            }
        } catch (e) {
            console.log(`⚠️ LID resolution failed: ${e.message}`);
        }
    }
    
    return jid;
}

// Extract country code from JID
async function extractCountryCode(sock, jid) {
    try {
        const realJid = await resolveLidToJid(sock, jid);
        
        // Extract phone number
        let phoneNumber = realJid.split('@')[0].replace(/[^0-9]/g, '');
        
        if (!phoneNumber) return 'unknown';
        
        // Check country codes from longest to shortest to avoid false matches
        const sortedCodes = Object.keys(countryList).sort((a, b) => b.length - a.length);
        
        for (const code of sortedCodes) {
            if (phoneNumber.startsWith(code)) {
                return code;
            }
        }
        
        return 'unknown';
    } catch (error) {
        console.error('❌ Error extracting country code:', error);
        return 'unknown';
    }
}

// Block a user
async function blockUser(sock, jid) {
    try {
        const realJid = await resolveLidToJid(sock, jid);
        
        // Try blocking with real JID first
        try {
            await sock.updateBlockStatus(realJid, 'block');
            console.log(`✅ Blocked: ${realJid.split('@')[0]}`);
            return true;
        } catch (e1) {
            // Fallback: try with original JID
            try {
                await sock.updateBlockStatus(jid, 'block');
                console.log(`✅ Blocked via LID: ${jid.split('@')[0]}`);
                return true;
            } catch (e2) {
                console.log(`❌ Block failed: ${e2.message}`);
                return false;
            }
        }
    } catch (error) {
        console.error('❌ Block error:', error);
        return false;
    }
}

// Toggle antiforeign feature
async function antiforeignCommand(sock, chatId, message) {
    try {
        console.log('🌍 Anti-Foreign command triggered');
        
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }

        const userMessage = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || '';
        
        console.log('📝 Raw message:', userMessage);
        
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) {
            commandPart = commandPart.substring(1);
        }
        
        const parts = commandPart.split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        console.log('🔍 Command:', commandName);
        console.log('🔍 Args:', args);
        
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            let blockedList = '';
            for (const code of config.blockedCountries) {
                const name = countryList[code] || 'Unknown';
                blockedList += `└ +${code} - ${name}\n`;
            }
            
            const settingText = `🚫 *ANTI-FOREIGN SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries:*\n` +
                      `${blockedList}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antiforeign on - Enable blocking\n` +
                      `└ .antiforeign off - Disable blocking\n` +
                      `└ .antiforeign add <code> - Add country\n` +
                      `└ .antiforeign remove <code> - Remove country\n` +
                      `└ .antiforeign list - Show country codes\n` +
                      `└ .antiforeign status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .antiforeign add 234\n` +
                      `└ .antiforeign remove 91`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        console.log('🎯 Action:', action);
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('✅ Anti-Foreign ENABLED');
            
            const responseText = `✅ *ANTI-FOREIGN ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🛡️ Bot will now block users from:\n` +
                      `${config.blockedCountries.map(c => `└ +${c} - ${countryList[c] || 'Unknown'}`).join('\n')}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Blocked users will receive a warning before being blocked.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('❌ Anti-Foreign DISABLED');
            
            await sock.sendMessage(chatId, { 
                text: '❌ *ANTI-FOREIGN DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer block users based on country.',
                ...channelInfo 
            });
        }
        else if (action === 'add') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign add <country code>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .antiforeign add 91`,
                    ...channelInfo
                });
                return;
            }
            
            const code = args[1];
            if (!config.blockedCountries.includes(code)) {
                config.blockedCountries.push(code);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const name = countryList[code] || 'Unknown';
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} - ${name}\n\n📌 Users from ${name} will now be blocked.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY BLOCKED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} is already in the blocked list.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign remove <country code>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .antiforeign remove 91`,
                    ...channelInfo
                });
                return;
            }
            
            const code = args[1];
            const before = config.blockedCountries.length;
            config.blockedCountries = config.blockedCountries.filter(c => c !== code);
            
            if (config.blockedCountries.length < before) {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} removed from blocked list.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *NOT FOUND*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} was not in the blocked list.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'list') {
            let listText = `🌍 *AVAILABLE COUNTRY CODES*\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            
            for (const [code, name] of Object.entries(countryList)) {
                const isBlocked = config.blockedCountries.includes(code);
                listText += `${isBlocked ? '🚫' : '✅'} +${code} - ${name}\n`;
            }
            
            await sock.sendMessage(chatId, { text: listText, ...channelInfo });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked:* ${config.blockedCountries.join(', ')}\n` +
                      `📊 *Count:* ${config.blockedCountries.length} countries\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use .antiforeign list to see all codes`,
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
                      `└ .antiforeign status`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('❌ Error in antiforeign command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            ...channelInfo
        });
    }
}

// Handle incoming messages for blocking
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        
        // Skip if disabled, group chat, or own message
        if (!config.enabled) return false;
        if (chatId.endsWith('@g.us')) return false;
        if (message.key.fromMe) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        const countryCode = await extractCountryCode(sock, senderJid);
        
        console.log(`🌍 Anti-Foreign check: ${senderJid.split('@')[0]} | Country: ${countryCode}`);
        
        if (config.blockedCountries.includes(countryCode)) {
            console.log(`🚫 BLOCKING user from country +${countryCode}`);
            
            // Send warning
            await sock.sendMessage(chatId, { 
                text: `🚫 *ACCESS DENIED*\n\nYour country (+${countryCode}) is blocked from using this bot.\n\nContact the owner if you believe this is an error.`
            });
            
            // Delay then block
            await new Promise(r => setTimeout(r, 1500));
            
            const blocked = await blockUser(sock, senderJid);
            if (blocked) {
                console.log(`✅ Successfully blocked: ${senderJid.split('@')[0]}`);
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Anti-Foreign handler error:', error.message);
        return false;
    }
}

module.exports = {
    antiforeignCommand,
    handleAntiforeign
};
