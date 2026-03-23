const db = require("../config/db");

const dbCheck = async (req, res, next) => {
  try {
    await db.raw("SELECT 1");
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { dbCheck };
