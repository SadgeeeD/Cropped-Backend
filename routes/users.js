const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const bcrypt = require('bcrypt');

const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;
const SALT_ROUNDS = 10;

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

    const user = users.find(u => {
      const email = u.Email?.trim().toLowerCase();
      const username = u.Username?.trim().toLowerCase();
      return email === normalizedIdentifier || username === normalizedIdentifier;
    });

    if (!user) {
      console.warn("❌ [Login] No user found for identifier:", identifier);
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const hash = user.PasswordHash?.trim();

    const passwordMatch = await bcrypt.compare(password, hash);
    if (!passwordMatch) {
      console.warn("⚠️ [Login] Incorrect password");
      return res.status(401).json({ success: false, message: "Wrong password" });
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
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    const newUser = {
      Username: username,
      Email: email,
      PasswordHash: hash, // ✅ Hashed password
      Role: 'user',
    };

    const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/AddUser`;
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

// POST /api/changePassword
router.post('/changePassword', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/GetAllUsers`;
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const users = response.data;
    const user = users.find(u => u.Email.trim().toLowerCase() === email.trim().toLowerCase());

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.PasswordHash?.trim());
    if (!match) return res.status(403).json({ success: false, message: 'Incorrect current password' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const updateUrl = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/UpdatePassword`; // Adjust based on your backend
    await axios.post(updateUrl, { Email: email, PasswordHash: newHash }, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[changePassword] Error:', err.message);
    res.status(500).json({ success: false, message: 'Password update failed' });
  }
});

module.exports = router;