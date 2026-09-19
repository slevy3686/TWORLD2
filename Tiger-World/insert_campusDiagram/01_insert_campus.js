import express from "express";
const router = express.Router();

// POST /api/insert/campus
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let { campus_name, campus_status } = req.body;

    if (!campus_name || campus_name.trim() === "") {
      connection.release();
      return res.status(400).json({ error: "campus_name is required" });
    }
    campus_name = campus_name.trim();

    campus_status = campus_status?.toUpperCase();
    if (!["AVAILABLE", "UNAVAILABLE"].includes(campus_status)) {
      connection.release();
      return res.status(400).json({
        error: "campus_status must be 'AVAILABLE' or 'UNAVAILABLE'"
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO campus (campus_name, campus_status)
       VALUES (?, ?)`,
      [campus_name, campus_status]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Campus inserted successfully",
      campus: {
        campus_ID: result.insertId,
        campus_name,
        campus_status
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error("INSERT CAMPUS ERROR:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// GET /api/insert/campus (for services)
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.query(
      'SELECT campus_ID, campus_name, campus_status FROM campus'
    );
    res.json({ campuses: rows });
  } catch (err) {
    console.error("GET CAMPUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;