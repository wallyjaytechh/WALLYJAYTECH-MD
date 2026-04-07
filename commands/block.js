/**
 * WALLYJAYTECH-MD - Block Command (Working version)
 */

async function blockCommand(sock, chatId, message) {
    try {
        // Get the bot owner's number dynamically
        const botOwner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Only owner can use this command
        if (senderId !== botOwner && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: "❌ Only the bot owner can use this command."
            }, { quoted: message });
            return;
        }

        let targetJid = null;
        
        // Method 1: If replying to a message, get sender JID
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.participant) {
            targetJid = quotedMsg.participant;
            console.log(`📌 Got JID from reply: ${targetJid}`);
        }
        
        // Method 2: If mentioning a user
        else if (quotedMsg && quotedMsg.mentionedJid && quotedMsg.mentionedJid.length > 0) {
            targetJid = quotedMsg.mentionedJid[0];
            console.log(`📌 Got JID from mention: ${targetJid}`);
        }
        
        // Method 3: If manually typing a JID or phone number
        else {
            const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            const args = userMessage.split(' ').slice(1);
            const q = args.join(' ');
            
            if (q && q.includes('@')) {
                // If it's a JID
                targetJid = q.replace(/[@\s]/g, '') + '@s.whatsapp.net';
                console.log(`📌 Got JID from input: ${targetJid}`);
            } else if (q && q.match(/[0-9]/g)) {
                // If it's a phone number
                let phoneNumber = q.replace(/[^0-9]/g, '');
                if (phoneNumber.length === 10) {
                    phoneNumber = '234' + phoneNumber;
                }
                targetJid = phoneNumber + '@s.whatsapp.net';
                console.log(`📌 Got JID from phone: ${targetJid}`);
            }
        }

        if (!targetJid) {
            await sock.sendMessage(chatId, {
                text: "❌ Please mention a user or reply to their message.\n\nExamples:\n.block (reply to a message)\n.block @username\n.block 2348155763709"
            }, { quoted: message });
            return;
        }

        // Prevent blocking the bot itself
        if (targetJid === botOwner) {
            await sock.sendMessage(chatId, {
                text: "❌ You cannot block the bot itself!"
            }, { quoted: message });
            return;
        }

        console.log(`🔒 Attempting to block: ${targetJid}`);

        try {
            await sock.updateBlockStatus(targetJid, "block");
            console.log(`✅ Blocked successfully: ${targetJid}`);
            
            await sock.sendMessage(chatId, {
                text: `✅ Successfully blocked @${targetJid.split("@")[0]}`,
                mentions: [targetJid]
            }, { quoted: message });
        } catch (error) {
            console.error("Block command error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to block the user."
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in block command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user.'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
