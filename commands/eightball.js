async function eightBallCommand(sock, chatId, question) {
    try {
        if (!question) {
            return await sock.sendMessage(chatId, { 
                text: '🎱 *Please ask a question!*\nUsage: .8ball <question>\nExample: .8ball Will I be rich tomorrow?' 
            });
        }

        const responses = [
            "*🟢 It is certain.*",
            "*🟢 Yes definitely.*", 
            "*🟢 Most likely.*",
            "*🟡 Ask again later.*",
            "*🟡 Cannot predict now.*",
            "*🔴 My reply is no.*",
            "*🔴 Very doubtful.*",
            "*🇳🇬 E go better!*",
            "*🇳🇬 No shaking!*",
            "*🟡 Lord lamba.*",
            "*🔴 Mule.*",
            "*🔴 Maybe.*",
            "*🇳🇬 As how naw!*",
            "*🇳🇬 Dunno!*",            
            "*🇳🇬 Na wa o!*"
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        await sock.sendMessage(chatId, { 
            text: `🎱 *8-BALL SAYS:*\n\n*Q: ${question}*\n*A:* ${answer}\n\n*Powered by WALLYJAYTECH-MD*` 
        });

    } catch (error) {
        console.error('8Ball Error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Magic ball unavailable!*' 
        });
    }
}

module.exports = { eightBallCommand };
