const express = require("express");
const router = express.Router();
const controller = require("../controller/index");

// Update ticket status (book a seat)
router.put("/tickets/:id", controller.bookTicket);

// View all open tickets
router.get("/tickets/open", controller.getOpenTickets);

// View all closed tickets
router.get("/tickets/closed", controller.getClosedTickets);

// Updated ticket
router.put("/tickets/update/:id", controller.updateTicket);

// Delete ticket
router.delete("/tickets/:id", controller.deleteTicket);

// Admin API to reset all tickets
router.post("/tickets/reset", controller.resetServer);

// View Ticket Status
// router.get("/tickets/:id/status", controller.getTicketStatus);

// View Details of the person owning the ticket
// router.get("/tickets/:id/user", controller.getTicketUserDetails);

module.exports = router;
