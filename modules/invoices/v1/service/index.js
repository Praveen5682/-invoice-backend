const db = require("../../../../config/db");

const parseJson = (val, fallback = null) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
};

module.exports.getAllInvoices = async (userId) => {
  try {
    const invoices = await db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .where("invoices.user_id", userId)
      .select(
        "invoices.id",
        "invoices.invoice_no",
        "invoices.client_id",
        "invoices.status",
        "invoices.total_amount",
        "invoices.subtotal",
        "invoices.issue_date",
        "invoices.due_date",
        "invoices.currency",
        "invoices.created_at",
        "invoices.updated_at",
        "invoices.notes",
        "invoices.amount_paid",
        "invoices.balance_due",

        // Client display fields with proper fallback
        db.raw(`
          COALESCE(
            clients.name, 
            invoices.client_name, 
            invoices.billing_address->>'line1',
            'Unknown Client'
          ) as client_name
        `),

        db.raw(`
          COALESCE(clients.email, invoices.client_email) as client_email
        `),

        db.raw(`
          COALESCE(clients.phone, invoices.client_phone) as client_phone
        `),

        "invoices.billing_address",
        "invoices.shipping_address",
        "invoices.client_gstin",
        "invoices.client_pan",
      )
      .orderBy("invoices.created_at", "desc");

    return invoices.map((inv) => ({
      ...inv,
      billing_address: parseJson(inv.billing_address),
      shipping_address: parseJson(inv.shipping_address),
      // Keep raw JSON if needed by frontend, or fully parsed
    }));
  } catch (err) {
    console.error("Get All Invoices Error:", err);
    throw new Error("Failed to fetch invoices");
  }
};

module.exports.getInvoiceById = async (id, userId) => {
  try {
    const query = db("invoices")
      .leftJoin("clients", "invoices.client_id", "clients.id")
      .select(
        "invoices.*",
        "clients.name as client_master_name",
        "clients.email as client_master_email",
        "clients.phone as client_master_phone",
        "clients.address as client_master_address",
        "users.company_name as user_company_name",
        "users.company_logo as user_company_logo",
        "users.address as user_company_address",
        "users.phone as user_company_phone",
        "users.gst_number as user_company_gstin"
      )
      .leftJoin("users", "invoices.user_id", "users.id")
      .where("invoices.id", id);

    if (userId) {
      query.andWhere("invoices.user_id", userId);
    }

    const invoice = await query.first();
    if (!invoice) return null;

    // Fetch invoice items
    const items = await db("invoice_items")
      .where({ invoice_id: id })
      .select("*");

    // Parse JSON fields
    invoice.items = items;
    invoice.bank_details = parseJson(invoice.bank_details);
    invoice.signature = parseJson(invoice.signature);
    invoice.billing_address = parseJson(invoice.billing_address);
    invoice.shipping_address = parseJson(invoice.shipping_address);

    return invoice;
  } catch (err) {
    console.error("Get Invoice By Id Error:", err);
    throw new Error("Failed to fetch invoice");
  }
};

const prepareInvoiceData = (data, userId) => {
  const { items, client, bank_details, signature, ...invoiceData } = data;

  invoiceData.user_id = userId;

  // JSON fields
  if (bank_details) invoiceData.bank_details = JSON.stringify(bank_details);
  if (signature) invoiceData.signature = JSON.stringify(signature);

  // Client information (denormalized for invoice snapshot)
  if (client) {
    invoiceData.client_name = client.name || null;
    invoiceData.client_email = client.email || null;
    invoiceData.client_phone = client.phone || null;
    invoiceData.client_gstin = client.gstin || null;
    invoiceData.client_pan = client.pan || null;
    invoiceData.client_website = client.website || null;
    invoiceData.place_of_supply = client.place_of_supply || null;

    if (client.billing_address) {
      invoiceData.billing_address = JSON.stringify(client.billing_address);
    }
    if (client.shipping_address) {
      invoiceData.shipping_address = JSON.stringify(client.shipping_address);
    }
  }

  return { invoiceData, items };
};

module.exports.createInvoice = async (data, userId) => {
  const trx = await db.transaction();
  try {
    // Check duplicate invoice number
    const existing = await trx("invoices")
      .where({ invoice_no: data.invoice_no, user_id: userId })
      .first();

    if (existing) {
      await trx.rollback();
      return { status: false, message: "Invoice number already exists" };
    }

    const { invoiceData, items } = prepareInvoiceData(data, userId);

    const [invoiceId] = await trx("invoices")
      .insert(invoiceData)
      .returning("id");

    // Insert invoice items
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
    // Verify ownership
    const existingInvoice = await trx("invoices")
      .where({ id, user_id: userId })
      .first();

    if (!existingInvoice) {
      await trx.rollback();
      return { status: false, message: "Invoice not found or unauthorized" };
    }

    // Check duplicate invoice_no if it's being updated
    if (data.invoice_no && data.invoice_no !== existingInvoice.invoice_no) {
      const duplicate = await trx("invoices")
        .where({ invoice_no: data.invoice_no, user_id: userId })
        .whereNot("id", id)
        .first();

      if (duplicate) {
        await trx.rollback();
        return { status: false, message: "Invoice number already exists" };
      }
    }

    const { invoiceData, items } = prepareInvoiceData(data, userId);

    await trx("invoices").where({ id, user_id: userId }).update(invoiceData);

    // Update items (replace all)
    if (items !== undefined) {
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

    if (!deleted) {
      return { status: false, message: "Invoice not found or unauthorized" };
    }

    return { status: true, message: "Invoice deleted successfully" };
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateInvoiceStatus = async (id, status, userId) => {
  try {
    const allowedStatuses = ["paid", "pending", "overdue", "draft"];

    if (!allowedStatuses.includes(status)) {
      return { status: false, message: "Invalid status value" };
    }

    const updated = await db("invoices")
      .where({ id, user_id: userId })
      .update({ status, updated_at: db.fn.now() });

    if (!updated) {
      return { status: false, message: "Invoice not found or unauthorized" };
    }

    return { status: true, message: "Status updated successfully" };
  } catch (err) {
    console.error("Update Invoice Status Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
module.exports.getPublicInvoice = async (id) => {
  try {
    const invoice = await module.exports.getInvoiceById(id, null);
    if (!invoice) return null;

    // Filter sensitive info if needed, but for now we need most of it for the invoice view
    return invoice;
  } catch (err) {
    console.error("Get Public Invoice Error:", err);
    throw new Error("Failed to fetch invoice");
  }
};
