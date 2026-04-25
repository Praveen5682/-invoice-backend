const express = require("express");
const cors = require("cors");
const gateway = require("./apigateway/gateway");
require("./utils/cron"); // Initialize cron jobs
require("dotenv").config();

const cron = require("node-cron");
const reminderService = require("./modules/reminders/v1/service/index");

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily reminder job...");
  try {
    const result = await reminderService.processReminders();
    console.log(
      `Reminder job completed: ${result.processed} reminders processed`,
    );
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});

const app = express();

app.use(express.json());
app.use(cors());

// Register API gateway
gateway(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
