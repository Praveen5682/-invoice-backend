// controller/index.js
const service = require("../service/index");
const {
  createClientSchema,
  updateClientSchema,
} = require("../validator/index");

module.exports.getAllClients = async (req, res) => {
  try {
    const clients = await service.getAllClients(req.user.id);
    return res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (err) {
    console.error("Client Controller Error (getAllClients):", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients.",
    });
  }
};

module.exports.getClientById = async (req, res) => {
  try {
    const client = await service.getClientById(req.params.id, req.user.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    console.error("Client Controller Error (getClientById):", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch client.",
    });
  }
};

module.exports.createClient = async (req, res) => {
  try {
    const { error, value } = createClientSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const response = await service.createClient(value, req.user.id);

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Client created successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Client Controller Error (createClient):", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create client.",
    });
  }
};

module.exports.updateClient = async (req, res) => {
  try {
    const id = req.params.id;

    const { error, value } = updateClientSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const response = await service.updateClient(id, value, req.user.id);

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Client Controller Error (updateClient):", err);

    if (
      err.message.includes("not found") ||
      err.message.includes("authorized")
    ) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update client.",
    });
  }
};

module.exports.deleteClient = async (req, res) => {
  try {
    const response = await service.deleteClient(req.params.id, req.user.id);

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (err) {
    console.error("Client Controller Error (deleteClient):", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete client.",
    });
  }
};

module.exports.updateClientStatus = async (req, res) => {
  try {
    const clientId = req.params.id; // Use clientId to avoid any 'id' conflict

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const { status } = req.body;

    if (status === undefined || ![0, 1].includes(Number(status))) {
      return res.status(400).json({
        success: false,
        message: "Status must be 0 or 1",
      });
    }

    const result = await service.toggleClientStatus(
      clientId,
      Number(status),
      req.user.id,
    );

    if (!result.status) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to update client status",
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("Client Controller Error (updateClientStatus):", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while updating status.",
    });
  }
};
