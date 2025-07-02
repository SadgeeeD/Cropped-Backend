const express = require("express");
const axios = require("axios");
const https = require("https");
const router = express.Router();

const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;

if (!EXTERNAL_SENSOR_API_BASE_URL) {
  console.error("❌ EXTERNAL_SENSOR_API_BASE_URL is not defined in .env");
}

router.post("/", async (req, res) => {
  let readings = req.body;

  // 🔍 Log raw payload directly
  console.log("📦 Raw body received from frontend:");
  console.dir(readings, { depth: null });

  // Normalize to array
  if (!Array.isArray(readings)) {
    readings = [readings];
  }

  // Validate structure
  const validReadings = readings.filter(
    (r) =>
      r &&
      typeof r.SensorId !== "undefined" &&
      typeof r.Value !== "undefined" &&
      typeof r.Unit !== "undefined" &&
      typeof r.Timestamp !== "undefined"
  );

  if (validReadings.length === 0) {
    return res.status(400).json({ error: "No valid readings received." });
  }

  console.log("📥 Valid readings to forward:");
  console.table(
    validReadings.map((r) => ({
      SensorId: r.SensorId,
      Value: r.Value,
      Unit: r.Unit,
      Timestamp: r.Timestamp,
    }))
  );

  try {
    for (const reading of validReadings) {
      await axios.post(
        `${EXTERNAL_SENSOR_API_BASE_URL}/SensorReadings/AddSensorReading`,
        reading,
        { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
      );
    }

    console.log(`✅ Successfully forwarded ${validReadings.length} reading(s).`);
    res.status(200).json({ message: "Reading(s) forwarded", count: validReadings.length });
  } catch (err) {
    console.error("❌ Forwarding failed:", err.message);
    res.status(500).json({ error: "Failed to forward to external API" });
  }
});

module.exports = router;
