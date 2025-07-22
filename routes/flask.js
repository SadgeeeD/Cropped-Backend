const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const IDENTIFIERS_URL = process.env.FLASK_SERVER_URL || 'http://147.185.221.29:54592';

async function classifySpecies(base64Image) {
  try {
    const response = await fetch(`${IDENTIFIERS_URL}/predict/species`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Species prediction error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ classifySpecies error:', error.message);
    return { error: 'Could not get species prediction from Flask' };
  }
}

async function classifyHealth(base64Image) {
  try {
    const response = await fetch(`${IDENTIFIERS_URL}/predict/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Health prediction error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ classifyHealth error:', error.message);
    return { error: 'Could not get health prediction from Flask' };
  }
}

router.post('/classifySpecies', async (req, res) => {
  const { image } = req.body;
  const result = await classifySpecies(image);
  res.json(result);
});

router.post('/classifyHealth', async (req, res) => {
  const { image } = req.body;
  const result = await classifyHealth(image);
  res.json(result);
});


module.exports = router;
