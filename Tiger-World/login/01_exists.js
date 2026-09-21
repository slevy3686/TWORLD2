import express from "express";
const router = express.Router();

router.get("/exists", async (req, res) => {
  const db = req.app.locals.db;
  const email = req.query.email?.trim();

  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const [rows] = await db.execute(
      "SELECT user_ID FROM `user` WHERE email = ?",
      [email]
    );

    res.json({
      exists: rows.length > 0,
      user_ID: rows[0]?.user_ID || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;