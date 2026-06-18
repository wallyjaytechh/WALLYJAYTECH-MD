/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Anti-Foreign Command - Blocks users from specified countries
 * LID Compatible | All World Country Codes
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

// ALL WORLD COUNTRY CODES
const countryList = {
    '1': '🇺🇸 USA/Canada',
    '7': '🇷🇺 Russia/Kazakhstan',
    '20': '🇪🇬 Egypt',
    '27': '🇿🇦 South Africa',
    '30': '🇬🇷 Greece',
    '31': '🇳🇱 Netherlands',
    '32': '🇧🇪 Belgium',
    '33': '🇫🇷 France',
    '34': '🇪🇸 Spain',
    '36': '🇭🇺 Hungary',
    '39': '🇮🇹 Italy',
    '40': '🇷🇴 Romania',
    '41': '🇨🇭 Switzerland',
    '43': '🇦🇹 Austria',
    '44': '🇬🇧 United Kingdom',
    '45': '🇩🇰 Denmark',
    '46': '🇸🇪 Sweden',
    '47': '🇳🇴 Norway',
    '48': '🇵🇱 Poland',
    '49': '🇩🇪 Germany',
    '51': '🇵🇪 Peru',
    '52': '🇲🇽 Mexico',
    '53': '🇨🇺 Cuba',
    '54': '🇦🇷 Argentina',
    '55': '🇧🇷 Brazil',
    '56': '🇨🇱 Chile',
    '57': '🇨🇴 Colombia',
    '58': '🇻🇪 Venezuela',
    '60': '🇲🇾 Malaysia',
    '61': '🇦🇺 Australia',
    '62': '🇮🇩 Indonesia',
    '63': '🇵🇭 Philippines',
    '64': '🇳🇿 New Zealand',
    '65': '🇸🇬 Singapore',
    '66': '🇹🇭 Thailand',
    '81': '🇯🇵 Japan',
    '82': '🇰🇷 South Korea',
    '84': '🇻🇳 Vietnam',
    '86': '🇨🇳 China',
    '90': '🇹🇷 Turkey',
    '91': '🇮🇳 India',
    '92': '🇵🇰 Pakistan',
    '93': '🇦🇫 Afghanistan',
    '94': '🇱🇰 Sri Lanka',
    '95': '🇲🇲 Myanmar',
    '98': '🇮🇷 Iran',
    '211': '🇸🇸 South Sudan',
    '212': '🇲🇦 Morocco',
    '213': '🇩🇿 Algeria',
    '216': '🇹🇳 Tunisia',
    '218': '🇱🇾 Libya',
    '220': '🇬🇲 Gambia',
    '221': '🇸🇳 Senegal',
    '222': '🇲🇷 Mauritania',
    '223': '🇲🇱 Mali',
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
    '236': '🇨🇫 Central African Republic',
    '237': '🇨🇲 Cameroon',
    '238': '🇨🇻 Cape Verde',
    '239': '🇸🇹 Sao Tome',
    '240': '🇬🇶 Equatorial Guinea',
    '241': '🇬🇦 Gabon',
    '242': '🇨🇬 Congo',
    '243': '🇨🇩 DR Congo',
    '244': '🇦🇴 Angola',
    '245': '🇬🇼 Guinea-Bissau',
    '246': '🇩🇬 Diego Garcia',
    '247': '🇦🇨 Ascension Island',
    '248': '🇸🇨 Seychelles',
    '249': '🇸🇩 Sudan',
    '250': '🇷🇼 Rwanda',
    '251': '🇪🇹 Ethiopia',
    '252': '🇸🇴 Somalia',
    '253': '🇩🇯 Djibouti',
    '254': '🇰🇪 Kenya',
    '255': '🇹🇿 Tanzania',
    '256': '🇺🇬 Uganda',
    '257': '🇧🇮 Burundi',
    '258': '🇲🇿 Mozambique',
    '260': '🇿🇲 Zambia',
    '261': '🇲🇬 Madagascar',
    '262': '🇷🇪 Reunion',
    '263': '🇿🇼 Zimbabwe',
    '264': '🇳🇦 Namibia',
    '265': '🇲🇼 Malawi',
    '266': '🇱🇸 Lesotho',
    '267': '🇧🇼 Botswana',
    '268': '🇸🇿 Eswatini',
    '269': '🇰🇲 Comoros',
    '290': '🇸🇭 Saint Helena',
    '291': '🇪🇷 Eritrea',
    '297': '🇦🇼 Aruba',
    '298': '🇫🇴 Faroe Islands',
    '299': '🇬🇱 Greenland',
    '350': '🇬🇮 Gibraltar',
    '351': '🇵🇹 Portugal',
    '352': '🇱🇺 Luxembourg',
    '353': '🇮🇪 Ireland',
    '354': '🇮🇸 Iceland',
    '355': '🇦🇱 Albania',
    '356': '🇲🇹 Malta',
    '357': '🇨🇾 Cyprus',
    '358': '🇫🇮 Finland',
    '359': '🇧🇬 Bulgaria',
    '370': '🇱🇹 Lithuania',
    '371': '🇱🇻 Latvia',
    '372': '🇪🇪 Estonia',
    '373': '🇲🇩 Moldova',
    '374': '🇦🇲 Armenia',
    '375': '🇧🇾 Belarus',
    '376': '🇦🇩 Andorra',
    '377': '🇲🇨 Monaco',
    '378': '🇸🇲 San Marino',
    '380': '🇺🇦 Ukraine',
    '381': '🇷🇸 Serbia',
    '382': '🇲🇪 Montenegro',
    '383': '🇽🇰 Kosovo',
    '385': '🇭🇷 Croatia',
    '386': '🇸🇮 Slovenia',
    '387': '🇧🇦 Bosnia',
    '389': '🇲🇰 North Macedonia',
    '420': '🇨🇿 Czech Republic',
    '421': '🇸🇰 Slovakia',
    '423': '🇱🇮 Liechtenstein',
    '500': '🇫🇰 Falkland Islands',
    '501': '🇧🇿 Belize',
    '502': '🇬🇹 Guatemala',
    '503': '🇸🇻 El Salvador',
    '504': '🇭🇳 Honduras',
    '505': '🇳🇮 Nicaragua',
    '506': '🇨🇷 Costa Rica',
    '507': '🇵🇦 Panama',
    '508': '🇵🇲 Saint Pierre',
    '509': '🇭🇹 Haiti',
    '590': '🇬🇵 Guadeloupe',
    '591': '🇧🇴 Bolivia',
    '592': '🇬🇾 Guyana',
    '593': '🇪🇨 Ecuador',
    '594': '🇬🇫 French Guiana',
    '595': '🇵🇾 Paraguay',
    '596': '🇲🇶 Martinique',
    '597': '🇸🇷 Suriname',
    '598': '🇺🇾 Uruguay',
    '599': '🇧🇶 Caribbean Netherlands',
    '670': '🇹🇱 East Timor',
    '672': '🇦🇶 Antarctica',
    '673': '🇧🇳 Brunei',
    '674': '🇳🇷 Nauru',
    '675': '🇵🇬 Papua New Guinea',
    '676': '🇹🇴 Tonga',
    '677': '🇸🇧 Solomon Islands',
    '678': '🇻🇺 Vanuatu',
    '679': '🇫🇯 Fiji',
    '680': '🇵🇼 Palau',
    '681': '🇼🇫 Wallis and Futuna',
    '682': '🇨🇰 Cook Islands',
    '683': '🇳🇺 Niue',
    '685': '🇼🇸 Samoa',
    '686': '🇰🇮 Kiribati',
    '687': '🇳🇨 New Caledonia',
    '688': '🇹🇻 Tuvalu',
    '689': '🇵🇫 French Polynesia',
    '690': '🇹🇰 Tokelau',
    '691': '🇫🇲 Micronesia',
    '692': '🇲🇭 Marshall Islands',
    '850': '🇰🇵 North Korea',
    '852': '🇭🇰 Hong Kong',
    '853': '🇲🇴 Macau',
    '855': '🇰🇭 Cambodia',
    '856': '🇱🇦 Laos',
    '880': '🇧🇩 Bangladesh',
    '886': '🇹🇼 Taiwan',
    '960': '🇲🇻 Maldives',
    '961': '🇱🇧 Lebanon',
    '962': '🇯🇴 Jordan',
    '963': '🇸🇾 Syria',
    '964': '🇮🇶 Iraq',
    '965': '🇰🇼 Kuwait',
    '966': '🇸🇦 Saudi Arabia',
    '967': '🇾🇪 Yemen',
    '968': '🇴🇲 Oman',
    '970': '🇵🇸 Palestine',
    '971': '🇦🇪 UAE',
    '972': '🇮🇱 Israel',
    '973': '🇧🇭 Bahrain',
    '974': '🇶🇦 Qatar',
    '975': '🇧🇹 Bhutan',
    '976': '🇲🇳 Mongolia',
    '977': '🇳🇵 Nepal',
    '992': '🇹🇯 Tajikistan',
    '993': '🇹🇲 Turkmenistan',
    '994': '🇦🇿 Azerbaijan',
    '995': '🇬🇪 Georgia',
    '996': '🇰🇬 Kyrgyzstan',
    '998': '🇺🇿 Uzbekistan'
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
                blockedCountries: []
            }, null, 2));
            console.log('📁 Created new antiforeign config file');
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        return config;
    } catch (error) {
        console.error('❌ Error initializing antiforeign config:', error);
        return { enabled: false, blockedCountries: [] };
    }
}

// Resolve LID to real JID
async function resolveLidToJid(sock, jid) {
    if (!jid) return jid;
    if (jid.endsWith('@s.whatsapp.net')) return jid;
    
    if (jid.endsWith('@lid')) {
        try {
            if (sock.signalRepository?.lidMapping?.getPNForLID) {
                const pn = await sock.signalRepository.lidMapping.getPNForLID(jid);
                if (pn) {
                    return pn.replace(/:\d+@s\.whatsapp\.net/, '@s.whatsapp.net');
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
        let phoneNumber = realJid.split('@')[0].replace(/[^0-9]/g, '');
        
        if (!phoneNumber) return 'unknown';
        
        // Sort by length (longest first) to match properly
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
        
        try {
            await sock.updateBlockStatus(realJid, 'block');
            console.log(`✅ Blocked: ${realJid.split('@')[0]}`);
            return true;
        } catch (e1) {
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
        
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) commandPart = commandPart.substring(1);
        
        const parts = commandPart.split(/\s+/);
        const args = parts.slice(1);
        
        const config = initConfig();
        
        // No arguments - show status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            let blockedList = config.blockedCountries.length > 0 
                ? config.blockedCountries.map(c => `└ +${c} - ${countryList[c] || 'Unknown'}`).join('\n')
                : '└ No countries blocked';
            
            const settingText = `🚫 *ANTI-FOREIGN SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries (${config.blockedCountries.length}):*\n` +
                      `${blockedList}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antiforeign on/off\n` +
                      `└ .antiforeign add <code>\n` +
                      `└ .antiforeign remove <code>\n` +
                      `└ .antiforeign list\n` +
                      `└ .antiforeign status\n\n` +
                      `💡 *Example:* .antiforeign add 91`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            let blockedInfo = config.blockedCountries.length > 0
                ? config.blockedCountries.map(c => `└ +${c} - ${countryList[c] || 'Unknown'}`).join('\n')
                : '└ No countries blocked yet';
            
            await sock.sendMessage(chatId, {
                text: `✅ *ANTI-FOREIGN ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🛡️ Blocking enabled for:\n${blockedInfo}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Users from blocked countries will be auto-blocked.`,
                ...channelInfo
            });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: '❌ *ANTI-FOREIGN DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer block users by country.',
                ...channelInfo 
            });
        }
        else if (action === 'add') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign add <country code>\n\n✨ *Example:*\n└ .antiforeign add 91`,
                    ...channelInfo
                });
                return;
            }
            
            const code = args[1];
            const name = countryList[code];
            
            if (!name) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID COUNTRY CODE*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} is not a recognized country code.\n\n💡 Use .antiforeign list to see all codes.`,
                    ...channelInfo
                });
                return;
            }
            
            if (!config.blockedCountries.includes(code)) {
                config.blockedCountries.push(code);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} - ${name}\n\n📌 Users from ${name} will now be blocked.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY BLOCKED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} - ${name} is already blocked.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign remove <country code>\n\n✨ *Example:*\n└ .antiforeign remove 91`,
                    ...channelInfo
                });
                return;
            }
            
            const code = args[1];
            const name = countryList[code] || 'Unknown';
            const before = config.blockedCountries.length;
            config.blockedCountries = config.blockedCountries.filter(c => c !== code);
            
            if (config.blockedCountries.length < before) {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} - ${name}\n\n📌 Users from ${name} will no longer be blocked.\n📊 Remaining blocked: ${config.blockedCountries.length} countries`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *NOT FOUND*\n\n━━━━━━━━━━━━━━━━━━━━\n└ +${code} - ${name} was not in the blocked list.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'list') {
            // Show blocked and available in sections
            let blocked = '';
            let available = '';
            
            for (const [code, name] of Object.entries(countryList)) {
                if (config.blockedCountries.includes(code)) {
                    blocked += `🚫 +${code} - ${name}\n`;
                }
            }
            
            // Show first 30 available
            let count = 0;
            for (const [code, name] of Object.entries(countryList)) {
                if (!config.blockedCountries.includes(code) && count < 30) {
                    available += `✅ +${code} - ${name}\n`;
                    count++;
                }
            }
            
            const total = Object.keys(countryList).length;
            
            await sock.sendMessage(chatId, {
                text: `🌍 *COUNTRY CODES (${total} total)*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🚫 *BLOCKED (${config.blockedCountries.length}):*\n${blocked || '└ None\n'}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✅ *AVAILABLE (showing ${count}):*\n${available}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use .antiforeign add <code> to block a country`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            let blockedInfo = config.blockedCountries.length > 0
                ? config.blockedCountries.map(c => `└ +${c} - ${countryList[c] || 'Unknown'}`).join('\n')
                : '└ No countries blocked';
            
            await sock.sendMessage(chatId, {
                text: `🚫 *ANTI-FOREIGN STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocked Countries (${config.blockedCountries.length}):*\n${blockedInfo}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use .antiforeign list to see all codes`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n` +
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

// Handle incoming messages - auto block foreign users
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        
        if (!config.enabled) return false;
        if (chatId.endsWith('@g.us')) return false;
        if (message.key.fromMe) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        const countryCode = await extractCountryCode(sock, senderJid);
        
        console.log(`🌍 Anti-Foreign: ${senderJid.split('@')[0]} | Country: +${countryCode}`);
        
        if (config.blockedCountries.includes(countryCode)) {
            const countryName = countryList[countryCode] || 'Unknown';
            console.log(`🚫 BLOCKING: +${countryCode} - ${countryName}`);
            
            // Send warning with full country info
            await sock.sendMessage(chatId, { 
                text: `🚫 *ACCESS DENIED*\n\n━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 Your country: *+${countryCode} - ${countryName}*\n` +
                      `⛔ Status: *BLOCKED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Users from ${countryName} are not allowed to use this bot.\n` +
                      `Contact the owner if you believe this is an error.`
            });
            
            await new Promise(r => setTimeout(r, 2000));
            
            const blocked = await blockUser(sock, senderJid);
            if (blocked) {
                console.log(`✅ Blocked: +${countryCode}`);
            } else {
                console.log(`❌ Failed to block: +${countryCode}`);
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
