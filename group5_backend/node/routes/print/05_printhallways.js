const express = require("express");
const router = express.Router();

// GET /api/print/hallway?campus_name=&building_name=&floor_number=
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  const { campus_name, building_name, floor_number } = req.query;

  if (!campus_name || !building_name || floor_number === undefined)
    return res.status(400).json({ error: "campus_name, building_name, and floor_number are required" });

  try {
    const [floorRows] = await db.execute(
      `SELECT f.floor_ID
       FROM floor f
       JOIN building b ON f.building_ID = b.building_ID
       JOIN campus c ON b.campus_ID = c.campus_ID
       WHERE f.floor_number = ? AND LOWER(b.building_name) = LOWER(?) AND LOWER(c.campus_name) = LOWER(?)`,
      [Number(floor_number), building_name, campus_name]
    );

    if (!floorRows.length) return res.status(404).json({ hallways: [] });

    const floor_ID = floorRows[0].floor_ID;

    const [hallways] = await db.execute(
      'SELECT hallway_ID, hallway_name, status FROM hallway WHERE floor_ID = ?',
      [floor_ID]
    );

    res.status(200).json({ hallways });
  } catch (err) {
    console.error("PRINT HALLWAYS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;