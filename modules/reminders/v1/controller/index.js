const reminderService = require("../service");

// 🔹 Get All Reminders
module.exports.getReminders = async (req, res) => {
    try {
        const reminders = await reminderService.getReminders();
        res.status(200).json({
            success: true,
            data: reminders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 🔹 Create Reminder
module.exports.createReminder = async (req, res) => {
    try {
        const reminder = await reminderService.createReminder(req.body);
        res.status(201).json({
            success: true,
            data: reminder,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// 🔹 Trigger Reminder
module.exports.triggerReminder = async (req, res) => {
    try {
        await reminderService.triggerReminder(req.params.id);
        res.status(200).json({
            success: true,
            message: "Reminder sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
