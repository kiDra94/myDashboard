const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // <-- Only needed for Node <18
const app = express();
const port = 3000;

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
  next();
});

// Fetch external API and return data to frontend
app.get('/api/power', async (req, res) => {
  const url = 'https://api.energy-charts.info/public_power?country=de&start=1735689600&end=1735711200';

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data); // Return API data to client
  } catch (error) {
    console.error('Error fetching power data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
