const service = require("../service/index");
const {
  createInvoiceSchema,
  updateInvoiceSchema,
} = require("../validator/index");

module.exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await service.getAllInvoices();
    return res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    console.error("Invoice Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoices." });
  }
};

module.exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await service.getInvoiceById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found." });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    console.error("Invoice Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice." });
  }
};

module.exports.createInvoice = async (req, res) => {
  try {
    const { error, value } = createInvoiceSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((e) => e.message).join(", "),
      });
    }

    const result = await service.createInvoice(value);

    if (!result.status) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: result.data,
    });
  } catch (err) {
    console.error("Create Invoice Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.updateInvoice = async (req, res) => {
  try {
    const { error, value } = updateInvoiceSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.updateInvoice(req.params.id, value);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Invoice Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update invoice." });
  }
};

module.exports.deleteInvoice = async (req, res) => {
  try {
    const response = await service.deleteInvoice(req.params.id);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }
    return res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully." });
  } catch (err) {
    console.error("Invoice Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete invoice." });
  }
};
