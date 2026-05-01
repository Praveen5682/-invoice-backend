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
        db.raw("TO_CHAR(issue_date, 'Mon') as month"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as revenue"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending")
      )
      .groupByRaw("TO_CHAR(issue_date, 'Mon')")
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
    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw("TO_CHAR(COALESCE(issue_date, created_at), 'FMMonth YYYY') as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("TO_CHAR(COALESCE(issue_date, created_at), 'FMMonth YYYY')")
      .orderByRaw("MIN(COALESCE(issue_date, created_at)) DESC");
    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getMonthlyReports):", err);
    return [];
  }
};

module.exports.getQuarterlyReports = async (userId) => {
  try {
    const data = await db("invoices")
      .where({ user_id: userId })
      .select(
        db.raw("'Q' || EXTRACT(QUARTER FROM COALESCE(issue_date, created_at)) || ' ' || EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)), EXTRACT(QUARTER FROM COALESCE(issue_date, created_at))")
      .orderByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) DESC, EXTRACT(QUARTER FROM COALESCE(issue_date, created_at)) DESC");
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
        db.raw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at))")
      .orderByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) DESC");
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
        db.raw("'Week ' || EXTRACT(WEEK FROM COALESCE(issue_date, created_at)) || ', ' || EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) as period"),
        db.raw("COUNT(id) as invoice_count"),
        db.raw("SUM(total_amount) as total_amount"),
        db.raw("SUM(COALESCE(amount_paid, 0)) as paid_amount"),
        db.raw("SUM(total_amount - COALESCE(amount_paid, 0)) as pending_amount")
      )
      .groupByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)), EXTRACT(WEEK FROM COALESCE(issue_date, created_at))")
      .orderByRaw("EXTRACT(YEAR FROM COALESCE(issue_date, created_at)) DESC, EXTRACT(WEEK FROM COALESCE(issue_date, created_at)) DESC")
      .limit(12);
    return data;
  } catch (err) {
    console.error("Dashboard Service Error (getWeeklyReports):", err);
    return [];
  }
};
