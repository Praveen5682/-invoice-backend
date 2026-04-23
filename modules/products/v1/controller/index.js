const service = require("../service");

// ✅ CREATE
module.exports.createProduct = async (req, res) => {
  try {
    const product = await service.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ GET ALL
module.exports.getProducts = async (req, res) => {
  try {
    const data = await service.getProducts();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ GET BY ID
module.exports.getProductById = async (req, res) => {
  try {
    const data = await service.getProductById(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ UPDATE
module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await service.updateProduct(id, req.body);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Controller Error (updateProduct):", err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ DELETE
module.exports.deleteProduct = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ TOGGLE STATUS
module.exports.toggleStatus = async (req, res) => {
  try {
    await service.toggleStatus(req.params.id, req.body.status);

    res.json({
      success: true,
      message: "Status updated",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
