const service = require("../service/index");
const {
  createClientSchema,
  updateClientSchema,
} = require("../validator/index");

module.exports.getAllClients = async (req, res) => {
  try {
    const clients = await service.getAllClients();
    return res.status(200).json({ success: true, data: clients });
  } catch (err) {
    console.error("Client Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch clients." });
  }
};

module.exports.getClientById = async (req, res) => {
  try {
    const client = await service.getClientById(req.params.id);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found." });
    }
    return res.status(200).json({ success: true, data: client });
  } catch (err) {
    console.error("Client Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch client." });
  }
};

module.exports.createClient = async (req, res) => {
  try {
    const { error, value } = createClientSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.createClient(value);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(201).json({
      success: true,
      message: "Client created successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Client Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create client." });
  }
};

module.exports.updateClient = async (req, res) => {
  try {
    const { error, value } = updateClientSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.updateClient(req.params.id, value);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Client Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update client." });
  }
};

module.exports.deleteClient = async (req, res) => {
  try {
    const response = await service.deleteClient(req.params.id);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }
    return res
      .status(200)
      .json({ success: true, message: "Client deleted successfully." });
  } catch (err) {
    console.error("Client Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete client." });
  }
};
