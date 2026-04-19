const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Subscription Routes
router.get("/", authCheck, Controller.getAllSubscriptions);
router.get("/:id", authCheck, Controller.getSubscriptionById);
router.post("/", authCheck, Controller.createSubscription);
router.put("/:id", authCheck, Controller.updateSubscription);
router.delete("/:id", authCheck, Controller.deleteSubscription);

module.exports = router;
