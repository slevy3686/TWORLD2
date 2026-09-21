import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";

router.post("/register", async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    await db.execute(
      "INSERT INTO `user` (email, password_hash) VALUES (?, ?)",
      [email.trim(), hash]
    );

    res.status(201).json({ message: "Account created" });

  } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("STACK:", err.stack);

  return res.status(500).json({
    message: err.message,
    stack: err.stack
  });
}
}); 

export default router;