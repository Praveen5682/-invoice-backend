const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

router.post("/order", authCheck, Controller.createOrder);
router.post("/verify", authCheck, Controller.verifyPayment);

module.exports = router;
