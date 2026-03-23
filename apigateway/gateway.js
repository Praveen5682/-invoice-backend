const { dbCheck } = require("../middleware/dbCheck");
const routes = require("../routes/index");

module.exports = (app) => {
  // Dev and Live APIs
  app.use("/api/ont/v1/dev", dbCheck, routes);
  app.use("/api/ont/v1/live", dbCheck, routes);

  // Health check
  app.get("/", (req, res) =>
    res.status(200).send({ message: "Server Running Successfully! 👍🏻" }),
  );

  // 404 handler
  app.use((req, res) => {
    res.status(404).send({ error: "Route not found" });
  });
};
