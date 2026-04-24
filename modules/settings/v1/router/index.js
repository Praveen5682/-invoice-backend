const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

router.get("/", authCheck, controller.getSettings);
router.put("/update", authCheck, controller.updateSettings);
router.put("/change-password", authCheck, controller.changePassword);

module.exports = router;
