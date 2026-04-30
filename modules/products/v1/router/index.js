// routes/products.js   (or wherever your product routes are)

const express = require("express");
const router = express.Router();

const controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck"); // ← Import this

// Protected Routes - All must have authCheck
router.post("/create-product", authCheck, controller.createProduct);
router.get("/products", authCheck, controller.getProducts);
router.get("/:id", authCheck, controller.getProductById);
router.put("/:id", authCheck, controller.updateProduct);
router.delete("/:id", authCheck, controller.deleteProduct);
router.patch("/:id/status", authCheck, controller.toggleStatus);

module.exports = router;
