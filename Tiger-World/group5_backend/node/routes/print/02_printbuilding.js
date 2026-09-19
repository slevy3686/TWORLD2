const express = require('express');
const router = express.Router();

// GET /?campus_name=...
router.get('/', async (req, res) => {
  const db = req.app.locals.db;

  try {
    const { campus_name } = req.query;

    if (!campus_name) {
      return res.status(400).json({
        error: "campus_name is required"
      });
    }

    const [campusRows] = await db.execute(
      'SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)',
      [campus_name]
    );

    if (!campusRows.length) {
      return res.status(200).json({ buildings: [] });
    }

    const campus_ID = campusRows[0].campus_ID;

    const [buildings] = await db.execute(
      'SELECT building_ID, building_name, building_status FROM building WHERE campus_ID = ? ORDER BY building_ID',
      [campus_ID]
    );

    res.status(200).json({ buildings });

  } catch (err) {
    console.error("PRINT BUILDING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;