const express = require('express');
const cors = require('cors');

// Handle fetch API based on Node.js version
let fetch;
if (parseInt(process.versions.node) < 18) {
  // For Node.js versions less than 18
  fetch = require('node-fetch');
} else {
  // For Node.js 18+ which has native fetch
  fetch = global.fetch;
}

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins - adjust this in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the current directory
app.use(express.static('./'));

// Add necessary headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Validate country code
function isValidCountry(country) {
  // List of valid country codes (expand as needed)
  const validCountries = ['de', 'fr', 'uk', 'es', 'it', 'nl', 'be', 'at', 'ch', 'dk', 'se', 'no', 'fi', 'pt', 'gr', 'ie'];
  return validCountries.includes(country.toLowerCase());
}

// Generic API endpoint that supports different parameters
app.get('/api/power', async (req, res) => {
  try {
    // Get parameters from query string
    const country = req.query.country || 'de'; // Default to Germany if not specified
    const resolution = req.query.resolution || 'hourly'; // Optional resolution parameter
    const start = req.query.start || ''; // Optional start date
    const end = req.query.end || ''; // Optional end date
    
    // Basic validation
    if (!isValidCountry(country)) {
      return res.status(400).json({ 
        error: 'Invalid country code',
        message: 'Please provide a valid country code (e.g., de, fr, uk)'
      });
    }
    
    // Build the URL with query parameters
    let url = `https://api.energy-charts.info/public_power?country=${country.toLowerCase()}`;
    
    // Add optional parameters if provided
    if (resolution) url += `&resolution=${resolution}`;
    if (start) url += `&start=${start}`;
    if (end) url += `&end=${end}`;
    
    console.log(`Fetching data from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Express-Energy-Proxy/1.0'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log(`Successfully fetched data for country: ${country}`);
    
    // Return the data to the client
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching power data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add endpoint for awattar market data proxy
app.get('/api/marketdata', async (req, res) => {
  try {
    const response = await fetch('https://api.awattar.at/v1/marketdata', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Express-Energy-Proxy/1.0'
      },
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market data',
      message: error.message
    });
  }
});

// Add endpoint to get available countries (this is just an example)
app.get('/api/countries', (req, res) => {
  res.json({
    countries: [
      { code: 'de', name: 'Germany' },
      { code: 'fr', name: 'France' },
      { code: 'uk', name: 'United Kingdom' },
      { code: 'es', name: 'Spain' },
      { code: 'it', name: 'Italy' },
      // Add more countries as needed
    ]
  });
});

// Status endpoint for quick health check
app.get('/status', (req, res) => {
  res.json({ 
    status: 'Server is running',
    version: '1.1.0',
    nodeVersion: process.version
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Energy data available at http://localhost:${port}/api/power`);
  console.log(`Example: http://localhost:${port}/api/power?country=de`);
});