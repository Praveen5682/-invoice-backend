const express = require("express");
const router = express.Router();
const invoiceController = require("../controller");

router.post("/", invoiceController.addInvoice);
router.get("/", invoiceController.listInvoices);
router.get("/:id", invoiceController.getInvoice);
router.put("/:id", invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;
