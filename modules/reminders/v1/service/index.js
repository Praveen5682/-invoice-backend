const db = require("../../../../config/db");

// 🔹 Get All Reminders
module.exports.getReminders = async () => {
    try {
        return await db("reminders as r")
            .join("invoices as i", "r.invoice_id", "i.id")
            .join("clients as c", "i.client_id", "c.id")
            .select(
                "r.*",
                "i.invoice_no",
                "i.total_amount",
                "i.due_date",
                "c.name as client_name",
                "c.email as client_email"
            )
            .orderBy("r.reminder_date", "asc");
    } catch (error) {
        console.error("Service Error (getReminders):", error);
        throw new Error("Failed to fetch reminders.");
    }
};

// 🔹 Create Reminder
module.exports.createReminder = async (props = {}) => {
    const { invoice_id, reminder_date } = props;
    try {
        const [id] = await db("reminders").insert({
            invoice_id,
            reminder_date,
            status: "upcoming"
        });
        return await db("reminders").where({ id }).first();
    } catch (error) {
        console.error("Service Error (createReminder):", error);
        throw error;
    }
};

// 🔹 Trigger Reminder (Simulated)
module.exports.triggerReminder = async (id) => {
    try {
        const reminder = await db("reminders").where({ id }).first();
        if (!reminder) throw new Error("Reminder not found");

        // Here you would integrate with NodeMailer
        console.log(`Sending reminder for invoice ${reminder.invoice_id}...`);

        await db("reminders").where({ id }).update({
            last_sent: db.fn.now(),
            status: "sent"
        });

        return true;
    } catch (error) {
        console.error("Service Error (triggerReminder):", error);
        throw error;
    }
};
