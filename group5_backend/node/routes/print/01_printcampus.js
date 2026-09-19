const express = require("express");
const router = express.Router();

// GET /api/print/campus
router.get("/", async (req, res) => {
  const db = req.app.locals.db;

  try {
    const [rows] = await db.execute(
      `SELECT campus_ID, campus_name, campus_status
       FROM campus
       ORDER BY campus_ID`
    );
    res.status(200).json({ campuses: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;