 const compliments = [
    "You're amazing just the way you are!",
    "You're really something special.",
    "You're even better than a unicorn because you're real.",
    "There's ordinary, and then there's you.",
    "If you were a scented candle, you'd be the rare one that actually smells like what it's supposed to.",
    "In high school, I bet you were voted Best, period.",
    "Time spent with you is always worth it.",
    "Whoever raised you deserves a medal for a job well done.",
    "You're one of a kind.",
    "You're wonderful.",
    "You are an incredible human.",
    "Everything would be better if more people were like you.",
    "You've got all the right moves.",
    "On a scale from 1 to 10, you're an 11.",
    "You are enough.",
    "You are perfect just the way you are.",
    "You have such a great personality.",
    "You have such a great sense of style.",
    "Actions speak louder than words, and yours tell an incredible story",
    "Hipsters are probably jealous of how cool you are.",
    "Colors seem brighter when you're around.",
    "If you were a cartoon character, you'd be the one that gets bluebirds",
    "I bet you can make even the crankiest babies smile.",
    "You're the only person who can always make me laugh.",
    "You have a great sense of humor!",
    "You're incredibly thoughtful and kind.",
    "You are more powerful than you know.",
    "You light up the room!",
    "You're a true friend.",
    "You inspire me!",
    "Your creativity knows no bounds!",
    "You have a heart of gold.",
    "You make a difference in the world.",
    "Your positivity is contagious!",
    "You have an incredible work ethic.",
    "You bring out the best in people.",
    "Your smile brightens everyone's day.",
    "You're so talented in everything you do.",
    "Your kindness makes the world a better place.",
    "You have a unique and wonderful perspective.",
    "Your enthusiasm is truly inspiring!",
    "You are capable of achieving great things.",
    "You always know how to make someone feel special.",
    "Your confidence is admirable",
    "You have a beautiful soul.",
    "Your generosity knows no limits.",
    "You have a great eye for detail.",
    "Your passion is truly motivating!",
    "You are an amazing listener.",
    "You're stronger than you think!",
    "Your laughter is infectious.",
    "You have a natural gift for making others feel valued.",
    "You make the world a better place just by being in it."
];

async function complimentCommand(sock, chatId, message) {
    try {
        if (!message || !chatId) {
            console.log('Invalid message or chatId:', { message, chatId });
            return;
        }

        let userToCompliment;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToCompliment) {
            await sock.sendMessage(chatId, { 
                text: '*🔹Please mention someone or reply to their message to compliment them!🔹*'
            });
            return;
        }

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.sendMessage(chatId, { 
            text: `*👋Hey @${userToCompliment.split('@')[0]}, ${compliment}😍*`,
            mentions: [userToCompliment]
        });
    } catch (error) {
        console.error('Error in compliment command:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: '*🔹Please try again in a few seconds🔹.*'
                });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: '*🔹An error occurred while sending the compliment🔹.*'
                });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

module.exports = { complimentCommand };
