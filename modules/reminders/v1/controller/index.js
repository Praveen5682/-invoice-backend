const service = require("../service/index");
const {
  createReminderSchema,
  updateReminderSchema,
} = require("../validator/index");

module.exports.getAllReminders = async (req, res) => {
  try {
    const reminders = await service.getAllReminders();
    return res.status(200).json({ success: true, data: reminders });
  } catch (err) {
    console.error("Reminder Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reminders." });
  }
};

module.exports.getReminderById = async (req, res) => {
  try {
    const reminder = await service.getReminderById(req.params.id);
    if (!reminder) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found." });
    }
    return res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    console.error("Reminder Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reminder." });
  }
};

module.exports.createReminder = async (req, res) => {
  try {
    const { error, value } = createReminderSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.createReminder(value);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res
      .status(201)
      .json({
        success: true,
        message: "Reminder created successfully.",
        data: response.data,
      });
  } catch (err) {
    console.error("Reminder Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create reminder." });
  }
};

module.exports.updateReminder = async (req, res) => {
  try {
    const { error, value } = updateReminderSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.updateReminder(req.params.id, value);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Reminder updated successfully.",
        data: response.data,
      });
  } catch (err) {
    console.error("Reminder Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update reminder." });
  }
};

module.exports.triggerReminder = async (req, res) => {
  try {
    const response = await service.triggerReminder(req.params.id);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(200).json({ success: true, message: response.message });
  } catch (err) {
    console.error("Reminder Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to trigger reminder." });
  }
};
