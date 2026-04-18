const dbCheck = require("../middleware/dbCheck");
const routes = require("../routes/index");

module.exports = (app) => {
  // Dev and Live API's
  app.use("/api/v1", dbCheck, routes);
  app.use("/api/invoice/v1/dev", dbCheck, routes);
  app.use("/api/invoice/v1/live", dbCheck, routes);

  // Health check
  app.get("/", (req, res) =>
    res.status(200).send({ message: "Server Running Successfully! 👍🏻" }),
  );

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });
};
