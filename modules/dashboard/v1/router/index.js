const express = require("express");
const router = express.Router();
const dashboardController = require("../controller");
const authCheck = require("../../../../middleware/authCheck");

// Protected routes
router.get("/overview", authCheck, dashboardController.getOverview);
router.get("/reports", authCheck, dashboardController.getReports);

module.exports = router;
