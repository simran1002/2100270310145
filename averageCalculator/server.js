require("dotenv").config();

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const testServerUrl = process.env.TEST_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  const urlMap = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand',
  };

  if (!urlMap[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const url = `${testServerUrl}/${urlMap[numberid]}`;
  
  console.log(`Fetching numbers from URL: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });

    const fetchedNumbers = response.data.numbers;
    
    console.log(`Received numbers: ${fetchedNumbers.join(', ')}`);

    if (!Array.isArray(fetchedNumbers)) {
      return res.status(500).json({ error: 'Invalid response from test server' });
    }

    const uniqueNumbers = Array.from(new Set(fetchedNumbers));

    const average = uniqueNumbers.reduce((acc, num) => acc + num, 0) / uniqueNumbers.length;

    res.json({
      numbers: uniqueNumbers,
      windowPrevState: [], 
      windowCurrState: uniqueNumbers, 
      avg: parseFloat(average.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching numbers from test server:', error.message);
    return res.status(500).json({ error: 'Error fetching numbers from test server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
