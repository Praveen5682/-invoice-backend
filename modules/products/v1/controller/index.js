const service = require("../service");

module.exports.createProduct = async (req, res) => {
  try {
    const product = await service.createProduct(req.body, req.user.id);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    const data = await service.getProducts(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const data = await service.updateProduct(req.params.id, req.body, req.user.id);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Controller Error (updateProduct):", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id, req.user.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.toggleStatus = async (req, res) => {
  try {
    await service.toggleStatus(req.params.id, req.body.status, req.user.id);
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
