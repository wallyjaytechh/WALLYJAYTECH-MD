const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

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

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Available emojis for status reactions - ALL YOUR EMOJIS ADDED!
const AVAILABLE_EMOJIS = [
    // Smileys & People
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😙', '😚', '😋', '😛', 
    '😜', '🤪', '😝', '🤑', '🤗', '🤔', '🤭', '🤫', '🤥', '😶‍🌫️', '😏', '😒', '😞', '😔', '😟', '😢', '😭', '😤', '😠', '🤬', 
    '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🙃',
    
    // Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸', '🐵', '🐒', '🦁', '🐘', '🐴', '🦄', '🐲', '🐢', '🐟', '🐠', 
    '🐡', '🦈', '🐬', '🐳', '🐋', '🦭', '🐾', '🌳', '🌴', '🌵', '🌲', '🌷', '🌸', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '🍀', 
    '🍁', '🍂', '🍃', '🌪️', '🌈', '🌞', '🌙', '⭐️', '✨', '⚡️',
    
    // Food & Drink
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍑', '🍒', '🍍', '🥭', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', 
    '🥒', '🌶️', '🧄', '🧅', '🍄', '🍞', '🥐', '🍩', '🍪', '🧁', '🥧', '🍰', '🎂', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', 
    '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🍾', '🥃', '🍽️', '🍴', '💊',
    
    // Activities & Sports
    '⚽️', '🥎', '🏀', '🏈', '⚾️', '🥏', '🎾', '🏐', '🏓', '🏸', '🏒', '🏑', '🏏', '🏹', '🎣', '🏊‍♀️', '🏊‍♂️', '🏋️‍♀️', '🏋️‍♂️', '🤼‍♀️', 
    '🤼‍♂️', '🤸‍♀️', '🤸‍♂️', '🧘‍♀️', '🧘‍♂️', '🚴‍♀️', '🚴‍♂️', '🏇', '🛁', '🛀', '🧖‍♀️', '🧖‍♂️', '🎮', '🎲', '♟️', '🎯', '🎳', '🎤', '🎭', '🎨', 
    '🎬', '🎪', '🎡', '🎢',
    
    // Objects & Tech
    '📱', '📲', '🖥️', '📡', '📀', '💾', '💿', '📷', '📸', '🎥', '📽️', '📺', '📻', '🔋', '🔌', '🖨️', '🖱️', '🖲️', '📎', '🖇️', 
    '📐', '📏', '📚', '📖', '🗞️', '📑', '🗂️', '🗄️', '🗃️', '🗳️', '🗺️', '🧭',
    
    // Symbols & Flags
    '❤️', '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '💜', '💝', '🔔', '🔕', '🔮', '🎵', '🎶', '🎼', '♨️', '🚩', '🏁', 
    '🏳️', '🏴', '🏳️‍🌈', '🇳🇬', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺'
];

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false,
        randomEmoji: true,
        specificEmoji: '❤️'
    }, null, 2));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!',
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const reactStatus = config.reactOn ? '✅ Enabled' : '❌ Disabled';
            const emojiMode = config.randomEmoji ? '🎲 Random' : `🎯 Specific (${config.specificEmoji})`;
            
            await sock.sendMessage(chatId, { 
                text: `🔄 *WALLYJAYTECH-MD Auto Status*\n\n📱 *Auto Status View:* ${status}\n💫 *Status Reactions:* ${reactStatus}\n🎭 *Emoji Mode:* ${emojiMode}\n\n*Total Emojis Available:* ${AVAILABLE_EMOJIS.length}\n\n*Commands:*\n• .autostatus on/off - Enable/disable auto status\n• .autostatus react on/off - Enable/disable reactions\n• .autostatus random - Random emoji mode\n• .autostatus specific <emoji> - Set specific emoji\n• .autostatus list - Show available emojis`,
                ...channelInfo
            });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto status view enabled!*\n\nBot will now automatically view all contact statuses.',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto status view disabled!*\n\nBot will no longer automatically view statuses.',
                ...channelInfo
            });
        } 
        else if (command === 'react') {
            // Handle react subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please specify on/off for reactions!\n\nUse: .autostatus react on/off',
                    ...channelInfo
                });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: '💫 *Status reactions enabled!*\n\nBot will now react to status updates.',
                    ...channelInfo
                });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: '❌ *Status reactions disabled!*\n\nBot will no longer react to status updates.',
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ Invalid reaction command! Use: .autostatus react on/off',
                    ...channelInfo
                });
            }
        }
        else if (command === 'random') {
            config.randomEmoji = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `🎲 *Random emoji mode enabled!*\n\nBot will react with random emojis from ${AVAILABLE_EMOJIS.length} available emojis.`,
                ...channelInfo
            });
        }
        else if (command === 'specific') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please provide an emoji!\n\nExample: .autostatus specific ❤️\n\nUse .autostatus list to see available emojis.',
                    ...channelInfo
                });
                return;
            }
            
            const emoji = args[1];
            if (!AVAILABLE_EMOJIS.includes(emoji)) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Invalid emoji! Use .autostatus list to see all ${AVAILABLE_EMOJIS.length} available emojis.`,
                    ...channelInfo
                });
                return;
            }
            
            config.randomEmoji = false;
            config.specificEmoji = emoji;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `🎯 *Specific emoji set to:* ${emoji}\n\nBot will now react with this emoji to all status updates.`,
                ...channelInfo
            });
        }
        else if (command === 'list') {
            // Show emojis in categories for better organization
            const categories = [
                { name: '😊 Smileys & People', emojis: AVAILABLE_EMOJIS.slice(0, 51) },
                { name: '🐶 Animals & Nature', emojis: AVAILABLE_EMOJIS.slice(51, 101) },
                { name: '🍏 Food & Drink', emojis: AVAILABLE_EMOJIS.slice(101, 151) },
                { name: '⚽️ Activities & Sports', emojis: AVAILABLE_EMOJIS.slice(151, 201) },
                { name: '📱 Objects & Tech', emojis: AVAILABLE_EMOJIS.slice(201, 232) },
                { name: '❤️ Symbols & Flags', emojis: AVAILABLE_EMOJIS.slice(232) }
            ];
            
            let emojiListText = `📋 *Available Status Emojis - ${AVAILABLE_EMOJIS.length} Total*\n\n`;
            
            for (const category of categories) {
                emojiListText += `*${category.name}:*\n${category.emojis.join(' ')}\n\n`;
            }
            
            emojiListText += `*Current Setting:* ${config.randomEmoji ? 'Random Mode 🎲' : `Specific: ${config.specificEmoji} 🎯`}`;
            
            // Split long message if needed
            if (emojiListText.length > 4000) {
                const parts = emojiListText.match(/[\s\S]{1,4000}/g) || [emojiListText];
                for (const part of parts) {
                    await sock.sendMessage(chatId, { 
                        text: part,
                        ...channelInfo
                    });
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } else {
                await sock.sendMessage(chatId, { 
                    text: emojiListText,
                    ...channelInfo
                });
            }
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Invalid command!*\n\n*Available Commands:*\n• .autostatus on/off - Enable/disable auto status\n• .autostatus react on/off - Enable/disable reactions\n• .autostatus random - Random emoji mode\n• .autostatus specific <emoji> - Set specific emoji\n• .autostatus list - Show all ${AVAILABLE_EMOJIS.length} emojis`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto status!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Get reaction emoji based on settings
function getStatusReactionEmoji() {
    try {
        if (!fs.existsSync(configPath)) return '❤️';
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.randomEmoji) {
            // Return random emoji from available list
            return AVAILABLE_EMOJIS[Math.floor(Math.random() * AVAILABLE_EMOJIS.length)];
        } else {
            // Return specific emoji
            return config.specificEmoji || '❤️';
        }
    } catch (error) {
        console.error('Error getting status reaction emoji:', error);
        return '❤️';
    }
}

// Function to react to status using proper method - FIXED VERSION
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        const reactionEmoji = getStatusReactionEmoji();

        // Create the reaction message
        const reactionMessage = {
            react: {
                key: statusKey,
                text: reactionEmoji
            }
        };

        // Send the reaction
        await sock.sendMessage('status@broadcast', reactionMessage);
        
        console.log(`✅ Reacted to status with ${reactionEmoji}`);
        return true;
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
        
        // Alternative method if first fails
        try {
            const reactionMessage = {
                key: statusKey,
                reaction: reactionEmoji
            };
            await sock.sendMessage('status@broadcast', { react: reactionMessage });
            console.log(`✅ Reacted to status with ${reactionEmoji} (alt method)`);
            return true;
        } catch (err) {
            console.error('❌ Both reaction methods failed:', err.message);
            return false;
        }
    }
}

// Function to handle status updates - FIXED VERSION
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    // First view the status
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    console.log(`✅ Viewed status from ${sender}`);
                    
                    // Small delay before reacting
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Then react to the status
                    await reactToStatus(sock, msg.key);
                    
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await sock.readMessages([msg.key]);
                    } else {
                        console.error('❌ Error processing status:', err.message);
                    }
                }
                return;
            }
        }

        // Handle direct status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                // First view the status
                await sock.readMessages([status.key]);
                const sender = status.key.participant || status.key.remoteJid;
                console.log(`✅ Viewed status from ${sender}`);
                
                // Small delay before reacting
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Then react to the status
                await reactToStatus(sock, status.key);
                
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    await sock.readMessages([status.key]);
                } else {
                    console.error('❌ Error processing status:', err.message);
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

// Handle bulk status updates
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        if (!isAutoStatusEnabled() || !statusMessages || statusMessages.length === 0) {
            return;
        }

        console.log(`📱 Processing ${statusMessages.length} status updates`);
        
        for (const msg of statusMessages) {
            try {
                if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                    // View the status
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    console.log(`✅ Viewed status from ${sender}`);
                    
                    // React if enabled
                    if (isStatusReactionEnabled()) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                        await reactToStatus(sock, msg.key);
                    }
                    
                    // Delay between statuses
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (err) {
                console.error('❌ Error processing bulk status:', err.message);
                continue;
            }
        }
        
        console.log('✅ Finished processing all statuses');
        
    } catch (error) {
        console.error('❌ Error in bulk status handling:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    handleBulkStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled
};
