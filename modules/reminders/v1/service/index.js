const db = require("../../../../config/db");
const { sendReminderEmail } = require("../../../../utils/mailer");

module.exports.getAllReminders = async () => {
    try {
        const reminders = await db("reminders")
            .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
            .leftJoin("clients", "invoices.client_id", "clients.id")
            .select(
                "reminders.*",
                "invoices.invoice_no",
                "invoices.total_amount",
                "invoices.due_date",
                "clients.name as client_name",
                "clients.email as client_email"
            )
            .orderBy("reminders.created_at", "desc");
        return reminders;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch reminders");
    }
};

module.exports.getReminderById = async (id) => {
    try {
        const reminder = await db("reminders")
            .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
            .leftJoin("clients", "invoices.client_id", "clients.id")
            .select(
                "reminders.*",
                "invoices.invoice_no",
                "invoices.total_amount",
                "invoices.due_date",
                "clients.name as client_name",
                "clients.email as client_email"
            )
            .where({ "reminders.id": id })
            .first();
        return reminder;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch reminder");
    }
};

module.exports.createReminder = async (data) => {
    try {
        const [id] = await db("reminders").insert(data);
        const newReminder = await this.getReminderById(id);
        return { status: true, data: newReminder };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.updateReminder = async (id, data) => {
    try {
        const updated = await db("reminders").where({ id }).update(data);
        if (!updated) {
            return { status: false, message: "Reminder not found" };
        }
        const updatedReminder = await this.getReminderById(id);
        return { status: true, data: updatedReminder };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.triggerReminder = async (id) => {
    try {
        const reminder = await this.getReminderById(id);
        if (!reminder) {
            return { status: false, message: "Reminder not found" };
        }

        if (reminder.type === "email") {
            const emailSent = await sendReminderEmail(
                reminder.client_email,
                reminder.client_name,
                reminder.invoice_no,
                reminder.total_amount,
                reminder.due_date
            );

            if (emailSent) {
                await db("reminders").where({ id }).update({
                    status: "sent",
                    last_sent: new Date()
                });
                return { status: true, message: "Reminder sent successfully" };
            } else {
                await db("reminders").where({ id }).update({ status: "failed" });
                return { status: false, message: "Failed to send email" };
            }
        } else {
            return { status: false, message: "Only email reminders are currently supported." };
        }
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};
