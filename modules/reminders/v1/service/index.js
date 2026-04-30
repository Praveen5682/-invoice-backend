const db = require("../../../../config/db");
const { sendReminderEmail } = require("../../../../utils/mailer");

module.exports.getAllReminders = async (userId) => {
  try {
    // 1. Get all unpaid invoices (balance > 0)
    const invoices = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .leftJoin("reminders", "invoices.id", "reminders.invoice_id")
      .where("invoices.user_id", userId)
      .andWhere("invoices.status", "!=", "draft")
      .andWhere(db.raw("invoices.total_amount > COALESCE(invoices.amount_paid, 0)"))
      .select(
        "invoices.id as invoice_id",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.amount_paid",
        "invoices.due_date",
        "reminders.id as reminder_id",
        "reminders.status as sent_status",
        "reminders.last_sent",
        // Fallback to invoice denormalized data if client join is null
        db.raw("COALESCE(clients.name, invoices.client_name) as client_name"),
        db.raw("COALESCE(clients.email, invoices.client_email) as client_email")
      )
      .orderBy("invoices.due_date", "asc");

    // 2. Map them to the Reminder format
    const today = new Date();
    return invoices.map((inv) => {
      const dueDate = new Date(inv.due_date);
      const isOverdue = dueDate < today;
      
      // Determine display status
      let displayStatus = "upcoming";
      if (inv.sent_status === "sent") {
        displayStatus = "sent";
      } else if (isOverdue) {
        displayStatus = "overdue";
      }

      return {
        id: inv.reminder_id || `inv_${inv.invoice_id}`, // temporary ID if no record in reminders table
        invoice_id: inv.invoice_id,
        invoice_no: inv.invoice_no,
        client_name: inv.client_name,
        client_email: inv.client_email,
        total_amount: inv.total_amount,
        due_date: inv.due_date,
        status: displayStatus,
        last_sent: inv.last_sent
      };
    });
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch reminders");
  }
};

module.exports.triggerReminder = async (id, userId) => {
  try {
    // ID could be real ID or 'inv_ID'
    let invoiceId = id;
    if (typeof id === "string" && id.startsWith("inv_")) {
      invoiceId = Number(id.replace("inv_", ""));
    }

    // Get Invoice details
    const invoice = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("invoices.id", invoiceId)
      .andWhere("invoices.user_id", userId)
      .select(
        "invoices.*",
        "clients.name as client_name",
        "clients.email as client_email"
      )
      .first();

    if (!invoice || !invoice.client_email) {
      return { status: false, message: "Invoice or client email not found" };
    }

    // Send Email
    const emailSent = await sendReminderEmail(
      invoice.client_email,
      invoice.client_name,
      invoice.invoice_no,
      invoice.total_amount,
      invoice.due_date
    );

    if (emailSent) {
      // Upsert into reminders table to track history
      const existing = await db("reminders").where({ invoice_id: invoiceId }).first();
      if (existing) {
        await db("reminders")
          .where({ id: existing.id })
          .update({ status: "sent", last_sent: new Date() });
      } else {
        await db("reminders").insert({
          invoice_id: invoiceId,
          user_id: userId,
          type: "email",
          status: "sent",
          last_sent: new Date(),
          reminder_date: new Date()
        });
      }
      return { status: true, message: "Reminder sent successfully" };
    } else {
      return { status: false, message: "Failed to send email" };
    }
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.processReminders = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    await db("reminders")
      .where("status", "pending")
      .where("reminder_date", "<", today)
      .update({ status: "overdue" });

    const remindersToSend = await db("reminders")
      .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "reminders.*",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.due_date",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .where("reminders.status", "pending")
      .where("reminders.reminder_date", "<=", today);

    const results = [];

    for (const reminder of remindersToSend) {
      if (reminder.type === "email" && reminder.client_email) {
        const emailSent = await sendReminderEmail(
          reminder.client_email,
          reminder.client_name,
          reminder.invoice_no,
          reminder.total_amount,
          reminder.due_date,
        );

        if (emailSent) {
          await db("reminders").where({ id: reminder.id }).update({
            status: "sent",
            last_sent: new Date(),
          });
          results.push({ id: reminder.id, status: "sent" });
        } else {
          await db("reminders")
            .where({ id: reminder.id })
            .update({ status: "failed" });
          results.push({ id: reminder.id, status: "failed" });
        }
      }
    }

    return { success: true, processed: results.length, details: results };
  } catch (err) {
    console.error("Process Reminders Error:", err);
    throw err;
  }
};
