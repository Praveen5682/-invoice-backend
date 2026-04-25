const db = require("../../../../config/db");

module.exports.getAllPayments = async () => {
  try {
    const payments = await db("payments")
      .leftJoin("invoices", "payments.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "payments.*",
        "invoices.invoice_no",
        "clients.name as client_name",
      )
      .orderBy("payments.created_at", "desc");
    return payments;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch payments");
  }
};

module.exports.getPaymentById = async (id) => {
  try {
    const payment = await db("payments")
      .leftJoin("invoices", "payments.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "payments.*",
        "invoices.invoice_no",
        "clients.name as client_name",
      )
      .where({ "payments.id": id })
      .first();
    return payment;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch payment");
  }
};

module.exports.createPayment = async (data) => {
  const trx = await db.transaction();
  try {
    const [id] = await trx("payments").insert(data);

    // Let's also update the invoice if necessary, but for now just register it.
    // For example if payment captures full amount, mark invoice as Paid

    await trx.commit();
    const newPayment = await module.exports.getPaymentById(id);
    return { status: true, data: newPayment };
  } catch (err) {
    await trx.rollback();
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updatePayment = async (id, data) => {
  try {
    const updated = await db("payments").where({ id }).update(data);
    if (!updated) {
      return { status: false, message: "Payment not found" };
    }
    const updatedPayment = await module.exports.getPaymentById(id);
    return { status: true, data: updatedPayment };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
