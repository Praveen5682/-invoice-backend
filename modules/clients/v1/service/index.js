const db = require("../../../../config/db");

module.exports.getAllClients = async () => {
  try {
    const clients = await db("clients")
      .select("*")
      .orderBy("created_at", "desc");
    return clients;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch clients from database");
  }
};

module.exports.getClientById = async (id) => {
  try {
    const rows = await db("clients")
      .leftJoin("invoices", "clients.id", "invoices.client_id")
      .where("clients.id", id)
      .select(
        "clients.*",
        "invoices.id as invoice_id",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.status",
        "invoices.created_at as invoice_date",
      );

    if (!rows.length) return null;

    // Extract client
    const client = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone,
      address: rows[0].address,
      contact_person: rows[0].contact_person, // ✅
      gstin: rows[0].gstin, // ✅
      city: rows[0].city, // ✅
      state: rows[0].state, // ✅
      zip: rows[0].zip, // ✅
      payment_terms: rows[0].payment_terms, // ✅
      created_at: rows[0].created_at,
      invoices: [],
    };
    // Attach invoices
    rows.forEach((row) => {
      if (row.invoice_id) {
        client.invoices.push({
          id: row.invoice_id,
          invoice_no: row.invoice_no,
          total_amount: row.total_amount,
          status: row.status,
          date: row.invoice_date,
        });
      }
    });

    return client;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch client with invoices");
  }
};

module.exports.createClient = async (data) => {
  try {
    const existing = await db("clients").where({ email: data.email }).first();

    if (existing) {
      return {
        status: false,
        message: "Client with this email already exists.",
      };
    }

    const payload = {
      name: data.name,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      gstin: data.gstin,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      payment_terms: data.paymentTerms,
    };

    const [id] = await db("clients").insert(payload);

    const newClient = await db("clients").where({ id }).first();

    return { status: true, data: newClient };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateClient = async (id, data) => {
  try {
    if (!id) throw new Error("Client ID is missing");

    // Check duplicate email
    const existing = await db("clients")
      .where("email", data.email)
      .andWhereNot("id", id)
      .first();

    if (existing) {
      throw new Error("Email already exists");
    }

    await db("clients").where("id", id).update({
      name: data.name,
      contact_person: data.contactPerson, // ✅ FIX
      email: data.email,
      phone: data.phone,
      gstin: data.gstin,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      payment_terms: data.paymentTerms, // ✅ FIX
      updated_at: db.fn.now(),
    });

    return true;
  } catch (err) {
    console.error("Service Error:", err);
    throw err;
  }
};

module.exports.deleteClient = async (id) => {
  try {
    const deleted = await db("clients").where({ id }).del();
    if (!deleted) {
      return { status: false, message: "Client not found." };
    }
    return { status: true, message: "Client deleted successfully." };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.toggleClientStatus = async (id, status) => {
  try {
    const updated = await db("clients").where({ id }).update({ status });

    if (!updated) {
      return { status: false, message: "Client not found" };
    }

    return { status: true, message: "Status updated successfully" };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
