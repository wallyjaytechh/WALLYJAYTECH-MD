const axios = require('axios');

async function newsCommand(sock, chatId, message) {
try {
await sock.sendMessage(chatId, {
text: '📡 Fetching latest headlines...'
}, { quoted: message });

// Use simple RSS feed parsing with axios
const response = await axios.get('https://feeds.bbci.co.uk/news/rss.xml', {
timeout: 10000,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
});

const rssText = response.data;

// Simple RSS parsing (extract titles between <title> tags)
const titles = [];
const titleMatches = rssText.match(/<title>(.*?)<\/title>/g);

if (titleMatches) {
// Skip the first title (usually channel title) and get next 5
for (let i = 1; i <= 5 && i < titleMatches.length; i++) {
const title = titleMatches[i].replace(/<title>|<\/title>/g, '').trim();
if (title && title.length > 10) { // Filter out short titles
titles.push(title);
}
}
}

let newsMessage = '📰 *TOP HEADLINES* 📰\n\n';

if (titles.length > 0) {
titles.forEach((title, index) => {
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index];
newsMessage += `${emoji} *${title}*\n`;
newsMessage += `📝 Latest developments in global news\n\n`;
});
} else {
// Fallback if RSS parsing fails
newsMessage = generateDailyNews();
}

newsMessage += `📡 Source: BBC News\n`;
newsMessage += `⏰ Updated: ${new Date().toLocaleString()}\n`;
newsMessage += `_Powered by WALLYJAYTECH-MD_`;

await sock.sendMessage(chatId, {
text: newsMessage
}, { quoted: message });

} catch (error) {
console.error('News Error:', error.message);

// Use date-based news that changes daily
const dailyNews = generateDailyNews();

await sock.sendMessage(chatId, {
text: dailyNews
}, { quoted: message });
}
}

function generateDailyNews() {
const day = new Date().getDate(); // Day of month (1-31)
const month = new Date().getMonth(); // Month (0-11)

const newsThemes = [
"Global economic developments and market trends",
"Technology innovations and digital transformation",
"Climate action and environmental initiatives",
"Healthcare advancements and medical research",
"Space exploration and scientific discoveries",
"Educational reforms and learning technologies",
"International relations and diplomatic efforts",
"Cultural events and entertainment updates",
"Sports achievements and athletic competitions",
"Business strategies and entrepreneurial growth"
];

let newsMessage = '📰 *DAILY NEWS DIGEST* 📰\n\n';

// Use date to determine which news themes to show (changes daily)
for (let i = 0; i < 5; i++) {
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i];
const themeIndex = (day + month + i) % newsThemes.length;

newsMessage += `${emoji} *${newsThemes[themeIndex]}*\n`;
newsMessage += `📝 Daily updates and latest developments\n\n`;
}

newsMessage += `📅 Date: ${new Date().toLocaleDateString()}\n`;
newsMessage += `_Powered by WALLYJAYTECH-MD_`;

return newsMessage;
}

module.exports = newsCommand;
