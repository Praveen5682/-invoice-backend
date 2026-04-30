// controller/index.js
const service = require("../service");
const {
  createProductSchema,
  updateProductSchema,
  statusSchema,
} = require("../validator");

module.exports.createProduct = async (req, res) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const product = await service.createProduct(value, req.user.id);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Controller Error (createProduct):", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    const data = await service.getProducts(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const data = await service.getProductById(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const data = await service.updateProduct(req.params.id, value, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Controller Error (updateProduct):", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id, req.user.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.toggleStatus = async (req, res) => {
  try {
    const { error } = statusSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    await service.toggleStatus(req.params.id, req.body.status, req.user.id);
    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
