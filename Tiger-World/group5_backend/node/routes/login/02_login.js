const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_ID, password_hash FROM user WHERE email = ?`,
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      user_ID: user.user_ID
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}); module.exports = router;