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
        db.raw("TO_CHAR(issue_date, 'FMMonth') as month"),
        db.raw("SUM(total_amount) as amount"),
      )
      .groupByRaw("TO_CHAR(issue_date, 'FMMonth')")
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
        db.raw("TO_CHAR(issue_date, 'FMMonth YYYY') as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .whereRaw("EXTRACT(YEAR FROM issue_date) = ?", [currentYear])
      .groupByRaw("TO_CHAR(issue_date, 'FMMonth YYYY')")
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
          "'Q' || EXTRACT(QUARTER FROM issue_date) || ' ' || EXTRACT(YEAR FROM issue_date) as period",
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
      .whereRaw("EXTRACT(YEAR FROM issue_date) = ?", [currentYear])
      .groupByRaw("EXTRACT(QUARTER FROM issue_date), EXTRACT(YEAR FROM issue_date)")
      .orderByRaw("EXTRACT(YEAR FROM issue_date) DESC, EXTRACT(QUARTER FROM issue_date) DESC");

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
        db.raw("EXTRACT(YEAR FROM issue_date) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw(
          "SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount",
        ),
        db.raw(
          "SUM(CASE WHEN status IN ('pending', 'overdue') THEN total_amount ELSE 0 END) as pending_amount",
        ),
      )
      .groupByRaw("EXTRACT(YEAR FROM issue_date)")
      .orderByRaw("EXTRACT(YEAR FROM issue_date) DESC");

    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getYearlyReports):", err);
    return [];
  }
};
