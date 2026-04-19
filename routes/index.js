const express = require("express");

const router = express.Router();

// Register module routers
const clientRoutes = require("../modules/clients/v1/router/index");
const invoiceRoutes = require("../modules/invoices/v1/router/index");
const reminderRoutes = require("../modules/reminders/v1/router/index");
const authRoutes = require("../modules/auth/v1/router/index");
const dashboardRoutes = require("../modules/dashboard/v1/router/index");
const paymentRoutes = require("../modules/payments/v1/router/index");
const subscriptionRoutes = require("../modules/subscriptions/v1/router/index");

router.use("/clients", clientRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/reminders", reminderRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/payments", paymentRoutes);
router.use("/subscriptions", subscriptionRoutes);

module.exports = router;
