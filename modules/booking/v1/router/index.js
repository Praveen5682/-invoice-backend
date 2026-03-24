const express = require("express");
const router = express.Router();
const controller = require("../controller/index");

// Admin API to reset all tickets
router.post("/tickets/reset", controller.ResetServer);

// Update ticket status (book a seat)
router.put("/tickets/:id", controller.BookTicket);

// View Ticket Status
router.get("/tickets/:id/status", controller.GetTicketStatus);

// View all closed tickets
router.get("/tickets/closed", controller.GetClosedTickets);

// View all open tickets
router.get("/tickets/open", controller.GetOpenTickets);

// View Details of the person owning the ticket
router.get("/tickets/:id/user", controller.GetTicketUserDetails);

module.exports = router;
