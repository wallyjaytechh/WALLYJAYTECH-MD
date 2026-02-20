// commands/antidelete.js - TEST VERSION
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Simple config
let config = {
    enabled: false
};

// Load config
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {
        console.log('Using default config');
    }
    return config;
}

// Save config
function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error('Save error:', e);
    }
}

// MAIN COMMAND HANDLER
async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        console.log('📢 Antidelete function called!');
        console.log('📍 Chat ID:', chatId);
        console.log('📝 Args received:', args);
        console.log('📋 Args type:', typeof args, Array.isArray(args) ? 'array' : 'not array');

        // Load current config
        loadConfig();
        
        // Get the command (first argument)
        const cmd = args && args.length > 0 ? args[0].toLowerCase() : '';
        console.log('🎯 Command:', cmd);

        // If no command, show status
        if (!cmd) {
            const status = config.enabled ? 'ON ✅' : 'OFF ❌';
            const text = `*📱 ANTI-DELETE*\n\nStatus: ${status}\n\nCommands:\n• .antidelete on\n• .antidelete off`;
            
            await sock.sendMessage(chatId, { text }, { quoted: message });
            console.log('✅ Sent status message');
            return;
        }

        // Handle on/off
        if (cmd === 'on') {
            config.enabled = true;
            saveConfig();
            await sock.sendMessage(chatId, { text: '✅ *Anti-delete: ON*' }, { quoted: message });
            console.log('✅ Turned ON');
            return;
        }

        if (cmd === 'off') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { text: '❌ *Anti-delete: OFF*' }, { quoted: message });
            console.log('✅ Turned OFF');
            return;
        }

        // If command not recognized
        await sock.sendMessage(chatId, { text: '❌ Unknown command. Use .antidelete' }, { quoted: message });

    } catch (error) {
        console.error('❌ Fatal error in antidelete:', error);
        try {
            await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
        } catch (e) {}
    }
}

// Dummy functions
async function storeMessage(sock, message) {
    // Do nothing for now
}

async function handleMessageRevocation(sock, revocationMessage) {
    // Do nothing for now
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
