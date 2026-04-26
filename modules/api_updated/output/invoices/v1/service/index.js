const db = require("../../../../config/db");

module.exports.getAllInvoices = async (userId) => {
  try {
    const invoices = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("invoices.user_id", userId)
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
        "invoices.billing_address",
        "invoices.client_phone",
        db.raw(
          "COALESCE(clients.name, invoices.billing_address->>'$.line1', 'Unknown') as name",
        ),
        db.raw("COALESCE(clients.email, NULL) as email"),
        db.raw("COALESCE(clients.phone, invoices.client_phone) as phone"),
        db.raw("COALESCE(clients.address, NULL) as address"),
      )
      .orderBy("invoices.created_at", "desc");

    return invoices.map((inv) => {
      if (!inv.client_id) {
        const billing =
          typeof inv.billing_address === "string"
            ? JSON.parse(inv.billing_address || "{}")
            : inv.billing_address || {};

        return {
          ...inv,
          phone: inv.phone || inv.client_phone || null,
          address:
            [billing.line1, billing.city, billing.state]
              .filter(Boolean)
              .join(", ") || null,
        };
      }
      return inv;
    });
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch invoices");
  }
};

const parseJson = (val, fallback = {}) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
};

module.exports.getInvoiceById = async (id, userId) => {
  try {
    const query = db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "invoices.id as id",
        "invoices.*",
        "clients.name",
        "clients.email",
        "clients.phone",
        "clients.address",
      )
      .where({ "invoices.id": id });

    // If userId provided, scope to user
    if (userId) query.andWhere("invoices.user_id", userId);

    const invoice = await query.first();
    if (!invoice) return null;

    const items = await db("invoice_items").where({ invoice_id: id });
    invoice.items = items;

    invoice.bank_details = parseJson(invoice.bank_details);
    invoice.signature = parseJson(invoice.signature);
    invoice.billing_address = parseJson(invoice.billing_address);
    invoice.shipping_address = parseJson(invoice.shipping_address);

    return invoice;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch invoice");
  }
};

module.exports.createInvoice = async (data, userId) => {
  const trx = await db.transaction();
  try {
    const existing = await trx("invoices")
      .where({ invoice_no: data.invoice_no, user_id: userId })
      .first();

    if (existing) {
      await trx.rollback();
      return { status: false, message: "Invoice number already exists" };
    }

    const { items, client, bank_details, signature, ...invoiceData } = data;

    invoiceData.user_id = userId;
    invoiceData.client_id = data.client_id || null;

    if (bank_details) invoiceData.bank_details = JSON.stringify(bank_details);
    if (signature) invoiceData.signature = JSON.stringify(signature);

    if (client) {
      invoiceData.client_gstin = client.gstin || null;
      invoiceData.client_pan = client.pan || null;
      invoiceData.client_website = client.website || null;
      invoiceData.client_phone = client.phone || null;
      invoiceData.place_of_supply = client.place_of_supply || null;

      if (client.billing_address)
        invoiceData.billing_address = JSON.stringify(client.billing_address);
      if (client.shipping_address)
        invoiceData.shipping_address = JSON.stringify(client.shipping_address);
    }

    const [invoiceId] = await trx("invoices").insert(invoiceData);

    if (items && items.length > 0) {
      await trx("invoice_items").insert(
        items.map((item) => ({
          invoice_id: invoiceId,
          user_id: userId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          amount: item.amount,
        })),
      );
    }

    await trx.commit();
    const invoice = await module.exports.getInvoiceById(invoiceId, userId);
    return { status: true, data: invoice };
  } catch (err) {
    await trx.rollback();
    console.error("Create Invoice Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateInvoice = async (id, data, userId) => {
  const trx = await db.transaction();
  try {
    // Ensure invoice belongs to this user
    const invoice = await trx("invoices").where({ id, user_id: userId }).first();
    if (!invoice) {
      await trx.rollback();
      return { status: false, message: "Invoice not found or unauthorized" };
    }

    const { items, client, bank_details, signature, ...invoiceData } = data;

    if (bank_details) invoiceData.bank_details = JSON.stringify(bank_details);
    if (signature) invoiceData.signature = JSON.stringify(signature);

    if (client) {
      if (client.gstin !== undefined) invoiceData.client_gstin = client.gstin || null;
      if (client.pan !== undefined) invoiceData.client_pan = client.pan || null;
      if (client.website !== undefined) invoiceData.client_website = client.website || null;
      if (client.phone !== undefined) invoiceData.client_phone = client.phone || null;
      if (client.place_of_supply !== undefined)
        invoiceData.place_of_supply = client.place_of_supply || null;

      if (client.billing_address)
        invoiceData.billing_address = JSON.stringify(client.billing_address);
      if (client.shipping_address)
        invoiceData.shipping_address = JSON.stringify(client.shipping_address);
    }

    await trx("invoices").where({ id, user_id: userId }).update(invoiceData);

    if (items) {
      await trx("invoice_items").where({ invoice_id: id }).del();
      if (items.length > 0) {
        await trx("invoice_items").insert(
          items.map((item) => ({
            invoice_id: id,
            user_id: userId,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate || 0,
            amount: item.amount,
          })),
        );
      }
    }

    await trx.commit();
    const updatedInvoice = await module.exports.getInvoiceById(id, userId);
    return { status: true, data: updatedInvoice };
  } catch (err) {
    await trx.rollback();
    console.error("Update Invoice Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.deleteInvoice = async (id, userId) => {
  try {
    const deleted = await db("invoices").where({ id, user_id: userId }).del();
    if (!deleted) return { status: false, message: "Invoice not found" };
    return { status: true, message: "Invoice deleted successfully" };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateInvoiceStatus = async (id, status, userId) => {
  try {
    const updated = await db("invoices")
      .where({ id, user_id: userId })
      .update({ status });
    if (!updated) return { status: false, message: "Invoice not found" };
    return { status: true, message: "Status updated successfully" };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
