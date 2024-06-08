const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const testServerUrl = 'http://20.244.56.144/test';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3ODM0MDA0LCJpYXQiOjE3MTc4MzM3MDQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkwYjIxMzY5LWM0ZTktNDUxNC1iNzRmLWYwODJlZjk1MzBlZiIsInN1YiI6InNpbXJhbnlhZGF2NDY0QGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IkFqYXkgS3VtYXIgR2FyZyBFbmdpbmVlcmluZyBDb2xsZWdlIiwiY2xpZW50SUQiOiI5MGIyMTM2OS1jNGU5LTQ1MTQtYjc0Zi1mMDgyZWY5NTMwZWYiLCJjbGllbnRTZWNyZXQiOiJuTEdWTXFpeWpIaXdwTWZoIiwib3duZXJOYW1lIjoiU2ltcmFuIFlhZGF2Iiwib3duZXJFbWFpbCI6InNpbXJhbnlhZGF2NDY0QGdtYWlsLmNvbSIsInJvbGxObyI6IjIxMDAyNzAzMTAxNDUifQ.k_feCzN60iJ51YRVqQBNwBtXTGf-VeFo778YIWQx7uc'
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
    
    console.log(`Received numbers: ${JSON.stringify(fetchedNumbers)}`);

    if (!Array.isArray(fetchedNumbers)) {
      return res.status(500).json({ error: 'Invalid response from test server' });
    }

    const uniqueNumbers = Array.from(new Set(fetchedNumbers));

    // Calculate previous window and current window if necessary
    // Use uniqueNumbers directly if it represents the current window

    const average = uniqueNumbers.reduce((acc, num) => acc + num, 0) / uniqueNumbers.length;

    res.json({
      numbers: uniqueNumbers,
      windowPrevState: [], // Replace with your actual previous state data
      windowCurrState: uniqueNumbers, // Assuming uniqueNumbers represent the current window
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
