const db = require("../../../../config/db");
const { sendReminderEmail } = require("../../../../utils/mailer");

module.exports.getAllReminders = async (userId) => {
  try {
    const reminders = await db("reminders")
      .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("reminders.user_id", userId)
      .select(
        "reminders.*",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.due_date",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .orderBy("reminders.created_at", "desc");
    return reminders;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch reminders");
  }
};

module.exports.getReminderById = async (id, userId) => {
  try {
    const query = db("reminders")
      .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("reminders.id", id)
      .select(
        "reminders.*",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.due_date",
        "clients.name as client_name",
        "clients.email as client_email",
      );

    if (userId) query.andWhere("reminders.user_id", userId);

    return await query.first();
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch reminder");
  }
};

module.exports.createReminder = async (data, userId) => {
  try {
    const [result] = await db("reminders").insert({ ...data, user_id: userId }).returning("id");
    const id = typeof result === "object" ? result.id : result;
    const newReminder = await module.exports.getReminderById(id, userId);
    return { status: true, data: newReminder };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateReminder = async (id, data, userId) => {
  try {
    const updated = await db("reminders")
      .where({ id, user_id: userId })
      .update(data);

    if (!updated) {
      return { status: false, message: "Reminder not found" };
    }
    const updatedReminder = await module.exports.getReminderById(id, userId);
    return { status: true, data: updatedReminder };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.triggerReminder = async (id, userId) => {
  try {
    const reminder = await module.exports.getReminderById(id, userId);
    if (!reminder) {
      return { status: false, message: "Reminder not found" };
    }

    if (reminder.type === "email") {
      const emailSent = await sendReminderEmail(
        reminder.client_email,
        reminder.client_name,
        reminder.invoice_no,
        reminder.total_amount,
        reminder.due_date,
      );

      if (emailSent) {
        await db("reminders").where({ id }).update({
          status: "sent",
          last_sent: new Date(),
        });
        return { status: true, message: "Reminder sent successfully" };
      } else {
        await db("reminders").where({ id }).update({ status: "failed" });
        return { status: false, message: "Failed to send email" };
      }
    } else {
      return {
        status: false,
        message: "Only email reminders are currently supported.",
      };
    }
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.processReminders = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    await db("reminders")
      .where("status", "pending")
      .where("reminder_date", "<", today)
      .update({ status: "overdue" });

    const remindersToSend = await db("reminders")
      .leftJoin("invoices", "reminders.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "reminders.*",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.due_date",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .where("reminders.status", "pending")
      .where("reminders.reminder_date", "<=", today);

    const results = [];

    for (const reminder of remindersToSend) {
      if (reminder.type === "email" && reminder.client_email) {
        const emailSent = await sendReminderEmail(
          reminder.client_email,
          reminder.client_name,
          reminder.invoice_no,
          reminder.total_amount,
          reminder.due_date,
        );

        if (emailSent) {
          await db("reminders").where({ id: reminder.id }).update({
            status: "sent",
            last_sent: new Date(),
          });
          results.push({ id: reminder.id, status: "sent" });
        } else {
          await db("reminders")
            .where({ id: reminder.id })
            .update({ status: "failed" });
          results.push({ id: reminder.id, status: "failed" });
        }
      }
    }

    return { success: true, processed: results.length, details: results };
  } catch (err) {
    console.error("Process Reminders Error:", err);
    throw err;
  }
};
