const db = require("../../../../config/db");

module.exports.getStats = async () => {
  try {
    const [totalRevenueResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "paid" });
    const [pendingAmountResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "pending" });
    const [overdueAmountResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "overdue" });
    const [invoicesCountResult] = await db("invoices").count("id as count");
    const [activeClientsResult] = await db("clients").count("id as count");

    return {
      total_invoices: invoicesCountResult?.count || 0,
      total_revenue: totalRevenueResult?.sum || 0,
      pending_amount: pendingAmountResult?.sum || 0,
      overdue_amount: overdueAmountResult?.sum || 0,
      total_clients: activeClientsResult?.count || 0,
    };
  } catch (err) {
    console.error("Dashboard Service Error (getStats):", err);
    throw err;
  }
};

module.exports.getChartData = async () => {
  try {
    const data = await db("invoices")
      .select(
        db.raw("DATE_FORMAT(issue_date, '%M') as month"),
        db.raw("SUM(total_amount) as amount"),
      )
      .groupBy("month")
      .orderByRaw("MIN(issue_date) ASC")
      .limit(6);

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getChartData):", err);
    return [];
  }
};

module.exports.getOverdueReminders = async () => {
  try {
    const reminders = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "invoices.id",
        "clients.name as client_name",
        "invoices.total_amount",
        "invoices.due_date as reminder_date",
        "invoices.id as invoice_id",
      )
      .where({ "invoices.status": "overdue" })
      .orderBy("invoices.due_date", "asc")
      .limit(5);

    return reminders;
  } catch (err) {
    console.error("Dashboard Service Error (getOverdueReminders):", err);
    return [];
  }
};

module.exports.getMonthlyReports = async () => {
  try {
    const currentYear = new Date().getFullYear();

    const data = await db("invoices")
      .select(
        db.raw("DATE_FORMAT(issue_date, '%M %Y') as period"), // was: month → period
        db.raw("COUNT(id) as invoice_count"), // was: missing entirely
        db.raw("SUM(total_amount) as total_amount"), // was: invoiceGenerated
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount", // was: revenueCollected
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount", // was: pendingDues (now includes overdue)
        ),
      )
      .whereRaw(`YEAR(issue_date) = ?`, [currentYear])
      .groupByRaw("DATE_FORMAT(issue_date, '%M %Y')")
      .orderByRaw("MIN(issue_date) DESC");

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getMonthlyReports):", err);
    return [];
  }
};
