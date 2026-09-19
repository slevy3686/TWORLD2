const express = require("express");
const router = express.Router();

// GET /api/print/room?campus_name=&building_name=&floor_number=
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  const { campus_name, building_name, floor_number } = req.query;

  if (!campus_name || !building_name || floor_number === undefined)
    return res.status(400).json({ error: "campus_name, building_name, and floor_number are required" });

  try {
    const [campusRows] = await db.execute(
      'SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)',
      [campus_name]
    );
    if (!campusRows.length) return res.status(404).json({ rooms: [] });

    const campus_ID = campusRows[0].campus_ID;

    const [buildingRows] = await db.execute(
      'SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)',
      [campus_ID, building_name]
    );
    if (!buildingRows.length) return res.status(404).json({ rooms: [] });

    const building_ID = buildingRows[0].building_ID;

    const [floorRows] = await db.execute(
      'SELECT floor_ID FROM floor WHERE building_ID = ? AND floor_number = ?',
      [building_ID, floor_number]
    );
    if (!floorRows.length) return res.status(404).json({ rooms: [] });

    const floor_ID = floorRows[0].floor_ID;

    const [rooms] = await db.execute(
      'SELECT room_ID, room_number, room_classification, room_status FROM room WHERE floor_ID = ? ORDER BY room_number ASC',
      [floor_ID]
    );

    res.status(200).json({ rooms });
  } catch (err) {
    console.error("PRINT ROOMS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;