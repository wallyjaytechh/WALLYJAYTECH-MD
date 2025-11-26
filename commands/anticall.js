const fs = require('fs');

const ANTICALL_PATH = './data/anticall.json';

// Default configuration
const defaultConfig = {
    enabled: false,
    blockCallers: false, // New option: whether to block callers or just decline
    message: "📞 *Incoming Call Blocked* 📞\n\n👋 Hello there! @{caller}\n\n🚫 *I'm currently unavailable for calls* 🚫\n\n💬 *Please message me instead!* 💬\n\n⏰ *I'll respond when I'm available*\n\n✨ *Thank you for understanding!* ✨"
};

function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) return { ...defaultConfig };
        const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { ...defaultConfig, ...data };
    } catch {
        return { ...defaultConfig };
    }
}

function writeState(config) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ ...defaultConfig, ...config }, null, 2));
    } catch (error) {
        console.error('Error writing anticall config:', error);
    }
}

async function anticallCommand(sock, chatId, message, args) {
    const state = readState();
    const sub = (args || '').trim().toLowerCase();
    const action = sub.split(' ')[0];

    if (!action || (action !== 'on' && action !== 'off' && action !== 'status' && action !== 'block' && action !== 'decline' && action !== 'message')) {
        await sock.sendMessage(chatId, { 
            text: `📞 *ANTICALL SYSTEM* 📞\n\n*Current Status:* ${state.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n*Mode:* ${state.blockCallers ? '🚫 Block Callers' : '📵 Decline Only'}\n\n*Available Commands:*\n\n• .anticall on - Enable anticall\n• .anticall off - Disable anticall\n• .anticall block - Block calls & block callers\n• .anticall decline - Decline calls only (don't block)\n• .anticall message <text> - Set custom message\n• .anticall status - Show current settings\n\n*Usage Examples:*\n.anticall on\n.anticall decline\n.anticall message Hello @{caller}, I'm busy!` 
        }, { quoted: message });
        return;
    }

    if (action === 'status') {
        const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
        const mode = state.blockCallers ? '🚫 Block Callers' : '📵 Decline Only';
        const messagePreview = state.message.substring(0, 100) + (state.message.length > 100 ? '...' : '');
        
        await sock.sendMessage(chatId, { 
            text: `📞 *ANTICALL STATUS* 📞\n\n*Status:* ${status}\n*Mode:* ${mode}\n\n*Current Message:*\n"${messagePreview}"\n\nUse *.anticall message <text>* to change the message.\nUse *@{caller}* in your message to mention the caller.` 
        }, { quoted: message });
        return;
    }

    if (action === 'on') {
        writeState({ ...state, enabled: true });
        await sock.sendMessage(chatId, { 
            text: `✅ *ANTICALL ENABLED!*\n\n📞 Incoming calls will now be automatically ${state.blockCallers ? 'blocked and callers will be blocked' : 'declined'}.\n\n*Mode:* ${state.blockCallers ? 'Block Callers' : 'Decline Only'}\n\nUse *.anticall block* or *.anticall decline* to change mode.` 
        }, { quoted: message });
        return;
    }

    if (action === 'off') {
        writeState({ ...state, enabled: false });
        await sock.sendMessage(chatId, { 
            text: '❌ *ANTICALL DISABLED!*\n\n📞 Incoming calls will no longer be automatically handled.' 
        }, { quoted: message });
        return;
    }

    if (action === 'block') {
        writeState({ ...state, enabled: true, blockCallers: true });
        await sock.sendMessage(chatId, { 
            text: `🚫 *BLOCK MODE ACTIVATED!*\n\n📞 Anticall is now ENABLED in BLOCK mode.\n\n• Incoming calls will be blocked\n• Callers will be automatically blocked\n• Custom message will be sent before blocking` 
        }, { quoted: message });
        return;
    }

    if (action === 'decline') {
        writeState({ ...state, enabled: true, blockCallers: false });
        await sock.sendMessage(chatId, { 
            text: `📵 *DECLINE MODE ACTIVATED!*\n\n📞 Anticall is now ENABLED in DECLINE mode.\n\n• Incoming calls will be declined\n• Callers will NOT be blocked\n• Custom message will be sent` 
        }, { quoted: message });
        return;
    }

    if (action === 'message') {
        const newMessage = sub.substring(7).trim(); // Remove "message" from the string
        if (!newMessage) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please provide a message!*\n\n*Usage:* .anticall message <your message>\n\n*Example:* .anticall message Hello @{caller}, I am busy right now! 🚫\n\nUse *@{caller}* to mention the caller in your message.' 
            }, { quoted: message });
            return;
        }

        writeState({ ...state, message: newMessage });
        await sock.sendMessage(chatId, { 
            text: `💬 *CUSTOM MESSAGE SET!*\n\n*New Message:*\n"${newMessage}"\n\nThis message will be sent to callers when anticall is active.\n\n*Preview with mention:*\n${newMessage.replace('@{caller}', '@1234567890')}` 
        }, { quoted: message });
        return;
    }
}

// Track recently-notified callers to avoid spamming messages
const antiCallNotified = new Set();

// Enhanced anticall handler
async function handleAnticall(sock, calls) {
    try {
        const state = readState();
        if (!state.enabled) return;

        for (const call of calls) {
            const callerJid = call.from || call.peerJid || call.chatId;
            if (!callerJid) continue;

            try {
                // Extract caller number for mention
                const callerNumber = callerJid.split('@')[0];
                const callerMention = `@${callerNumber}`;

                // First: attempt to reject the call if supported
                try {
                    if (typeof sock.rejectCall === 'function' && call.id) {
                        await sock.rejectCall(call.id, callerJid);
                    } else if (typeof sock.sendCallOfferAck === 'function' && call.id) {
                        await sock.sendCallOfferAck(call.id, callerJid, 'reject');
                    }
                    console.log(`📞 Call from ${callerNumber} rejected`);
                } catch (rejectError) {
                    console.error('Error rejecting call:', rejectError);
                }

                // Send custom message (only once within a short window)
                if (!antiCallNotified.has(callerJid)) {
                    antiCallNotified.add(callerJid);
                    setTimeout(() => antiCallNotified.delete(callerJid), 60000); // 1 minute cooldown

                    const customMessage = state.message.replace(/\{caller\}/g, callerMention);
                    
                    await sock.sendMessage(callerJid, { 
                        text: customMessage,
                        mentions: [callerJid]
                    });
                    console.log(`💬 Sent anticall message to ${callerNumber}`);
                }

                // Block caller if enabled (with delay to ensure message is sent)
                if (state.blockCallers) {
                    setTimeout(async () => {
                        try { 
                            await sock.updateBlockStatus(callerJid, 'block');
                            console.log(`🚫 Blocked caller: ${callerNumber}`);
                        } catch (blockError) {
                            console.error('Error blocking caller:', blockError);
                        }
                    }, 2000);
                }

            } catch (error) {
                console.error('Error in anticall handler:', error);
            }
        }
    } catch (error) {
        console.error('Error in handleAnticall:', error);
    }
}

module.exports = { 
    anticallCommand, 
    readState,
    handleAnticall 
};
