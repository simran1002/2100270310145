require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 5000;
const WINDOW_SIZE = 10;
const TEST_URL = process.env.TEST_URL;

mongoose.connect('mongodb://localhost:27017/average_calculator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const numberSchema = new mongoose.Schema({
  value: { type: Number, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const NumberModel = mongoose.model('Number', numberSchema);

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

  const url = `${TEST_URL}/${urlMap[numberid]}`;

  try {
    const response = await axios.get(url, { timeout: 500 });
    const fetchedNumbers = response.data.numbers;

    if (!Array.isArray(fetchedNumbers)) {
      return res.status(500).json({ error: 'Invalid response from test server' });
    }

    const uniqueNumbers = Array.from(new Set(fetchedNumbers));

    const previousState = await NumberModel.find().sort({ createdAt: 1 }).limit(WINDOW_SIZE);
    const previousValues = previousState.map(num => num.value);
    const previousWindow = [...previousValues];

    for (let number of uniqueNumbers) {
      if (previousValues.includes(number)) continue;

      const numberDoc = new NumberModel({ value: number });
      await numberDoc.save();

      previousValues.push(number);
      if (previousValues.length > WINDOW_SIZE) {
        const oldest = previousValues.shift();
        await NumberModel.deleteOne({ value: oldest });
      }
    }

    const currentWindow = [...previousValues];
    const average = currentWindow.reduce((acc, num) => acc + num, 0) / currentWindow.length;

    res.json({
      numbers: uniqueNumbers,
      windowPrevState: previousWindow,
      windowCurrState: currentWindow,
      avg: parseFloat(average.toFixed(2)),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching numbers from test server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
