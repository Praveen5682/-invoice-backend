const db = require("../config/db");

let isDbConnected = false;

const dbCheck = async (req, res, next) => {
  try {
    if (!isDbConnected) {
      await db.raw("SELECT 1");
      console.log("✅ Database connected");
      isDbConnected = true;
    }

    next();
  } catch (err) {
    console.error("❌ Database connection failed");

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};

module.exports = dbCheck;
