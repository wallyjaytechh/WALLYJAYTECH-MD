const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'Bot is running!',
    bot: 'WALLYJAYTECH-MD',
    author: 'wallyjaytech',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    platform: process.env.RENDER ? 'Render' : (process.env.REPL_SLUG ? 'Replit' : 'Unknown')
  });
});

// Health check endpoint for both Render and UptimeRobot
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    bot: 'WALLYJAYTECH-MD',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Universal listener - works on both platforms
const server = app.listen(PORT, () => {
  console.log(`🟢 Keep-alive server running on port ${PORT}`);
  
  // Show appropriate URL based on platform
  if (process.env.RENDER) {
    console.log(`🌐 Render URL: https://your-app-name.onrender.com`);
  } else if (process.env.REPL_SLUG) {
    console.log(`🌐 Replit URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
});

// Import your main bot
require('./index.js');
