const db = require("../../../../config/db");

// 🔹 Get Aggregate Statistics
module.exports.getStats = async () => {
  try {
    const totalInvoices = await db("invoices").count("id as count").first();
    const totalClients = await db("clients").count("id as count").first();

    const revenueStats = await db("invoices")
      .select(
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as total_revenue",
        ),
        db.raw(
          "SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as overdue_amount",
        ),
      )
      .first();

    const stats = revenueStats || {
      total_revenue: 0,
      pending_amount: 0,
      overdue_amount: 0,
    };

    return {
      total_invoices: totalInvoices.count || 0,
      total_clients: totalClients.count || 0,
      total_revenue: stats.total_revenue || 0,
      pending_amount: stats.pending_amount || 0,
      overdue_amount: stats.overdue_amount || 0,
    };
  } catch (error) {
    console.error("Dashboard Service Error (getStats):", error);
    throw error;
  }
};

// 🔹 Get 6-Month Revenue Data for Chart
module.exports.getChartData = async () => {
  try {
    // Note: MySQL specific query for last 6 months
    const data = await db("invoices")
      .select(
        db.raw("DATE_FORMAT(issue_date, '%b') as month"),
        db.raw("SUM(total_amount) as amount"),
      )
      .where(
        "issue_date",
        ">=",
        db.raw("DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"),
      )
      .where("status", "paid")
      .groupByRaw("DATE_FORMAT(issue_date, '%b')")
      .orderByRaw("MIN(issue_date) ASC");
    return data;
  } catch (error) {
    console.error("Dashboard Service Error (getChartData):", error);
    throw error;
  }
};

// 🔹 Get Monthly Report Aggregates
module.exports.getMonthlyReports = async () => {
  try {
    const data = await db("invoices")
      .select(
        db.raw("DATE_FORMAT(issue_date, '%M %Y') as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status != 'paid' THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .groupByRaw("period")
      .orderBy("issue_date", "desc");

    return data;
  } catch (error) {
    console.error("Dashboard Service Error (getMonthlyReports):", error);
    throw error;
  }
};

// 🔹 Get Overdue Reminders
module.exports.getOverdueReminders = async () => {
  try {
    const data = await db("reminders")
      .join("invoices", "reminders.invoice_id", "invoices.id")
      .join("clients", "invoices.client_id", "clients.id")
      .select(
        "reminders.id",
        "reminders.reminder_date",
        "reminders.status",
        "invoices.invoice_no",
        "invoices.total_amount",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .where("reminders.reminder_date", "<", db.fn.now())
      .where("reminders.status", "!=", "sent")
      .orderBy("reminders.reminder_date", "desc")
      .limit(10);

    return data;
  } catch (error) {
    console.error("Dashboard Service Error (getOverdueReminders):", error);
    throw error;
  }
};
