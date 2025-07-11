const pool = require('../db/connection'); // Assuming your DB pool is exported here

exports.addProduct = async (req, res) => {
  console.log("🚀 Hit /api/products/add");
  console.log("🧾 Incoming Body:", req.body);
  const {
    name,
    material,
    base_material,
    production_method,
    time_minutes,
    cost,
    notes,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products
        (name, material, base_material, production_method, time_minutes, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, material, base_material, production_method, time_minutes, cost, notes]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ DB Insert Error:', err);
        res.status(500).json({ error: 'Database insert failed' });
    }
};

exports.searchProducts = async (req, res) => {
  const { query } = req.query; // e.g. /search?query=wood

  try {
    let result;

    if (!query || query.trim() === "") {
      // 🔍 Show all records if query is empty
      result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    } else {
      // 🔍 Basic search across name, material, notes
      result = await pool.query(
        `SELECT * FROM products
         WHERE LOWER(name) LIKE LOWER($1)
            OR LOWER(material) LIKE LOWER($1)
            OR LOWER(notes) LIKE LOWER($1)
         ORDER BY id DESC`,
        [`%${query}%`]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

