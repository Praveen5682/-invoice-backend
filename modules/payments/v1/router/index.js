const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Payment Routes
router.get("/", authCheck, Controller.getAllPayments);
router.get("/:id", authCheck, Controller.getPaymentById);
router.post("/", authCheck, Controller.createPayment);
router.put("/:id", authCheck, Controller.updatePayment);

module.exports = router;
