const express = require("express");
const router = express.Router();

// GET /api/auth/exists?email=
router.get("/exists", async (req, res) => {
  const db = req.app.locals.db;
  const email = req.query.email?.trim();

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_ID FROM user WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      user_ID: rows[0].user_ID
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}); module.exports = router;