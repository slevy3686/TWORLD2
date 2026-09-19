const express = require("express");
const router = express.Router();

// POST /api/insert/building
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let { campus_name, building_name, building_status } = req.body;
    if (!campus_name || !building_name) {
      throw new Error("campus_name and building_name are required");
    }
    campus_name = campus_name.trim();
    building_name = building_name.trim();
    building_status = (building_status || "AVAILABLE").toUpperCase();

    const [campusRows] = await connection.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name]
    );

    if (campusRows.length === 0) {
      throw new Error(`Campus not found: ${campus_name}`);
    }

    const campus_ID = campusRows[0].campus_ID;

    const [result] = await connection.execute(
      "INSERT INTO building (campus_ID, building_name, building_status) VALUES (?, ?, ?)",
      [campus_ID, building_name, building_status]
    );

    await connection.commit();

    res.status(201).json({
      message: `Building '${building_name}' inserted successfully`,
      building: { building_ID: result.insertId, building_name, building_status }
    });

  } catch (err) {
    await connection.rollback();
    console.error("INSERT BUILDING ERROR:", err);
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;