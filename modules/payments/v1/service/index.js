const db = require("../../../../config/db");

module.exports.getAllPayments = async (userId) => {
  try {
    const payments = await db("payments")
      .leftJoin("invoices", "payments.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("payments.user_id", userId)
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

module.exports.getPaymentById = async (id, userId) => {
  try {
    const payment = await db("payments")
      .leftJoin("invoices", "payments.invoice_id", "invoices.id")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("payments.id", id)
      .andWhere("payments.user_id", userId)
      .select(
        "payments.*",
        "invoices.invoice_no",
        "clients.name as client_name",
      )
      .first();
    return payment;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch payment");
  }
};

const syncInvoicePayments = async (invoiceId, userId, trx) => {
  const dbHandle = trx || db;

  // 1. Get sum of all captured payments for this invoice
  const [result] = await dbHandle("payments")
    .where({ invoice_id: invoiceId, user_id: userId, status: "captured" })
    .sum("amount as total_paid");

  const totalPaid = Number(result.total_paid || 0);

  // 2. Get total amount of the invoice
  const invoice = await dbHandle("invoices")
    .where({ id: invoiceId, user_id: userId })
    .select("total_amount")
    .first();

  if (!invoice) return;

  const totalAmount = Number(invoice.total_amount || 0);
  const balanceDue = totalAmount - totalPaid;

  // 3. Update invoice
  await dbHandle("invoices")
    .where({ id: invoiceId, user_id: userId })
    .update({
      amount_paid: totalPaid,
      balance_due: balanceDue,
      updated_at: dbHandle.fn.now(),
    });
};

module.exports.createPayment = async (data, userId) => {
  const trx = await db.transaction();
  try {
    const insertData = { ...data, user_id: userId };
    if (!insertData.transaction_id || insertData.transaction_id.trim() === "") {
      delete insertData.transaction_id;
    }

    const [result] = await trx("payments").insert(insertData).returning("id");
    const id = typeof result === "object" ? result.id : result;

    // Sync invoice if captured
    if (insertData.invoice_id) {
      await syncInvoicePayments(insertData.invoice_id, userId, trx);
    }

    await trx.commit();
    const newPayment = await module.exports.getPaymentById(id, userId);
    return { status: true, data: newPayment };
  } catch (err) {
    await trx.rollback();
    console.error("Service Error:", err);
    if ((err.code === "ER_DUP_ENTRY" || err.code === "23505") && (err.sqlMessage?.includes("transaction_id") || err.detail?.includes("transaction_id"))) {
      return { status: false, message: "Transaction ID already exists." };
    }
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updatePayment = async (id, data, userId) => {
  const trx = await db.transaction();
  try {
    const updateData = { ...data };
    if (updateData.transaction_id !== undefined && updateData.transaction_id.trim() === "") {
      updateData.transaction_id = null;
    }

    const paymentBefore = await trx("payments").where({ id, user_id: userId }).first();
    if (!paymentBefore) {
      await trx.rollback();
      return { status: false, message: "Payment not found" };
    }

    await trx("payments").where({ id, user_id: userId }).update(updateData);

    // Sync invoice
    await syncInvoicePayments(paymentBefore.invoice_id, userId, trx);

    await trx.commit();
    const updatedPayment = await module.exports.getPaymentById(id, userId);
    return { status: true, data: updatedPayment };
  } catch (err) {
    await trx.rollback();
    console.error("Service Error:", err);
    if ((err.code === "ER_DUP_ENTRY" || err.code === "23505") && (err.sqlMessage?.includes("transaction_id") || err.detail?.includes("transaction_id"))) {
      return { status: false, message: "Transaction ID already exists." };
    }
    return { status: false, message: "Internal server error" };
  }
};
