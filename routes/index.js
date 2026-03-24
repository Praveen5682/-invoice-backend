const express = require("express");

const router = express.Router();

// Register module routers
router.use("/booking", require("../modules/booking/v1/router/index"));

module.exports = router;
