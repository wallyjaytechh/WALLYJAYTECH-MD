/**
 * WALLYJAYTECH-MD - Update Command (Panel-Friendly - No Auto Restart)
 */

const { exec } = require('child_process');
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

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function updateCommand(sock, chatId, message, zipOverride) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, { 
            text: '❌ Only bot owner can use this command.',
            ...channelInfo
        }, { quoted: message });
        return;
    }
    
    await sock.sendMessage(chatId, { 
        text: `⚠️ *PANEL MODE DETECTED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Automatic update is DISABLED on panel hosting.\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *Manual update instructions:*\n└ Go to your hosting panel\n└ Open the terminal/console\n└ Run: git pull\n└ Run: npm install\n└ Then restart the bot manually\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 *WALLYJAYTECH-MD*`,
        ...channelInfo
    }, { quoted: message });
}

module.exports = updateCommand;
