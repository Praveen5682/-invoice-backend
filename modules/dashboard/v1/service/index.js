const db = require("../../../../config/db");

module.exports.getStats = async (userId) => {
  try {
    // 1. Get sum of all amount_paid across all invoices for this user
    const [revenueResult] = await db("invoices")
      .sum("amount_paid as sum")
      .where({ user_id: userId });

    // 2. Get sum of pending amount (total - paid) for invoices not fully paid
    const [pendingResult] = await db("invoices")
      .select(db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as sum"))
      .where({ user_id: userId })
      .andWhere(db.raw("total_amount > COALESCE(amount_paid, 0)"));

    // 3. Get sum of overdue amount (only if due_date < today)
    const today = new Date().toISOString().split("T")[0];
    const [overdueResult] = await db("invoices")
      .select(db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as sum"))
      .where({ user_id: userId })
      .andWhere(db.raw("total_amount > COALESCE(amount_paid, 0)"))
      .andWhere("due_date", "<", today);

    const [invoicesCountResult] = await db("invoices")
      .count("id as count")
      .where({ user_id: userId });

    const [activeClientsResult] = await db("clients")
      .count("id as count")
      .where({ user_id: userId });

    return {
      total_invoices: invoicesCountResult?.count || 0,
      total_revenue: revenueResult?.sum || 0,
      pending_amount: pendingResult?.sum || 0,
      overdue_amount: overdueResult?.sum || 0,
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
        db.raw("DATE_FORMAT(issue_date, '%b') as month"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as revenue"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending")
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
    const today = new Date().toISOString().split("T")[0];
    const reminders = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where({ "invoices.user_id": userId })
      .andWhere("invoices.due_date", "<", today)
      .andWhere(db.raw("invoices.total_amount > COALESCE(invoices.amount_paid, 0)"))
      .select(
        "invoices.id",
        db.raw("COALESCE(clients.name, invoices.client_name) as name"),
        db.raw("(invoices.total_amount - COALESCE(invoices.amount_paid, 0)) as total_amount"),
        "invoices.due_date as reminder_date",
        "invoices.id as invoice_id"
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
        db.raw("DATE_FORMAT(COALESCE(issue_date, created_at), '%M %Y') as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .whereRaw("YEAR(COALESCE(issue_date, created_at)) = ?", [currentYear])
      .groupByRaw("DATE_FORMAT(COALESCE(issue_date, created_at), '%M %Y')")
      .orderByRaw("MIN(COALESCE(issue_date, created_at)) DESC");
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
        db.raw("CONCAT('Q', QUARTER(COALESCE(issue_date, created_at)), ' ', YEAR(COALESCE(issue_date, created_at))) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .whereRaw("YEAR(COALESCE(issue_date, created_at)) = ?", [currentYear])
      .groupByRaw("QUARTER(COALESCE(issue_date, created_at)), YEAR(COALESCE(issue_date, created_at))")
      .orderByRaw("YEAR(COALESCE(issue_date, created_at)) DESC, QUARTER(COALESCE(issue_date, created_at)) DESC");
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
        db.raw("YEAR(COALESCE(issue_date, created_at)) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("YEAR(COALESCE(issue_date, created_at))")
      .orderByRaw("YEAR(COALESCE(issue_date, created_at)) DESC");
    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getYearlyReports):", err);
    return [];
  }
};

module.exports.getWeeklyReports = async (userId) => {
  try {
    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw("CONCAT('Week ', WEEK(COALESCE(issue_date, created_at)), ', ', YEAR(COALESCE(issue_date, created_at))) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("YEARWEEK(COALESCE(issue_date, created_at))")
      .orderByRaw("YEARWEEK(COALESCE(issue_date, created_at)) DESC")
      .limit(12);
    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getWeeklyReports):", err);
    return [];
  }
};
