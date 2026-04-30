// service/index.js
const db = require("../../../../config/db");

module.exports.getAllClients = async (userId) => {
  try {
    const clients = await db("clients")
      .where({ user_id: userId })
      .select("*")
      .orderBy("created_at", "desc");
    return clients;
  } catch (err) {
    console.error("Service Error (getAllClients):", err);
    throw new Error("Failed to fetch clients from database");
  }
};

module.exports.getClientById = async (id, userId) => {
  try {
    const rows = await db("clients")
      .leftJoin("invoices", "clients.id", "invoices.client_id")
      .where("clients.id", id)
      .andWhere("clients.user_id", userId)
      .select(
        "clients.*",
        "invoices.id as invoice_id",
        "invoices.invoice_no",
        "invoices.total_amount",
        "invoices.status",
        "invoices.created_at as invoice_date",
      );

    if (!rows.length) return null;

    const client = {
      id: rows[0].id,
      name: rows[0].name,
      client_type: rows[0].client_type,
      contact_person: rows[0].contact_person,
      email: rows[0].email,
      phone: rows[0].phone,
      gstin: rows[0].gstin,
      pan: rows[0].pan,
      place_of_supply: rows[0].place_of_supply,
      address: rows[0].address,
      city: rows[0].city,
      state: rows[0].state,
      zip: rows[0].zip,
      payment_terms: rows[0].payment_terms,
      notes: rows[0].notes,
      status: rows[0].status,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      invoices: [],
    };

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
    console.error("Service Error (getClientById):", err);
    throw new Error("Failed to fetch client with invoices");
  }
};

module.exports.createClient = async (data, userId) => {
  try {
    // Duplicate email check
    const existing = await db("clients")
      .where({ email: data.email, user_id: userId })
      .first();

    if (existing) {
      return {
        status: false,
        message: "Client with this email already exists.",
      };
    }

    const payload = {
      user_id: userId,
      name: data.name,
      client_type: data.clientType,
      contact_person: data.contactPerson || null,
      email: data.email,
      phone: data.phone || null,
      gstin: data.gstin || null,
      pan: data.pan || null,
      place_of_supply: data.placeOfSupply || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      payment_terms: data.paymentTerms,
      notes: data.notes || null,
    };

    const [id] = await db("clients").insert(payload);
    const newClient = await db("clients").where({ id }).first();

    return { status: true, data: newClient };
  } catch (err) {
    console.error("Service Error (createClient):", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateClient = async (id, data, userId) => {
  try {
    if (!id) throw new Error("Client ID is required");

    const clientExists = await db("clients")
      .where({ id, user_id: userId })
      .first();

    if (!clientExists) {
      throw new Error("Client not found or you are not authorized");
    }

    // Duplicate email check
    if (data.email) {
      const emailExists = await db("clients")
        .where("email", data.email)
        .where("user_id", userId)
        .whereNot("id", id)
        .first();

      if (emailExists) {
        return {
          status: false,
          message: "Another client with this email already exists.",
        };
      }
    }

    const updatePayload = {
      name: data.name,
      client_type: data.clientType,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      gstin: data.gstin,
      pan: data.pan,
      place_of_supply: data.placeOfSupply,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      payment_terms: data.paymentTerms,
      notes: data.notes,
      updated_at: db.fn.now(),
    };

    // Remove undefined fields
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      throw new Error("No fields to update");
    }

    const updatedRows = await db("clients")
      .where({ id, user_id: userId })
      .update(updatePayload);

    if (updatedRows === 0) {
      throw new Error("Failed to update client");
    }

    const updatedClient = await db("clients").where({ id }).first();

    return { status: true, data: updatedClient };
  } catch (err) {
    console.error("Service Error (updateClient):", err);
    throw err;
  }
};

module.exports.deleteClient = async (id, userId) => {
  try {
    const deleted = await db("clients").where({ id, user_id: userId }).del();

    if (!deleted) {
      return {
        status: false,
        message: "Client not found.",
      };
    }

    return {
      status: true,
      message: "Client deleted successfully.",
    };
  } catch (err) {
    console.error("Service Error (deleteClient):", err);
    return {
      status: false,
      message: "Internal server error",
    };
  }
};

module.exports.toggleClientStatus = async (id, status, userId) => {
  try {
    const updated = await db("clients")
      .where({ id, user_id: userId })
      .update({
        status: Number(status),
        updated_at: db.fn.now(),
      });

    if (updated === 0) {
      return {
        status: false,
        message: "Client not found or unauthorized",
      };
    }

    return {
      status: true,
      message: "Client status updated successfully",
    };
  } catch (err) {
    console.error("Service Error (toggleClientStatus):", err);
    return {
      status: false,
      message: "Internal server error",
    };
  }
};
