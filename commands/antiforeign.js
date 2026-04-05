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
const DEFAULT_BLOCKED_COUNTRIES = ['91', '92', '1', '44', '86']; // India, Pakistan, US, UK, China

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
        
        // Country code mapping
        const countryCodes = {
            '1': 'USA/Canada',
            '7': 'Russia',
            '20': 'Egypt',
            '27': 'South Africa',
            '30': 'Greece',
            '31': 'Netherlands',
            '32': 'Belgium',
            '33': 'France',
            '34': 'Spain',
            '36': 'Hungary',
            '39': 'Italy',
            '40': 'Romania',
            '41': 'Switzerland',
            '43': 'Austria',
            '44': 'UK',
            '45': 'Denmark',
            '46': 'Sweden',
            '47': 'Norway',
            '48': 'Poland',
            '49': 'Germany',
            '51': 'Peru',
            '52': 'Mexico',
            '53': 'Cuba',
            '54': 'Argentina',
            '55': 'Brazil',
            '56': 'Chile',
            '57': 'Colombia',
            '58': 'Venezuela',
            '60': 'Malaysia',
            '61': 'Australia',
            '62': 'Indonesia',
            '63': 'Philippines',
            '64': 'New Zealand',
            '65': 'Singapore',
            '66': 'Thailand',
            '81': 'Japan',
            '82': 'South Korea',
            '84': 'Vietnam',
            '86': 'China',
            '90': 'Turkey',
            '91': 'India',
            '92': 'Pakistan',
            '93': 'Afghanistan',
            '94': 'Sri Lanka',
            '95': 'Myanmar',
            '98': 'Iran',
            '212': 'Morocco',
            '213': 'Algeria',
            '216': 'Tunisia',
            '218': 'Libya',
            '220': 'Gambia',
            '221': 'Senegal',
            '222': 'Mauritania',
            '223': 'Mali',
            '224': 'Guinea',
            '225': 'Ivory Coast',
            '226': 'Burkina Faso',
            '227': 'Niger',
            '228': 'Togo',
            '229': 'Benin',
            '230': 'Mauritius',
            '231': 'Liberia',
            '232': 'Sierra Leone',
            '233': 'Ghana',
            '234': 'Nigeria',
            '235': 'Chad',
            '236': 'Central African Republic',
            '237': 'Cameroon',
            '238': 'Cape Verde',
            '239': 'Sao Tome',
            '240': 'Equatorial Guinea',
            '241': 'Gabon',
            '242': 'Congo',
            '243': 'DR Congo',
            '244': 'Angola',
            '245': 'Guinea-Bissau',
            '246': 'Diego Garcia',
            '247': 'Ascension',
            '248': 'Seychelles',
            '249': 'Sudan',
            '250': 'Rwanda',
            '251': 'Ethiopia',
            '252': 'Somalia',
            '253': 'Djibouti',
            '254': 'Kenya',
            '255': 'Tanzania',
            '256': 'Uganda',
            '257': 'Burundi',
            '258': 'Mozambique',
            '260': 'Zambia',
            '261': 'Madagascar',
            '262': 'Reunion',
            '263': 'Zimbabwe',
            '264': 'Namibia',
            '265': 'Malawi',
            '266': 'Lesotho',
            '267': 'Botswana',
            '268': 'Swaziland',
            '269': 'Comoros',
            '290': 'Saint Helena',
            '291': 'Eritrea',
            '297': 'Aruba',
            '298': 'Faroe Islands',
            '299': 'Greenland',
            '350': 'Gibraltar',
            '351': 'Portugal',
            '352': 'Luxembourg',
            '353': 'Ireland',
            '354': 'Iceland',
            '355': 'Albania',
            '356': 'Malta',
            '357': 'Cyprus',
            '358': 'Finland',
            '359': 'Bulgaria',
            '370': 'Lithuania',
            '371': 'Latvia',
            '372': 'Estonia',
            '373': 'Moldova',
            '374': 'Armenia',
            '375': 'Belarus',
            '376': 'Andorra',
            '377': 'Monaco',
            '378': 'San Marino',
            '379': 'Vatican',
            '380': 'Ukraine',
            '381': 'Serbia',
            '382': 'Montenegro',
            '383': 'Kosovo',
            '385': 'Croatia',
            '386': 'Slovenia',
            '387': 'Bosnia',
            '389': 'North Macedonia',
            '420': 'Czech Republic',
            '421': 'Slovakia',
            '423': 'Liechtenstein',
            '500': 'Falkland Islands',
            '501': 'Belize',
            '502': 'Guatemala',
            '503': 'El Salvador',
            '504': 'Honduras',
            '505': 'Nicaragua',
            '506': 'Costa Rica',
            '507': 'Panama',
            '508': 'Saint Pierre',
            '509': 'Haiti',
            '590': 'Guadeloupe',
            '591': 'Bolivia',
            '592': 'Guyana',
            '593': 'Ecuador',
            '594': 'French Guiana',
            '595': 'Paraguay',
            '596': 'Martinique',
            '597': 'Suriname',
            '598': 'Uruguay',
            '599': 'Netherlands Antilles',
            '670': 'East Timor',
            '672': 'Antarctica',
            '673': 'Brunei',
            '674': 'Nauru',
            '675': 'Papua New Guinea',
            '676': 'Tonga',
            '677': 'Solomon Islands',
            '678': 'Vanuatu',
            '679': 'Fiji',
            '680': 'Palau',
            '681': 'Wallis and Futuna',
            '682': 'Cook Islands',
            '683': 'Niue',
            '685': 'Samoa',
            '686': 'Kiribati',
            '687': 'New Caledonia',
            '688': 'Tuvalu',
            '689': 'French Polynesia',
            '690': 'Tokelau',
            '691': 'Micronesia',
            '692': 'Marshall Islands',
            '850': 'North Korea',
            '852': 'Hong Kong',
            '853': 'Macau',
            '855': 'Cambodia',
            '856': 'Laos',
            '880': 'Bangladesh',
            '886': 'Taiwan',
            '960': 'Maldives',
            '961': 'Lebanon',
            '962': 'Jordan',
            '963': 'Syria',
            '964': 'Iraq',
            '965': 'Kuwait',
            '966': 'Saudi Arabia',
            '967': 'Yemen',
            '968': 'Oman',
            '970': 'Palestine',
            '971': 'UAE',
            '972': 'Israel',
            '973': 'Bahrain',
            '974': 'Qatar',
            '975': 'Bhutan',
            '976': 'Mongolia',
            '977': 'Nepal',
            '992': 'Tajikistan',
            '993': 'Turkmenistan',
            '994': 'Azerbaijan',
            '995': 'Georgia',
            '996': 'Kyrgyzstan',
            '998': 'Uzbekistan'
        };
        
        // Check for 3-digit codes first
        if (cleanNumber.length >= 12) {
            const code3 = cleanNumber.substring(0, 3);
            if (countryCodes[code3]) return code3;
        }
        
        // Then check for 2-digit codes
        if (cleanNumber.length >= 11) {
            const code2 = cleanNumber.substring(0, 2);
            if (countryCodes[code2]) return code2;
        }
        
        // Then check for 1-digit codes
        if (cleanNumber.length >= 10) {
            const code1 = cleanNumber.substring(0, 1);
            if (countryCodes[code1]) return code1;
        }
        
        return 'unknown';
    } catch (error) {
        return 'unknown';
    }
}

// Get country name from code
function getCountryName(code) {
    const countries = {
        '1': 'USA/Canada', '7': 'Russia', '20': 'Egypt', '27': 'South Africa',
        '30': 'Greece', '31': 'Netherlands', '32': 'Belgium', '33': 'France',
        '34': 'Spain', '36': 'Hungary', '39': 'Italy', '40': 'Romania',
        '41': 'Switzerland', '43': 'Austria', '44': 'UK', '45': 'Denmark',
        '46': 'Sweden', '47': 'Norway', '48': 'Poland', '49': 'Germany',
        '51': 'Peru', '52': 'Mexico', '53': 'Cuba', '54': 'Argentina',
        '55': 'Brazil', '56': 'Chile', '57': 'Colombia', '58': 'Venezuela',
        '60': 'Malaysia', '61': 'Australia', '62': 'Indonesia', '63': 'Philippines',
        '64': 'New Zealand', '65': 'Singapore', '66': 'Thailand', '81': 'Japan',
        '82': 'South Korea', '84': 'Vietnam', '86': 'China', '90': 'Turkey',
        '91': 'India', '92': 'Pakistan', '93': 'Afghanistan', '94': 'Sri Lanka',
        '95': 'Myanmar', '98': 'Iran', '212': 'Morocco', '213': 'Algeria',
        '216': 'Tunisia', '218': 'Libya', '220': 'Gambia', '221': 'Senegal',
        '222': 'Mauritania', '223': 'Mali', '224': 'Guinea', '225': 'Ivory Coast',
        '226': 'Burkina Faso', '227': 'Niger', '228': 'Togo', '229': 'Benin',
        '230': 'Mauritius', '231': 'Liberia', '232': 'Sierra Leone', '233': 'Ghana',
        '234': 'Nigeria', '235': 'Chad', '236': 'Central African Republic',
        '237': 'Cameroon', '238': 'Cape Verde', '239': 'Sao Tome', '240': 'Equatorial Guinea',
        '241': 'Gabon', '242': 'Congo', '243': 'DR Congo', '244': 'Angola',
        '245': 'Guinea-Bissau', '246': 'Diego Garcia', '247': 'Ascension', '248': 'Seychelles',
        '249': 'Sudan', '250': 'Rwanda', '251': 'Ethiopia', '252': 'Somalia',
        '253': 'Djibouti', '254': 'Kenya', '255': 'Tanzania', '256': 'Uganda',
        '257': 'Burundi', '258': 'Mozambique', '260': 'Zambia', '261': 'Madagascar',
        '262': 'Reunion', '263': 'Zimbabwe', '264': 'Namibia', '265': 'Malawi',
        '266': 'Lesotho', '267': 'Botswana', '268': 'Swaziland', '269': 'Comoros',
        '290': 'Saint Helena', '291': 'Eritrea', '350': 'Gibraltar', '351': 'Portugal',
        '352': 'Luxembourg', '353': 'Ireland', '354': 'Iceland', '355': 'Albania',
        '356': 'Malta', '357': 'Cyprus', '358': 'Finland', '359': 'Bulgaria',
        '370': 'Lithuania', '371': 'Latvia', '372': 'Estonia', '373': 'Moldova',
        '374': 'Armenia', '375': 'Belarus', '376': 'Andorra', '377': 'Monaco',
        '378': 'San Marino', '379': 'Vatican', '380': 'Ukraine', '381': 'Serbia',
        '382': 'Montenegro', '383': 'Kosovo', '385': 'Croatia', '386': 'Slovenia',
        '387': 'Bosnia', '389': 'North Macedonia', '420': 'Czech Republic',
        '421': 'Slovakia', '423': 'Liechtenstein', '500': 'Falkland Islands',
        '501': 'Belize', '502': 'Guatemala', '503': 'El Salvador', '504': 'Honduras',
        '505': 'Nicaragua', '506': 'Costa Rica', '507': 'Panama', '508': 'Saint Pierre',
        '509': 'Haiti', '590': 'Guadeloupe', '591': 'Bolivia', '592': 'Guyana',
        '593': 'Ecuador', '594': 'French Guiana', '595': 'Paraguay', '596': 'Martinique',
        '597': 'Suriname', '598': 'Uruguay', '599': 'Netherlands Antilles', '670': 'East Timor',
        '672': 'Antarctica', '673': 'Brunei', '674': 'Nauru', '675': 'Papua New Guinea',
        '676': 'Tonga', '677': 'Solomon Islands', '678': 'Vanuatu', '679': 'Fiji',
        '680': 'Palau', '681': 'Wallis and Futuna', '682': 'Cook Islands', '683': 'Niue',
        '685': 'Samoa', '686': 'Kiribati', '687': 'New Caledonia', '688': 'Tuvalu',
        '689': 'French Polynesia', '690': 'Tokelau', '691': 'Micronesia', '692': 'Marshall Islands',
        '850': 'North Korea', '852': 'Hong Kong', '853': 'Macau', '855': 'Cambodia',
        '856': 'Laos', '880': 'Bangladesh', '886': 'Taiwan', '960': 'Maldives',
        '961': 'Lebanon', '962': 'Jordan', '963': 'Syria', '964': 'Iraq',
        '965': 'Kuwait', '966': 'Saudi Arabia', '967': 'Yemen', '968': 'Oman',
        '970': 'Palestine', '971': 'UAE', '972': 'Israel', '973': 'Bahrain',
        '974': 'Qatar', '975': 'Bhutan', '976': 'Mongolia', '977': 'Nepal',
        '992': 'Tajikistan', '993': 'Turkmenistan', '994': 'Azerbaijan', '995': 'Georgia',
        '996': 'Kyrgyzstan', '998': 'Uzbekistan'
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
        
        // If no arguments, show current status
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
                      `🌍 *Blocked Countries:*\n${countriesList}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💬 *Block Message:*\n└ ${config.blockMessage}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antiforeign on/off - Enable/disable\n` +
                      `└ .antiforeign add <code> - Add country to blocklist\n` +
                      `└ .antiforeign remove <code> - Remove country from blocklist\n` +
                      `└ .antiforeign list - Show all blocked countries\n` +
                      `└ .antiforeign message <text> - Set custom block message\n` +
                      `└ .antiforeign status - Show current settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 *Usage Examples:*\n` +
                      `└ .antiforeign on - Enable blocking\n` +
                      `└ .antiforeign add 91 - Block India\n` +
                      `└ .antiforeign add 234 - Block Nigeria\n` +
                      `└ .antiforeign remove 44 - Unblock UK\n` +
                      `└ .antiforeign message "Your country is blocked" - Custom message\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Common Country Codes:*\n` +
                      `└ 1=USA, 44=UK, 91=India, 92=Pakistan, 86=China\n` +
                      `└ 234=Nigeria, 233=Ghana, 254=Kenya, 27=SA, 55=Brazil`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            let countriesList = '';
            for (const code of config.blockedCountries) {
                countriesList += `└ ${code} - ${getCountryName(code)}\n`;
            }
            
            const responseText = `✅ *ANTI-FOREIGN ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🌍 *Blocking ${config.blockedCountries.length} countries:*\n${countriesList}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Foreign numbers from these countries will be automatically blocked.\n\n` +
                      `💡 *To add more countries:* .antiforeign add <code>`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: '❌ *ANTI-FOREIGN DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nAll countries are now allowed. No numbers will be blocked.',
                ...channelInfo
            });
        }
        else if (action === 'add') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign add <country_code>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .antiforeign add 91 - Block India\n└ .antiforeign add 234 - Block Nigeria\n└ .antiforeign add 44 - Block UK\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Common codes:* 1(USA), 44(UK), 91(India), 92(Pakistan), 86(China), 234(Nigeria)`,
                    ...channelInfo
                });
                return;
            }
            
            const countryCode = args[1];
            const countryName = getCountryName(countryCode);
            
            if (!config.blockedCountries.includes(countryCode)) {
                config.blockedCountries.push(countryCode);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY ADDED TO BLOCKLIST*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n└ Country: ${countryName}\n\n━━━━━━━━━━━━━━━━━━━━\n🌍 Now blocking ${config.blockedCountries.length} countries.\n\n💡 Use .antiforeign list to see all blocked countries.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY BLOCKED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n└ Country: ${countryName}\n\n━━━━━━━━━━━━━━━━━━━━\nThis country is already in your blocklist.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign remove <country_code>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Examples:*\n└ .antiforeign remove 91 - Unblock India\n└ .antiforeign remove 44 - Unblock UK`,
                    ...channelInfo
                });
                return;
            }
            
            const countryCode = args[1];
            const countryName = getCountryName(countryCode);
            const index = config.blockedCountries.indexOf(countryCode);
            
            if (index > -1) {
                config.blockedCountries.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *COUNTRY REMOVED FROM BLOCKLIST*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n└ Country: ${countryName}\n\n━━━━━━━━━━━━━━━━━━━━\n🌍 Now blocking ${config.blockedCountries.length} countries.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *NOT IN BLOCKLIST*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Code: ${countryCode}\n└ Country: ${countryName}\n\n━━━━━━━━━━━━━━━━━━━━\nThis country is not currently blocked.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'list') {
            if (config.blockedCountries.length === 0) {
                await sock.sendMessage(chatId, {
                    text: `📋 *BLOCKED COUNTRIES*\n\n━━━━━━━━━━━━━━━━━━━━\n└ No countries currently blocked.\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Use .antiforeign add <code> to block a country.`,
                    ...channelInfo
                });
                return;
            }
            
            let countriesList = '';
            for (const code of config.blockedCountries) {
                countriesList += `└ ${code} - ${getCountryName(code)}\n`;
            }
            
            await sock.sendMessage(chatId, {
                text: `📋 *BLOCKED COUNTRIES*\n\n━━━━━━━━━━━━━━━━━━━━\n${countriesList}━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${config.blockedCountries.length} countries`,
                ...channelInfo
            });
        }
        else if (action === 'message') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .antiforeign message <your message>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .antiforeign message "Your country is not allowed to contact me."\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Use \\n for new lines in your message.`,
                    ...channelInfo
                });
                return;
            }
            
            const newMessage = args.slice(1).join(' ');
            config.blockMessage = newMessage;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, {
                text: `✅ *BLOCK MESSAGE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n💬 New message:\n└ "${newMessage}"\n\n━━━━━━━━━━━━━━━━━━━━\n📌 This message will be sent when a blocked country tries to contact you.`,
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
                      `🌍 *Blocked Countries (${config.blockedCountries.length}):*\n${countriesList}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💬 *Block Message:*\n└ ${config.blockMessage}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 *When enabled:* Anyone from blocked countries who messages you will be automatically blocked.`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .antiforeign on/off - Enable/disable\n` +
                      `└ .antiforeign add <code> - Add country\n` +
                      `└ .antiforeign remove <code> - Remove country\n` +
                      `└ .antiforeign list - Show blocked countries\n` +
                      `└ .antiforeign message <text> - Set block message\n` +
                      `└ .antiforeign status - Show settings\n` +
                      `└ .antiforeign - Show this menu\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Quick Start:*\n` +
                      `1️⃣ .antiforeign on - Enable blocking\n` +
                      `2️⃣ .antiforeign add 91 - Block India\n` +
                      `3️⃣ .antiforeign list - See blocked countries`,
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

// Handle antiforeign blocking - THIS IS THE MAIN FUNCTION THAT BLOCKS
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        
        // Only block in private chats (not groups)
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't block bot's own messages
        if (message.key.fromMe) return false;
        
        // Check if feature is enabled
        if (!config.enabled) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        const countryCode = extractCountryCode(senderJid);
        
        // Check if sender is from blocked country
        if (isBlockedCountry(senderJid, config.blockedCountries)) {
            console.log(`🚫 Anti-foreign: Blocking message from ${senderJid} (Country: ${countryCode} - ${getCountryName(countryCode)})`);
            
            // Send block message
            await sock.sendMessage(chatId, { 
                text: config.blockMessage,
                ...channelInfo
            });
            
            // Wait 1 second then block the user
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                await sock.updateBlockStatus(senderJid, 'block');
                console.log(`✅ Successfully blocked ${senderJid} (${getCountryName(countryCode)})`);
            } catch (blockError) {
                console.error('Error blocking user:', blockError);
            }
            
            return true; // Message was blocked
        }
        
        return false; // Message was not blocked
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
