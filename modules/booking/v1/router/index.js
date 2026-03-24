const express = require("express");
const router = express.Router();
const controller = require("../controller/index");

// Admin API to reset all tickets
router.post("/tickets/reset", controller.resetServer);

// Update ticket status (book a seat)
router.put("/tickets/:id", controller.bookTicket);

// View Ticket Status
router.get("/tickets/:id/status", controller.getTicketStatus);

// View all closed tickets
router.get("/tickets/closed", controller.getClosedTickets);

// View all open tickets
router.get("/tickets/open", controller.getOpenTickets);

// View Details of the person owning the ticket
router.get("/tickets/:id/user", controller.getTicketUserDetails);

module.exports = router;
