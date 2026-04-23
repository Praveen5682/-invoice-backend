const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Invoice Routes
router.get("/get-invoices", authCheck, Controller.getAllInvoices);
router.get("/:id", authCheck, Controller.getInvoiceById);
router.post("/", authCheck, Controller.createInvoice);
router.put("/:id", authCheck, Controller.updateInvoice);
router.delete("/:id", authCheck, Controller.deleteInvoice);
router.patch("/:id/status", authCheck, Controller.updateInvoiceStatus);

module.exports = router;
