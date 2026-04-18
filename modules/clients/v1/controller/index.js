const clientService = require("../service");
const { validateClient } = require("../validator");

// 🔹 Add Client
module.exports.addClient = async (req, res) => {
  try {
    const { success, errors, value } = validateClient(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors,
      });
    }

    const data = await clientService.createClient(value);
    return res.status(201).json({
      success: true,
      message: "Client created successfully.",
      data,
    });
  } catch (error) {
    console.error("Controller Error (addClient):", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error while adding client.",
    });
  }
};

// 🔹 List Clients
module.exports.listClients = async (req, res) => {
  try {
    const data = await clientService.getClients();
    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Controller Error (listClients):", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve clients.",
    });
  }
};

// 🔹 Get Client
module.exports.getClient = async (req, res) => {
  try {
    const data = await clientService.getClientById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Client profile retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error(`Controller Error (getClient - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not fetch client details.",
    });
  }
};

// 🔹 Update Client
module.exports.updateClient = async (req, res) => {
  try {
    const { success, errors, value } = validateClient(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors,
      });
    }

    const data = await clientService.updateClient(req.params.id, value);
    return res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      data,
    });
  } catch (error) {
    console.error(`Controller Error (updateClient - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update client profile.",
    });
  }
};

// 🔹 Delete Client
module.exports.deleteClient = async (req, res) => {
  try {
    await clientService.deleteClient(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Client and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error(`Controller Error (deleteClient - ${req.params.id}):`, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error occurred during client deletion.",
    });
  }
};
