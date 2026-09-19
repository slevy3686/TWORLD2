console.log("PRINT FLOORS ROUTE LOADED");

const express = require("express");
const router = express.Router();

// GET /api/print/floors?campus_name=&building_name=
router.get("/", async (req, res) => {
console.log("PRINT FLOORS HIT");
  const db = req.app.locals.db;
  const { campus_name, building_name } = req.query;

  if (!campus_name || !building_name) {
    return res.status(400).json({ error: "campus_name and building_name are required" });
  }

  try {
    // 1) Get campus_ID (case-insensitive)
    const [campusRows] = await db.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name.trim()]
    );
    if (campusRows.length === 0) {
      return res.status(404).json({ error: `Campus "${campus_name}" not found` });
    }
    const campus_ID = campusRows[0].campus_ID;

    // 2) Get building_ID (case-insensitive)
    const [buildingRows] = await db.execute(
      "SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)",
      [campus_ID, building_name.trim()]
    );
    if (buildingRows.length === 0) {
      return res.status(404).json({ error: `Building "${building_name}" not found in campus "${campus_name}"` });
    }
    const building_ID = buildingRows[0].building_ID;

    // 3) Get floors
    const [floors] = await db.execute(
      "SELECT floor_ID, floor_number, name, floor_status FROM floor WHERE building_ID = ? ORDER BY floor_number ASC",
      [building_ID]
    );

    res.status(200).json({ floors });

  } catch (err) {
    console.error("PRINT FLOORS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;