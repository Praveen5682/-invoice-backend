const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Reminder Routes
router.get("/", authCheck, Controller.getAllReminders);
router.get("/:id", authCheck, Controller.getReminderById);
router.post("/", authCheck, Controller.createReminder);
router.put("/:id", authCheck, Controller.updateReminder);
router.post("/:id/trigger", authCheck, Controller.triggerReminder);

module.exports = router;
