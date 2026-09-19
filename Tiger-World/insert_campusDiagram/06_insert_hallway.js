import express from "express";
const router = express.Router();

// POST /api/insert/hallway
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let { campus_name, building_name, floor_number } = req.body;
    if (!campus_name || !building_name || floor_number === undefined) {
      throw new Error("campus_name, building_name, and floor_number are required");
    }

    campus_name = campus_name.trim();
    building_name = building_name.trim();

    const [floors] = await connection.execute(
      `SELECT f.floor_ID
       FROM floor f
       JOIN building b ON f.building_ID = b.building_ID
       JOIN campus c ON b.campus_ID = c.campus_ID
       WHERE f.floor_number = ?
         AND LOWER(b.building_name) = LOWER(?)
         AND LOWER(c.campus_name) = LOWER(?)`,
      [floor_number, building_name, campus_name]
    );

    if (!floors.length) {
      throw new Error(`Floor ${floor_number} in building ${building_name} at campus ${campus_name} not found`);
    }

    const floor_ID = floors[0].floor_ID;

    const [result] = await connection.execute(
      `INSERT INTO hallway (hallway_name, status, floor_ID) VALUES ('', 'AVAILABLE', ?)`,
      [floor_ID]
    );

    const hallway_ID = result.insertId;
    const hallway_name = `Hallway ${hallway_ID}`;

    await connection.execute(
      `UPDATE hallway SET hallway_name = ? WHERE hallway_ID = ?`,
      [hallway_name, hallway_ID]
    );

    await connection.commit();

    res.status(201).json({
      message: `Hallway ${hallway_name} added successfully`
    });

  } catch (err) {
    await connection.rollback();
    console.error("INSERT HALLWAY ERROR:", err);
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

export default router;