const express = require("express");
const router = express.Router();

// POST /api/insert/elevator-stops
router.post("/elevator-stops", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { campus_name, building_name, shaft_number, floor_ids, auto_fill } = req.body;

    if (!Array.isArray(floor_ids) || floor_ids.length === 0) {
      return res.status(400).json({ error: "floor_ids must be a non-empty array" });
    }

    // -------------------------------------------------
    // 1) Resolve campus
    // -------------------------------------------------
    const [campusRows] = await connection.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name]
    );
    if (!campusRows.length) {
      return res.status(404).json({ error: "Campus not found" });
    }
    const campus_ID = campusRows[0].campus_ID;

    // -------------------------------------------------
    // 2) Resolve building
    // -------------------------------------------------
    const [buildingRows] = await connection.execute(
      "SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)",
      [campus_ID, building_name]
    );
    if (!buildingRows.length) {
      return res.status(404).json({ error: "Building not found" });
    }
    const building_ID = buildingRows[0].building_ID;

    // -------------------------------------------------
    // 3) Resolve shaft by building + number
    // -------------------------------------------------
    const [shaftRows] = await connection.execute(
      `SELECT shaft_ID, name FROM transport_shaft
       WHERE building_ID = ? AND transport_number = ?`,
      [building_ID, shaft_number]
    );
    if (!shaftRows.length) {
      return res.status(404).json({
        error: `No elevator/stair #${shaft_number} found in ${building_name}`
      });
    }

    const shaftId = shaftRows[0].shaft_ID;
    const shaftName = shaftRows[0].name;

    // -------------------------------------------------
    // 4) Validate floors belong to building
    // -------------------------------------------------
    const placeholders = floor_ids.map(() => "?").join(",");
    const [floorRows] = await connection.query(
      `
      SELECT floor_id, floor_number
      FROM floor
      WHERE floor_id IN (${placeholders})
        AND building_id = ?
      `,
      [...floor_ids, building_ID]
    );

    if (floorRows.length !== floor_ids.length) {
      return res.status(400).json({
        error: "One or more floors invalid or not in this building"
      });
    }

    // -------------------------------------------------
    // 5) Insert requested stops (FIXED HERE)
    // -------------------------------------------------
    for (const floor of floorRows) {
      const stopName = `${shaftName} - Floor ${floor.floor_number}`;

      await connection.execute(
        `INSERT INTO transport_stop (shaft_id, floor_id, stop_status, name)
         VALUES (?, ?, 'AVAILABLE', ?)`,
        [shaftId, floor.floor_id, stopName]
      );
    }

    // -------------------------------------------------
    // 6) Commit
    // -------------------------------------------------
    await connection.commit();

    res.status(201).json({
      message: "Stops inserted successfully"
    });

  } catch (err) {
    await connection.rollback();
    console.error("INSERT ELEVATOR STOP ERROR:", err);
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;