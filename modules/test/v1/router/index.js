const express = require("express");

const router = express.Router();

router.use("/test", testRouter);

module.exports = router;
