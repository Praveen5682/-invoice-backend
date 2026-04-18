const cron = require("node-cron");
const db = require("../config/db");
const { sendReminderEmail } = require("./mailer");

// Run every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily invoice reminder check...");
  
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Find invoices due today that are not paid
    const pendingInvoices = await db("invoices as i")
      .join("clients as c", "i.client_id", "c.id")
      .select(
        "i.invoice_no",
        "i.total_amount",
        "i.due_date",
        "c.name as client_name",
        "c.email as client_email"
      )
      .where("i.due_date", today)
      .andWhere("i.status", "!=", "paid");

    for (const inv of pendingInvoices) {
      console.log(`Sending reminder to ${inv.client_email} for invoice #${inv.invoice_no}`);
      await sendReminderEmail(
        inv.client_email,
        inv.client_name,
        inv.invoice_no,
        inv.total_amount,
        inv.due_date
      );
    }
    
    console.log(`Cron completed. ${pendingInvoices.length} reminders sent.`);
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});

module.exports = cron;
