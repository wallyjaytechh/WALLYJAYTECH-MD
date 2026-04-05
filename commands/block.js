/**
 * WALLYJAYTECH-MD - Block Command (Working with LID)
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
            
            if (phoneNumber.length === 10) {
                phoneNumber = '234' + phoneNumber;
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
        if (targetJid === botJid || targetJid.includes(sock.user.id.split(':')[0])) {
            return await sock.sendMessage(chatId, {
                text: '❌ You cannot block the bot itself!'
            }, { quoted: message });
        }

        console.log(`🔍 Attempting to block: ${targetJid}`);
        
        // Extract phone number from LID (LIDs often contain the phone number)
        let phoneNumber = targetNumber;
        let cleanJid = targetJid;
        
        // If it's a LID, try to extract phone number from it
        if (targetJid.includes('@lid')) {
            const lidNumber = targetJid.split('@')[0];
            console.log(`🔄 LID detected: ${lidNumber}`);
            
            // Try to extract phone number from LID (remove country code logic)
            // LIDs often start with the phone number
            if (lidNumber.length >= 10) {
                // Try different length country codes
                for (let len of [3, 2, 1]) {
                    const possibleCode = lidNumber.substring(0, len);
                    if (['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998'].includes(possibleCode)) {
                        phoneNumber = lidNumber;
                        cleanJid = phoneNumber + '@s.whatsapp.net';
                        console.log(`✅ Extracted phone from LID: ${phoneNumber}`);
                        break;
                    }
                }
            }
        }
        
        // Try to block using the phone number JID
        if (cleanJid && !cleanJid.includes('@lid')) {
            console.log(`🔒 Attempting to block: ${cleanJid}`);
            
            try {
                await sock.updateBlockStatus(cleanJid, 'block');
                console.log(`✅ Blocked successfully: ${cleanJid}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.\n📱: ${phoneNumber || cleanJid.split('@')[0]}`
                }, { quoted: message });
                return;
            } catch (err) {
                console.log(`⚠️ Block failed: ${err.message}`);
            }
        }
        
        // Alternative: Try using the query method with phone number
        if (phoneNumber) {
            try {
                await sock.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'block'
                    },
                    content: [
                        {
                            tag: 'block',
                            attrs: {
                                jid: phoneNumber + '@s.whatsapp.net'
                            }
                        }
                    ]
                });
                console.log(`✅ Blocked via query: ${phoneNumber}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.\n📱: ${phoneNumber}`
                }, { quoted: message });
                return;
            } catch (err) {
                console.log(`⚠️ Query block failed: ${err.message}`);
            }
        }
        
        throw new Error('Could not block user');
        
    } catch (error) {
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user.\n\nTry using the phone number directly:\n.block 234XXXXXXXXX'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
