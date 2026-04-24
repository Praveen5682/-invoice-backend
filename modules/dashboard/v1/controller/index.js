const service = require("../service/index");

module.exports.getOverview = async (req, res) => {
  try {
    const stats = await service.getStats();
    const chart = await service.getChartData();
    const reminders = await service.getOverdueReminders();

    return res.status(200).json({
      success: true,
      data: {
        stats,
        chart,
        reminders,
      },
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  }
};

module.exports.getReports = async (req, res) => {
  try {
    const { type } = req.query;
    let data;

    if (type === "Quarterly") {
      data = await service.getQuarterlyReports();
    } else if (type === "Yearly") {
      data = await service.getYearlyReports();
    } else {
      data = await service.getMonthlyReports();
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load reports data.",
    });
  }
};
