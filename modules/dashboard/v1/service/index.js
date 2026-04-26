const db = require("../../../../config/db");

module.exports.getStats = async (userId) => {
  try {
    const [totalRevenueResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "paid", user_id: userId });

    const [pendingAmountResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "pending", user_id: userId });

    const [overdueAmountResult] = await db("invoices")
      .sum("total_amount as sum")
      .where({ status: "overdue", user_id: userId });

    const [invoicesCountResult] = await db("invoices")
      .count("id as count")
      .where({ user_id: userId });

    const [activeClientsResult] = await db("clients")
      .count("id as count")
      .where({ user_id: userId });

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

module.exports.getChartData = async (userId) => {
  try {
    const data = await db("invoices")
      .where({ user_id: userId })
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

module.exports.getOverdueReminders = async (userId) => {
  try {
    const reminders = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where({ "invoices.status": "overdue", "invoices.user_id": userId })
      .select(
        "invoices.id",
        "clients.name as client_name",
        "invoices.total_amount",
        "invoices.due_date as reminder_date",
        "invoices.id as invoice_id",
      )
      .orderBy("invoices.due_date", "asc")
      .limit(5);

    return reminders;
  } catch (err) {
    console.error("Dashboard Service Error (getOverdueReminders):", err);
    return [];
  }
};

module.exports.getMonthlyReports = async (userId) => {
  try {
    const currentYear = new Date().getFullYear();

    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw("DATE_FORMAT(issue_date, '%M %Y') as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .whereRaw("YEAR(issue_date) = ?", [currentYear])
      .groupByRaw("DATE_FORMAT(issue_date, '%M %Y')")
      .orderByRaw("MIN(issue_date) DESC");

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getMonthlyReports):", err);
    return [];
  }
};

module.exports.getQuarterlyReports = async (userId) => {
  try {
    const currentYear = new Date().getFullYear();

    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw(
          "CONCAT('Q', QUARTER(issue_date), ' ', YEAR(issue_date)) as period",
        ),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .whereRaw("YEAR(issue_date) = ?", [currentYear])
      .groupByRaw("QUARTER(issue_date), YEAR(issue_date)")
      .orderByRaw("YEAR(issue_date) DESC, QUARTER(issue_date) DESC");

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getQuarterlyReports):", err);
    return [];
  }
};

module.exports.getYearlyReports = async (userId) => {
  try {
    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw("YEAR(issue_date) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .groupByRaw("YEAR(issue_date)")
      .orderByRaw("YEAR(issue_date) DESC");

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getYearlyReports):", err);
    return [];
  }
};
