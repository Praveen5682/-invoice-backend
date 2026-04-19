const db = require("../../../../config/db");

module.exports.getAllInvoices = async () => {
  try {
    const invoices = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "invoices.id as id",
        "invoices.invoice_no",
        "invoices.client_id",
        "invoices.status",
        "invoices.total_amount",
        "invoices.issue_date",
        "invoices.due_date",
        "invoices.notes",
        "invoices.created_at",
        "invoices.updated_at",
        "invoices.currency",
        "invoices.subtotal",
        "invoices.discount_type",
        "invoices.discount_value",
        "invoices.shipping_charge",
        "invoices.gst_rate",
        "invoices.gst_amount",
        "invoices.tds_rate",
        "invoices.tds_amount",
        "invoices.amount_paid",
        "invoices.balance_due",
        "invoices.payment_terms",
        "invoices.terms",
        "invoices.bank_details",


        "clients.name",
        "clients.email",
        "clients.phone",
        "clients.address",
      )
      .orderBy("invoices.created_at", "desc");
    return invoices;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch invoices");
  }
};

module.exports.getInvoiceById = async (id) => {
  try {
    const invoice = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "invoices.id as id",
        "invoices.*",
        "clients.name",
        "clients.email",
        "clients.phone",
        "clients.address",
      )
      .where({ "invoices.id": id })
      .first();
    if (!invoice) return null;

    const items = await db("invoice_items").where({ invoice_id: id });
    invoice.items = items;
    return invoice;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch invoice");
  }
};

module.exports.createInvoice = async (data) => {
  const trx = await db.transaction();

  try {
    const existing = await trx("invoices")
      .where({ invoice_no: data.invoice_no })
      .first();

    if (existing) {
      await trx.rollback();
      return { status: false, message: "Invoice number already exists" };
    }

    const { items, client, bank_details, signature, ...invoiceData } = data;

    // Handle JSON fields
    if (bank_details) invoiceData.bank_details = JSON.stringify(bank_details);
    if (signature) invoiceData.signature = JSON.stringify(signature);

    const [invoiceId] = await trx("invoices").insert(invoiceData);

    if (items && items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        amount: item.amount,
      }));
      await trx("invoice_items").insert(itemsToInsert);
    }

    await trx.commit();
    const invoice = await this.getInvoiceById(invoiceId);
    return { status: true, data: invoice };
  } catch (err) {
    await trx.rollback();
    console.error("Create Invoice Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateInvoice = async (id, data) => {
  const trx = await db.transaction();
  try {
    const { items, client, bank_details, signature, ...invoiceData } = data;

    // Handle JSON fields
    if (bank_details) invoiceData.bank_details = JSON.stringify(bank_details);
    if (signature) invoiceData.signature = JSON.stringify(signature);

    const updated = await trx("invoices").where({ id }).update(invoiceData);

    if (!updated) {
      await trx.rollback();
      return { status: false, message: "Invoice not found" };
    }

    if (items) {
      // Sync items: Delete existing and re-insert new
      await trx("invoice_items").where({ invoice_id: id }).del();

      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          amount: item.amount,
        }));
        await trx("invoice_items").insert(itemsToInsert);
      }
    }

    await trx.commit();
    const updatedInvoice = await this.getInvoiceById(id);
    return { status: true, data: updatedInvoice };
  } catch (err) {
    await trx.rollback();
    console.error("Update Invoice Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.deleteInvoice = async (id) => {
  try {
    const deleted = await db("invoices").where({ id }).del();
    if (!deleted) {
      return { status: false, message: "Invoice not found" };
    }
    return { status: true, message: "Invoice deleted successfully" };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
