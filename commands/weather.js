const axios = require("axios");

function getWeatherEmoji(weather) {
    const map = {
        Thunderstorm: "⛈️",
        Drizzle: "🌦️",
        Rain: "🌧️",
        Snow: "❄️",
        Mist: "🌫️",
        Smoke: "💨",
        Haze: "🌫️",
        Dust: "🌪️",
        Fog: "🌫️",
        Sand: "🏜️",
        Ash: "🌋",
        Squall: "💨",
        Tornado: "🌪️",
        Clear: "☀️",
        Clouds: "☁️"
    };
    return map[weather] || "🌍";
}

module.exports = async function weatherCommand(sock, chatId, city) {
    try {
        const apiUrl = `https://apis.davidcyriltech.my.id/weather?city=${encodeURIComponent(city)}`;
        const response = await axios.get(apiUrl);
        const w = response.data;

        if (!w.success || !w.data) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Could not find weather for that location.", 
                quoted: message 
            });
        }

        const d = w.data;
        const emoji = getWeatherEmoji(d.weather);

        const weatherText = `
🌍 *Weather for ${d.location}, ${d.country}*  
${emoji} ${d.description}

🌡️ Temperature: *${d.temperature}* (feels like ${d.feels_like})  
💧 Humidity: ${d.humidity}  
🌬️ Wind: ${d.wind_speed}  
📊 Pressure: ${d.pressure}  

📍 Coordinates: [${d.coordinates.latitude}, ${d.coordinates.longitude}]
        `.trim();

        await sock.sendMessage(chatId, { text: weatherText });

    } catch (error) {
        console.error("Error fetching weather:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Sorry, I could not fetch the weather right now.", 
            quoted: message 
        });
    }
};
