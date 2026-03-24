const service = require("../service/index");
const { bookTicketSchema } = require("../validator/index");

// 🔹 Reset Server
module.exports.resetServer = async (req, res) => {
  try {
    const response = await service.resetServer();

    return res.status(response.success ? 200 : 400).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (resetServer):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔹 Book Ticket
module.exports.bookTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = bookTicketSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const response = await service.bookTicket(id, value);

    return res.status(response.success ? 200 : 400).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (bookTicket):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔹 Get Ticket Status
module.exports.getTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await service.getTicketStatus(id);

    return res.status(response.success ? 200 : 404).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (getTicketStatus):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔹 Get Closed Tickets
module.exports.getClosedTickets = async (req, res) => {
  try {
    const response = await service.getClosedTickets();

    return res.status(200).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (getClosedTickets):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔹 Get Open Tickets
module.exports.getOpenTickets = async (req, res) => {
  try {
    const response = await service.getOpenTickets();

    return res.status(200).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (getOpenTickets):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔹 Get Ticket User Details
module.exports.getTicketUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await service.getTicketUserDetails(id);

    return res.status(response.success ? 200 : 404).json({
      success: response.success,
      message: response.message,
      data: response.data || null,
      error: response.error || null,
    });
  } catch (error) {
    console.error("Controller Error (getTicketUserDetails):", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
