 async function shipCommand(sock, chatId, msg, groupMetadata) {
    try {
        // Get all participants from the group
        const participants = await sock.groupMetadata(chatId);
        const ps = participants.participants.map(v => v.id);
        
        // Get two random participants
        let firstUser, secondUser;
        
        // Select first random user
        firstUser = ps[Math.floor(Math.random() * ps.length)];
        
        // Select second random user (different from first)
        do {
            secondUser = ps[Math.floor(Math.random() * ps.length)];
        } while (secondUser === firstUser);

        // Format the mentions
        const formatMention = id => '@' + id.split('@')[0];

        // Create and send the ship message
        await sock.sendMessage(chatId, {
            text: `${formatMention(firstUser)} *Wed❤️* ${formatMention(secondUser)}\n\n*😁Happy married life Congratulations 💖🍻*\n\n*😁If you both are men then happy gay life😁*\n\n*😁If you both are women then happy lesbian marriage😁*\n\n*🥵And luckily if you both are man and woman then enjoy your honeymoon🥵*\n\n*🟡 Copyright wallyjaytech 2025 🟡*`,
            mentions: [firstUser, secondUser]
        });

    } catch (error) {
        console.error('Error in ship command:', error);
        await sock.sendMessage(chatId, { text: '*❌ Failed to ship! Make sure this is a group.*' });
    }
}

module.exports = shipCommand; 
