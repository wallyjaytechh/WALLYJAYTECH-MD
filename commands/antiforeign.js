/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Antiforeign Command - Block specific country numbers
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'antiforeign.json');

// Country codes to block (you can modify this list)
const DEFAULT_BLOCKED_COUNTRIES = ['91', '92', '1', '44', '86']; // India, Pakistan, US, UK, China

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
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
        // JID format: 1234567890@s.whatsapp.net
        const phoneNumber = jid.split('@')[0];
        
        // Remove any non-digit characters
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
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        // Initialize or read config
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const countries = config.blockedCountries.join(', ');
            
            await sock.sendMessage(chatId, {
                text: `🚫 *Anti-Foreign Settings*\n\n📱 *Status:* ${status}\n🇺🇳 *Blocked Countries:* ${countries}\n💬 *Message:* ${config.blockMessage}\n\n*Commands:*\n• .antiforeign on/off - Enable/disable\n• .antiforeign add <code> - Add country\n• .antiforeign remove <code> - Remove country\n• .antiforeign list - Show blocked countries\n• .antiforeign message <text> - Set block message\n• .antiforeign status - Show current settings`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *Anti-foreign enabled!*\n\nBlocking ${config.blockedCountries.length} countries:\n${config.blockedCountries.join(', ')}\n\nForeign numbers will be automatically blocked.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: '❌ *Anti-foreign disabled!*\n\nAll countries are now allowed.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else if (action === 'add') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please specify a country code!\n\nExample: .antiforeign add 91 (for India)',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
            
            const countryCode = args[1];
            if (!config.blockedCountries.includes(countryCode)) {
                config.blockedCountries.push(countryCode);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *Country ${countryCode} added to blocklist!*\n\nBlocked countries: ${config.blockedCountries.join(', ')}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Country ${countryCode} is already blocked!`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            }
        }
        else if (action === 'remove') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please specify a country code to remove!\n\nExample: .antiforeign remove 91',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
            
            const countryCode = args[1];
            const index = config.blockedCountries.indexOf(countryCode);
            if (index > -1) {
                config.blockedCountries.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *Country ${countryCode} removed from blocklist!*\n\nBlocked countries: ${config.blockedCountries.join(', ')}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Country ${countryCode} is not in blocklist!`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            }
        }
        else if (action === 'list') {
            const countries = config.blockedCountries.length > 0 
                ? config.blockedCountries.join(', ')
                : 'No countries blocked';
                
            await sock.sendMessage(chatId, {
                text: `📋 *Blocked Countries*\n\n${countries}\n\nTotal: ${config.blockedCountries.length} countries`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else if (action === 'message') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please specify a message!\n\nExample: .antiforeign message "Your country is not allowed to contact me."',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
            
            const newMessage = args.slice(1).join(' ');
            config.blockMessage = newMessage;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *Block message updated!*\n\nNew message: "${newMessage}"`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const countries = config.blockedCountries.join(', ');
            
            await sock.sendMessage(chatId, {
                text: `🚫 *Anti-Foreign Status*\n\n📱 *Status:* ${status}\n🇺🇳 *Blocked Countries:* ${countries}\n💬 *Message:* ${config.blockMessage}\n\n*Currently blocking:* ${config.blockedCountries.length} countries`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command!\n\n*Available Commands:*\n• .antiforeign on/off\n• .antiforeign add <code>\n• .antiforeign remove <code>\n• .antiforeign list\n• .antiforeign message <text>\n• .antiforeign status\n• .antiforeign (shows this menu)',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error in antiforeign command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Handle antiforeign blocking
async function handleAntiforeign(sock, chatId, message) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;

        // Skip if it's a group or from bot itself
        if (chatId.endsWith('@g.us') || message.key.fromMe) return false;

        const senderJid = message.key.participant || message.key.remoteJid;
        
        // Check if sender is from blocked country
        if (isBlockedCountry(senderJid, config.blockedCountries)) {
            console.log(`🚫 Blocked message from country: ${extractCountryCode(senderJid)}`);
            
            // Send block message
            await sock.sendMessage(chatId, { 
                text: config.blockMessage 
            });
            
            // Block the user
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                await sock.updateBlockStatus(senderJid, 'block');
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
