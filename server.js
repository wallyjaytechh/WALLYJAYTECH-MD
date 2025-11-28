const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'Bot is running!',
    bot: 'WALLYJAYTECH-MD',
    author: 'wallyjaytech',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Keep-alive server running on port ${PORT}`);
});

// Import your main bot (this starts your WhatsApp bot)
require('./index.js');
