const pool = require('../db/connection');

exports.getLatestRelease = async (req, res) => {
console.log ("Getting Release Data")
  try {
    const result = await pool.query(
      "SELECT version, release_date, release_notes_url, contact_email FROM app_releases ORDER BY release_date DESC LIMIT 1"
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching release info:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
