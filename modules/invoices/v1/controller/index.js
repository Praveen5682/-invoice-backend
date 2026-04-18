const invoiceService = require("../service");
const { validateInvoice } = require("../validator");

// 🔹 Add Invoice
module.exports.addInvoice = async (req, res) => {
  try {
    const { success, errors, value } = validateInvoice(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors,
      });
    }

    const data = await invoiceService.createInvoice(value);
    return res.status(201).json({
      success: true,
      message: "Invoice created and saved successfully.",
      data,
    });
  } catch (error) {
    console.error("Controller Error (addInvoice):", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "An error occurred while generating the invoice.",
    });
  }
};

// 🔹 List Invoices
module.exports.listInvoices = async (req, res) => {
  try {
    const data = await invoiceService.getInvoices();
    return res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Controller Error (listInvoices):", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch invoices list.",
    });
  }
};

// 🔹 Get Invoice
module.exports.getInvoice = async (req, res) => {
  try {
    const data = await invoiceService.getInvoiceById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Invoice details retrieved.",
      data,
    });
  } catch (error) {
    console.error(`Controller Error (getInvoice - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not retrieve invoice details.",
    });
  }
};

// 🔹 Update Invoice
module.exports.updateInvoice = async (req, res) => {
  try {
    // Note: Validation might be different for partial updates, 
    // but here we reuse the main validator for simplicity or we can relax it.
    const data = await invoiceService.updateInvoice(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Invoice status/details updated.",
      data,
    });
  } catch (error) {
    console.error(`Controller Error (updateInvoice - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update the invoice.",
    });
  }
};

// 🔹 Delete Invoice
module.exports.deleteInvoice = async (req, res) => {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Invoice has been permanently deleted.",
    });
  } catch (error) {
    console.error(`Controller Error (deleteInvoice - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error while deleting the invoice.",
    });
  }
};
