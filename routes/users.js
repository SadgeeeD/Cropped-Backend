const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;

// POST /api/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log(`🔐 [Login] Incoming login for: ${identifier}`);

  try {
    const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/GetAllUsers`;
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const users = response.data;
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = users.find(u => {
      const email = u.Email?.trim().toLowerCase();
      const username = u.Username?.trim().toLowerCase();
      const pwd = u.PasswordHash?.trim();

      return (
        (email === normalizedIdentifier || username === normalizedIdentifier) &&
        pwd === normalizedPassword
      );
    });

    if (!user) {
      const foundIdentifier = users.find(u => {
        const email = u.Email?.trim().toLowerCase();
        const username = u.Username?.trim().toLowerCase();
        return email === normalizedIdentifier || username === normalizedIdentifier;
      });

      if (foundIdentifier) {
        console.warn("⚠️ [Login] Identifier matched but password wrong");
        return res.status(401).json({ success: false, message: "Wrong password" });
      } else {
        console.warn("❌ [Login] No user found for identifier:", identifier);
        return res.status(401).json({ success: false, message: "User not found" });
      }
    }

    console.log(`✅ [Login] Authenticated: ${user.Username}`);
    res.json({
      success: true,
      user: { username: user.Username, email: user.Email, role: user.Role },
    });
  } catch (err) {
    console.error("❌ [Login] Backend error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



// POST /api/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!EXTERNAL_SENSOR_API_BASE_URL) {
    return res.status(500).json({ message: 'API base URL not configured' });
  }

  try {
    const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/AddUser`;
    const newUser = {
      Username: username,
      Email: email,
      PasswordHash: password, // ⚠️ Reminder: this is plain text
      Role: 'user',
    };

    const response = await axios.post(url, newUser, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    console.log("✅ User registered:", username);
    res.json({ success: true, message: 'User registered', data: response.data });
  } catch (err) {
    console.error('[register] Error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

module.exports = router;
