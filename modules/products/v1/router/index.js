const express = require("express");
const router = express.Router();

const controller = require("../controller/index");

// ✅ Create product
router.post("/create-product", controller.createProduct);

// ✅ Get all products
router.get("/products", controller.getProducts);

// ✅ Get product by id
router.get("/:id", controller.getProductById);

// ✅ Update product
router.put("/:id", controller.updateProduct);

// ✅ Delete product
router.delete("/:id", controller.deleteProduct);

// ✅ Toggle status (active/inactive)
router.patch("/:id/status", controller.toggleStatus);

module.exports = router;
