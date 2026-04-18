const service = require("../service/index");

// 🔹 Get Dashboard Overview
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

// 🔹 Get Monthly Reports
module.exports.getReports = async (req, res) => {
  try {
    const data = await service.getMonthlyReports();
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
