// routes/insert_campusDiagram/03_insert_elevator.js

import express from "express";
const router = express.Router();

// POST /api/insert/elevator
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { campus_name, building_name, transport_type } = req.body;

    // 1) Validate transport_type
    if (!["ELEVATOR", "STAIR"].includes(transport_type)) {
      return res.status(400).json({ error: "transport_type must be 'ELEVATOR' or 'STAIR'" });
    }

    // 2) Get campus_ID
    const [campusRows] = await connection.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name]
    );
    if (!campusRows.length) {
      return res.status(404).json({ error: `Campus '${campus_name}' not found` });
    }
    const campus_ID = campusRows[0].campus_ID;

    // 3) Get building_ID
    const [buildingRows] = await connection.execute(
      "SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)",
      [campus_ID, building_name]
    );
    if (!buildingRows.length) {
      return res.status(404).json({ error: `Building '${building_name}' not found` });
    }
    const building_ID = buildingRows[0].building_ID;

    // 4) Get next transport_number safely
    const [numRows] = await connection.execute(
      `
      SELECT IFNULL(MAX(transport_number), 0) AS max_num
      FROM transport_shaft
      WHERE building_ID = ? AND transport_type = ?
      `,
      [building_ID, transport_type]
    );
    const transport_number = numRows[0].max_num + 1;

    // 5) Generate name
    const name = `${transport_type} ${transport_number}`;

    // 6) Insert new transport shaft
    const [result] = await connection.execute(
      `
      INSERT INTO transport_shaft
      (building_ID, transport_type, transport_number, name)
      VALUES (?, ?, ?, ?)
      `,
      [building_ID, transport_type, transport_number, name]
    );

    await connection.commit();

    // 7) Respond with details
    res.status(201).json({
      message: "Transport shaft inserted successfully",
      shaft: {
        shaft_ID: result.insertId,
        building_ID,
        transport_type,
        transport_number,
        name
      }
    });

  } catch (err) {
    // Rollback transaction on error
    await connection.rollback();
    console.error("INSERT ELEVATOR ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    // Always release connection
    connection.release();
  }
});

export default router;