const db = require("../config/db");

const dbCheck = async (req, res, next) => {
  try {
    await db.raw("SELECT 1");

    console.log("✅ Database connected");

    next();
  } catch (err) {
    console.error("❌ Database connection failed");

    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { dbCheck };
