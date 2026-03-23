const express = require("express");
const testRouter = require("../modules/test/v1/router");

const router = express.Router();

// Register module routers
router.use("/test", testRouter);

module.exports = router;
