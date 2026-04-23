  const express = require("express");
  const cors = require("cors");
  const gateway = require("./apigateway/gateway");
  require("./utils/cron"); // Initialize cron jobs
  require("dotenv").config();

  const app = express();

  app.use(express.json());
  app.use(cors());

  // Register API gateway
  gateway(app);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
