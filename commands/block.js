/**
 * WALLYJAYTECH-MD - Block Command (Fixes LID to Phone Number)
 */

async function blockCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const isGroup = chatId.endsWith('@g.us');
        
        let targetJid = null;
        let targetNumber = null;

        // If in DM and no arguments, block the current chat user
        if (!isGroup && args.length === 0) {
            targetJid = chatId;
        }
        // Check for mentions in groups
        else if (isGroup) {
            const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJids.length > 0) {
                targetJid = mentionedJids[0];
            }
        }
        // Check if replying to a message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for phone number argument
        else if (args.length > 0) {
            let phoneNumber = args[0].replace(/[^0-9]/g, '');
            
            // Add country code if missing (assuming 234 as default)
            if (phoneNumber.length === 10) {
                phoneNumber = '234' + phoneNumber.substring(1);
            }
            
            if (phoneNumber.length >= 10) {
                targetNumber = phoneNumber;
                targetJid = phoneNumber + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to block.\n\nExamples:\n.block (in DM to block that user)\n.block @username (mention in group)\n.block 2348155763709 (phone number)\nReply to a message with .block'
            }, { quoted: message });
        }

        // Prevent blocking the bot itself
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetJid === botJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ You cannot block the bot itself!'
            }, { quoted: message });
        }

        console.log(`🔍 Attempting to block: ${targetJid}`);
        
        // STEP 1: Get the real phone number (resolve from LID if needed)
        let realPhoneNumber = targetNumber;
        let realJid = targetJid;
        
        // If it's a LID, try to get the real phone number
        if (targetJid.includes('@lid')) {
            console.log(`🔄 LID detected, trying to resolve to phone number...`);
            
            try {
                // Try to get contact info
                const contact = await sock.getContact(targetJid);
                console.log(`📞 Contact info:`, JSON.stringify(contact, null, 2));
                
                if (contact && contact.phoneNumber) {
                    realPhoneNumber = contact.phoneNumber;
                    realJid = realPhoneNumber + '@s.whatsapp.net';
                    console.log(`✅ Resolved LID to phone: ${realPhoneNumber}`);
                } else if (contact && contact.id && !contact.id.includes('@lid')) {
                    realJid = contact.id;
                    realPhoneNumber = realJid.split('@')[0];
                    console.log(`✅ Resolved LID to JID: ${realJid}`);
                }
            } catch (err) {
                console.log(`⚠️ Could not resolve contact: ${err.message}`);
            }
        }
        
        // STEP 2: Try to block using the real phone number JID
        if (realJid && !realJid.includes('@lid')) {
            console.log(`🔒 Attempting to block real JID: ${realJid}`);
            
            try {
                await sock.updateBlockStatus(realJid, 'block');
                console.log(`✅ Blocked successfully: ${realJid}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.\n📱: ${realPhoneNumber || realJid}`
                }, { quoted: message });
                return;
            } catch (err) {
                console.log(`⚠️ Block failed with real JID: ${err.message}`);
            }
        }
        
        // STEP 3: Try using the onWhatsApp method to get JID
        try {
            if (realPhoneNumber) {
                const [result] = await sock.onWhatsApp(realPhoneNumber);
                if (result && result.jid) {
                    console.log(`📱 Found WhatsApp JID: ${result.jid}`);
                    await sock.updateBlockStatus(result.jid, 'block');
                    console.log(`✅ Blocked via onWhatsApp: ${result.jid}`);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ Successfully blocked user.\n📱: ${realPhoneNumber}`
                    }, { quoted: message });
                    return;
                }
            }
        } catch (err) {
            console.log(`⚠️ onWhatsApp failed: ${err.message}`);
        }
        
        // STEP 4: Last resort - try to send a message first to get real JID
        try {
            if (realPhoneNumber) {
                const testJid = realPhoneNumber + '@s.whatsapp.net';
                await sock.presenceSubscribe(testJid);
                await new Promise(r => setTimeout(r, 500));
                await sock.updateBlockStatus(testJid, 'block');
                console.log(`✅ Blocked after presence subscribe: ${testJid}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.\n📱: ${realPhoneNumber}`
                }, { quoted: message });
                return;
            }
        } catch (err) {
            console.log(`⚠️ Final attempt failed: ${err.message}`);
        }
        
        throw new Error('Could not resolve LID to a valid phone number for blocking');
        
    } catch (error) {
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user.\n\nPossible reasons:\n• User has privacy settings enabled\n• Cannot resolve LID to phone number\n• Try using .block with their phone number directly'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
