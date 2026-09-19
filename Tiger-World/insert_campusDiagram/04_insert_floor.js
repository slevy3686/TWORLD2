// routes/insert_campusDiagram/04_insert_floor.js
import express from "express";
const router = express.Router();

// POST /api/insert/floor
router.post("/", async (req, res) => {
  console.log("=== INSERT FLOOR HIT ===");

  const db = req.app.locals.db;
  const { campus_name, building_name } = req.body;

  if (!campus_name || !building_name) {
    return res.status(400).json({ error: "campus_name and building_name are required" });
  }

  try {
    // 1) Get campus_ID
    const [campusRows] = await db.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name]
    );
    if (!campusRows.length) return res.status(404).json({ error: `Campus '${campus_name}' not found` });

    const campus_ID = campusRows[0].campus_ID;

    // 2) Get building_ID
    const [buildingRows] = await db.execute(
      "SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)",
      [campus_ID, building_name]
    );
    if (!buildingRows.length) return res.status(404).json({ error: `Building '${building_name}' not found` });

    const building_ID = buildingRows[0].building_ID;

    // 3) Get max floor_number for building
    const [floorMaxRows] = await db.execute(
      "SELECT IFNULL(MAX(floor_number), 0) AS max_floor FROM floor WHERE building_ID = ?",
      [building_ID]
    );
    const nextFloorNumber = floorMaxRows[0].max_floor + 1;

    // 4) Insert new floor
    const [result] = await db.execute(
      "INSERT INTO floor (building_ID, floor_number, name, floor_status) VALUES (?, ?, ?, 'AVAILABLE')",
      [building_ID, nextFloorNumber, `Floor ${nextFloorNumber}`]
    );

    res.status(201).json({
      message: "Floor inserted successfully",
      floor_ID: result.insertId,
      floor_number: nextFloorNumber
    });

  } catch (err) {
    console.error("INSERT FLOOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;