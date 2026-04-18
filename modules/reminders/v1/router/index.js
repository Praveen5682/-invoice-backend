const express = require("express");
const controller = require("../controller");

const router = express.Router();

router.get("/", controller.getReminders);
router.post("/", controller.createReminder);
router.post("/:id/trigger", controller.triggerReminder);

module.exports = router;
