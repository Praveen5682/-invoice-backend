const db = require("../../../../config/db");

// 🔹 Create Invoice
module.exports.createInvoice = async (props = {}) => {
  const { 
    invoice_no, client_id, status, total_amount, 
    issue_date, due_date, notes, items 
  } = props;

  try {
    // 1. Check if client exists
    const client = await db("clients").where({ id: client_id }).first();
    if (!client) {
      const error = new Error("The selected client does not exist.");
      error.statusCode = 404;
      throw error;
    }

    // 2. Check for duplicate invoice number
    const existingInvoice = await db("invoices").where({ invoice_no }).first();
    if (existingInvoice) {
      const error = new Error(`Invoice number "${invoice_no}" is already in use.`);
      error.statusCode = 409;
      throw error;
    }

    let createdInvoice;

    await db.transaction(async (trx) => {
      // 3. Insert Invoice
      const [invoiceId] = await trx("invoices").insert({
        invoice_no,
        client_id,
        status,
        total_amount,
        issue_date,
        due_date,
        notes,
      });

      // 4. Insert Invoice Items
      const itemsToInsert = items.map(item => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount
      }));

      await trx("invoice_items").insert(itemsToInsert);

      createdInvoice = await trx("invoices").where({ id: invoiceId }).first();
    });

    return createdInvoice;
  } catch (error) {
    console.error("Service Error (createInvoice):", error);
    throw error;
  }
};

// 🔹 Get All Invoices (with Client Info)
module.exports.getInvoices = async () => {
  try {
    return await db("invoices as i")
      .join("clients as c", "i.client_id", "c.id")
      .select(
        "i.*",
        "c.name as client_name",
        "c.email as client_email"
      )
      .orderBy("i.created_at", "desc");
  } catch (error) {
    console.error("Service Error (getInvoices):", error);
    throw new Error("Failed to retrieve invoices from database.");
  }
};

// 🔹 Get Invoice by ID (with Items and Client Info)
module.exports.getInvoiceById = async (id) => {
  try {
    const invoice = await db("invoices as i")
      .join("clients as c", "i.client_id", "c.id")
      .select(
        "i.*",
        "c.name as client_name",
        "c.email as client_email",
        "c.phone as client_phone",
        "c.address as client_address"
      )
      .where("i.id", id)
      .first();

    if (!invoice) {
        const error = new Error("Invoice not found.");
        error.statusCode = 404;
        throw error;
    }

    const items = await db("invoice_items").where({ invoice_id: id });
    return { ...invoice, items };
  } catch (error) {
    console.error(`Service Error (getInvoiceById - ${id}):`, error);
    throw error;
  }
};

// 🔹 Update Invoice
module.exports.updateInvoice = async (id, props = {}) => {
  const { status, due_date, notes } = props;
  try {
    const invoice = await db("invoices").where({ id }).first();
    if (!invoice) {
        const error = new Error("Invoice not found.");
        error.statusCode = 404;
        throw error;
    }

    await db("invoices").where({ id }).update({
      status,
      due_date,
      notes,
      updated_at: db.fn.now(),
    });

    return await db("invoices").where({ id }).first();
  } catch (error) {
    console.error(`Service Error (updateInvoice - ${id}):`, error);
    throw error;
  }
};

// 🔹 Delete Invoice
module.exports.deleteInvoice = async (id) => {
  try {
    const invoice = await db("invoices").where({ id }).first();
    if (!invoice) {
        const error = new Error("Invoice not found.");
        error.statusCode = 404;
        throw error;
    }

    await db("invoices").where({ id }).del();
    return true;
  } catch (error) {
    console.error(`Service Error (deleteInvoice - ${id}):`, error);
    throw error;
  }
};
