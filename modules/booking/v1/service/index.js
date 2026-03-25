const db = require("../../../../config/db");

const TICKET_STATUS = {
  OPEN: 0,
  CLOSED: 1,
};

// 🔹 Book Ticket
module.exports.bookTicket = async (props = {}) => {
  const { id, userData } = props;
  try {
    let bookedTicket;

    await db.transaction(async (trx) => {
      const ticket = await trx("tickets")
        .where({ ticket_id: id })
        .first()
        .forUpdate();

      if (!ticket) {
        throw new Error("Invalid seat number.");
      }

      if (ticket.status === TICKET_STATUS.CLOSED) {
        throw new Error("Ticket already booked.");
      }

      await trx("tickets").where({ ticket_id: id }).update({
        status: TICKET_STATUS.CLOSED,
        user_name: userData.user_name,
        user_email: userData.user_email,
      });

      bookedTicket = await trx("tickets").where({ ticket_id: id }).first();
    });

    return {
      success: true,
      message: "Ticket booked successfully.",
      data: bookedTicket,
    };
  } catch (error) {
    console.error("Service Error (bookTicket):", error);

    return {
      success: false,
      message: error.message,
    };
  }
};
// 🔹 Get Open Tickets
module.exports.getOpenTickets = async () => {
  try {
    const tickets = await db("tickets").where({
      status: TICKET_STATUS.OPEN,
    });

    return {
      success: true,
      message: "Open tickets fetched",
      data: tickets,
    };
  } catch (error) {
    console.error("Service Error (getOpenTickets):", error);

    return {
      success: false,
      message: "Failed to fetch open tickets",
      error: error.message,
    };
  }
};

// 🔹 Get Closed Tickets
module.exports.getClosedTickets = async () => {
  try {
    const tickets = await db("tickets").where({
      status: TICKET_STATUS.CLOSED,
    });

    return {
      success: true,
      message: "Closed tickets fetched",
      data: tickets,
    };
  } catch (error) {
    console.error("Service Error (getClosedTickets):", error);

    return {
      success: false,
      message: "Failed to fetch closed tickets",
      error: error.message,
    };
  }
};

// 🔹 Update Ticket
module.exports.updateTicket = async (props = {}) => {
  const { id, userData } = props;
  try {
    const ticket = await db("tickets").where({ ticket_id: id }).first();

    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }

    if (ticket.status === TICKET_STATUS.OPEN) {
      return { success: false, message: "Seat not booked yet" };
    }

    await db("tickets").where({ ticket_id: id }).update({
      user_name: userData.user_name,
      user_email: userData.user_email,
      user_phone: userData.user_phone,
    });

    const updatedTicket = await db("tickets").where({ ticket_id: id }).first();

    return {
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    };
  } catch (error) {
    return {
      success: false,
      message: "Update failed",
      error: error.message,
    };
  }
};

// 🔹 Delete Ticket

module.exports.deleteTicket = async (props = {}) => {
  const { id } = props;
  try {
    const ticket = await db("tickets").where({ ticket_id: id }).first();

    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }

    if (ticket.status === TICKET_STATUS.OPEN) {
      return { success: false, message: "Ticket is not booked yet" };
    }

    await db("tickets").where({ ticket_id: id }).update({
      status: TICKET_STATUS.OPEN,
      user_name: null,
      user_email: null,
      user_phone: null,
    });

    return { success: true, message: "Ticket deleted successfully" };
  } catch (error) {
    return { success: false, message: "Delete failed", error: error.message };
  }
};

// 🔹 Reset Server
module.exports.resetServer = async () => {
  try {
    await db("tickets").update({
      status: TICKET_STATUS.OPEN,
      user_name: null,
      user_email: null,
      user_phone: null,
    });

    return {
      success: true,
      message: "Server reset successfully. All tickets are open.",
      data: null,
    };
  } catch (error) {
    console.error("Service Error (resetServer):", error);

    return {
      success: false,
      message: "Failed to reset server",
      error: error.message,
    };
  }
};

// 🔹 Get Ticket Status
// module.exports.getTicketStatus = async (props = {}) => {
//   const { id } = props;
//   try {
//     const ticket = await db("tickets").where({ ticket_id: id }).first();

//     if (!ticket) {
//       return { success: false, message: "Invalid seat number." };
//     }

//     return {
//       success: true,
//       message: "Ticket status fetched",
//       data: {
//         id: ticket.id,
//         status: ticket.status,
//       },
//     };
//   } catch (error) {
//     console.error("Service Error (getTicketStatus):", error);

//     return {
//       success: false,
//       message: "Failed to fetch ticket status",
//       error: error.message,
//     };
//   }
// };

// 🔹 Get Ticket User Details
// module.exports.getTicketUserDetails = async (props = {}) => {
//   const { id } = props;
//   try {
//     const ticket = await db("tickets").where({ ticket_id: id }).first();

//     if (!ticket) {
//       return { success: false, message: "Invalid seat number." };
//     }

//     if (ticket.status === TICKET_STATUS.OPEN) {
//       return {
//         success: false,
//         message: "Ticket is open and has no user details.",
//       };
//     }

//     return {
//       success: true,
//       message: "User details fetched",
//       data: {
//         user_name: ticket.user_name,
//         user_email: ticket.user_email,
//         user_phone: ticket.user_phone,
//       },
//     };
//   } catch (error) {
//     console.error("Service Error (getTicketUserDetails):", error);

//     return {
//       success: false,
//       message: "Failed to fetch user details",
//       error: error.message,
//     };
//   }
// };
