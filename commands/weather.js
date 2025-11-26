 const axios = require('axios');

async function weatherCommand(sock, chatId, message, city) {
try {
if (!city) {
return await sock.sendMessage(chatId, {
text: `🌤️ *Weather Command*\n\n❌ *Please specify a city!*\n\n*Usage:* .weather <city>\n*Examples:*\n.weather Lagos\n.weather London\n.weather New York\n\n_Powered by WALLYJAYTECH-MD_`
}, { quoted: message });
}

await sock.sendMessage(chatId, {
text: `🌤️ *Fetching weather for ${city}...*`
}, { quoted: message });

// Try multiple weather APIs
const weatherData = await getWeatherFromMultipleSources(city);

if (!weatherData) {
throw new Error('No weather data available');
}

const weatherMessage = `🌤️ *WEATHER REPORT*

📍 *Location:* ${weatherData.city}
🌡️ *Temperature:* ${weatherData.temp}°C
💧 *Humidity:* ${weatherData.humidity}%
💨 *Wind:* ${weatherData.wind} km/h
☁️ *Condition:* ${weatherData.description}
🌅 *Time:* ${new Date().toLocaleTimeString()}

_Powered by WALLYJAYTECH-MD_`;

await sock.sendMessage(chatId, {
text: weatherMessage
}, { quoted: message });

} catch (error) {
console.error('Weather Error:', error.message);
await sock.sendMessage(chatId, {
text: `❌ *Weather service temporary unavailable*\n\n🔍 *You searched:* "${city}"\n\n💡 *Working examples:*\n.weather lagos\n.weather london\n.weather tokyo\n\n_Powered by WALLYJAYTECH-MD_`
}, { quoted: message });
}
}

async function getWeatherFromMultipleSources(city) {
const apis = [
// API 1: Free weather API
{
url: `https://api.weatherapi.com/v1/current.json?key=85faf717d0545d14074659ad&q=${encodeURIComponent(city)}`,
extract: (data) => ({
city: data.location?.name || city,
temp: data.current?.temp_c || 'N/A',
humidity: data.current?.humidity || 'N/A',
wind: data.current?.wind_kph || 'N/A',
description: data.current?.condition?.text || 'Unknown'
})
},
// API 2: Alternative weather service
{
url: `https://goweather.herokuapp.com/weather/${encodeURIComponent(city)}`,
extract: (data) => ({
city: city,
temp: data.temperature || 'N/A',
humidity: 'N/A',
wind: data.wind || 'N/A',
description: data.description || 'Unknown'
})
}
];

for (const api of apis) {
try {
console.log(`Trying weather API: ${api.url}`);
const response = await axios.get(api.url, { timeout: 60000 });

if (response.data) {
const weatherData = api.extract(response.data);
// Check if we got valid data
if (weatherData.temp !== 'N/A') {
console.log('✅ Weather data found!');
return weatherData;
}
}
} catch (error) {
console.log(`Weather API failed: ${error.message}`);
continue;
}
}

return null;
}

module.exports = weatherCommand;
