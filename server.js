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

// Function to create AbortController for timeout (for older Node.js versions)
function createTimeoutController(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  return { controller, timeoutId };
}

// Generic API endpoint that supports different parameters
app.get('/api/power', async (req, res) => {
  let timeoutId;
  
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
    
    // Create timeout controller
    const { controller, timeoutId: tid } = createTimeoutController(15000); // 15 second timeout
    timeoutId = tid;
    
    // Prepare fetch options
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Express-Energy-Proxy/1.0'
      },
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    
    // Clear timeout since request completed
    clearTimeout(timeoutId);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log(`Successfully fetched data for country: ${country}. Records: ${data.unix_seconds ? data.unix_seconds.length : 0}`);
    
    // Return the data to the client
    res.json(data);
    
  } catch (error) {
    // Clear timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.error('Error fetching power data:', error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      res.status(408).json({ 
        error: 'Request timeout',
        message: 'The API request took too long to respond. Please try again.'
      });
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Unable to reach the energy data API. Please try again later.'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch data',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Status endpoint for quick health check
app.get('/status', (req, res) => {
  res.json({ 
    status: 'Server is running',
    version: '1.1.0',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify the external API
app.get('/api/test', async (req, res) => {
  try {
    const testUrl = 'https://api.energy-charts.info/public_power?country=de';
    console.log(`Testing connection to: ${testUrl}`);
    
    const { controller, timeoutId } = createTimeoutController(10000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Express-Energy-Proxy/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    res.json({
      status: 'API connection test successful',
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    res.status(500).json({
      status: 'API connection test failed',
      error: error.message
    });
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Energy data available at http://localhost:${port}/api/power`);
  console.log(`Test API connection at http://localhost:${port}/api/test`);
  console.log(`Example: http://localhost:${port}/api/power?country=de&start=2024-01-01&end=2024-01-02`);
});