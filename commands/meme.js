const axios = require('axios');

async function memeCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        console.log('🔄 Fetching meme from meme-api.com...');

        // Fetch random meme from the API (including NSFW)
        const response = await axios.get('https://meme-api.com/gimme', { 
            timeout: 15000 
        });

        const memeData = response.data;

        // Check if we got valid data
        if (!memeData || !memeData.url) {
            throw new Error('Invalid response from meme API');
        }

        console.log(`✅ Meme fetched from r/${memeData.subreddit} | NSFW: ${memeData.nsfw}`);

        // Create caption with meme information (include NSFW warning if applicable)
        let caption = `*${memeData.title}*\n\n` +
                     `📚 *Subreddit:* r/${memeData.subreddit}\n` +
                     `👤 *Author:* u/${memeData.author}\n` +
                     `⭐ *Upvotes:* ${memeData.ups?.toLocaleString() || 'N/A'}\n`;

        // Add NSFW warning if the meme is NSFW
        if (memeData.nsfw) {
            caption += `🚨 *NSFW Content*\n`;
        }

        caption += `\n*© Powered by meme-api.com*`;

        // Send the meme image with caption
        await sock.sendMessage(chatId, {
            image: { url: memeData.url },
            caption: caption,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Error in meme command:', error);
        
        let errorMessage = '*❌ Failed to fetch meme!*';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = '*❌ Timeout! Meme API is taking too long.*';
        } else if (error.response?.status === 429) {
            errorMessage = '*❌ Too many requests! Please try again later.*';
        }

        await sock.sendMessage(chatId, {
            text: errorMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Function to get memes from specific NSFW subreddits
async function nsfwMemeCommand(sock, chatId, message, subreddit = '') {
    try {
        await sock.sendPresenceUpdate('composing', chatId);

        // Popular NSFW meme subreddits
        const nsfwSubreddits = [
            'nsfwmemes',
            'dankmemes', // sometimes has NSFW
            'edgymemes',
            'darkmemes',
            'offensivememes'
        ];

        const targetSubreddit = subreddit || nsfwSubreddits[Math.floor(Math.random() * nsfwSubreddits.length)];
        const apiUrl = `https://meme-api.com/gimme/${targetSubreddit}`;

        console.log(`🔄 Fetching NSFW meme from r/${targetSubreddit}...`);

        const response = await axios.get(apiUrl, { timeout: 15000 });
        const memeData = response.data;

        if (!memeData || !memeData.url) {
            throw new Error('Invalid response from meme API');
        }

        const caption = `*${memeData.title}*\n\n` +
                       `📚 *Subreddit:* r/${memeData.subreddit}\n` +
                       `👤 *Author:* u/${memeData.author}\n` +
                       `⭐ *Upvotes:* ${memeData.ups?.toLocaleString() || 'N/A'}\n` +
                       `🚨 *NSFW Content*\n\n` +
                       `*© Powered by WALLYJAYTECH-MD*`;

        await sock.sendMessage(chatId, {
            image: { url: memeData.url },
            caption: caption,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('NSFW meme error:', error);
        await sock.sendMessage(chatId, {
            text: '*❌ Failed to fetch NSFW meme! Try .meme for regular memes.*'
        }, { quoted: message });
    }
}

module.exports = memeCommand;
module.exports.nsfwMemeCommand = nsfwMemeCommand;
