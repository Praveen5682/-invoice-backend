const db = require("../../../../config/db");

// 🔹 Create Client
module.exports.createClient = async (props = {}) => {
  const { name, email, phone, address } = props;
  try {
    // Check if client with email exists
    const existing = await db("clients").where({ email }).first();
    if (existing) {
      const error = new Error("A client with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const [id] = await db("clients").insert({
      name,
      email,
      phone,
      address,
    });

    return await db("clients").where({ id }).first();
  } catch (error) {
    console.error("Service Error (createClient):", error);
    throw error; // Let the controller handle it
  }
};

// 🔹 Get All Clients
module.exports.getClients = async () => {
  try {
    return await db("clients").orderBy("created_at", "desc");
  } catch (error) {
    console.error("Service Error (getClients):", error);
    throw new Error("Failed to fetch clients from database.");
  }
};

// 🔹 Get Client by ID
module.exports.getClientById = async (id) => {
  try {
    const client = await db("clients").where({ id }).first();
    if (!client) {
      const error = new Error("Client not found.");
      error.statusCode = 404;
      throw error;
    }
    return client;
  } catch (error) {
    console.error(`Service Error (getClientById - ${id}):`, error);
    throw error;
  }
};

// 🔹 Update Client
module.exports.updateClient = async (id, props = {}) => {
  const { name, email, phone, address } = props;
  try {
    const client = await db("clients").where({ id }).first();
    if (!client) {
      const error = new Error("Client not found.");
      error.statusCode = 404;
      throw error;
    }

    // Check for email collision if email is changing
    if (email && email !== client.email) {
      const existing = await db("clients").where({ email }).first();
      if (existing) {
        const error = new Error("This email is already taken by another client.");
        error.statusCode = 409;
        throw error;
      }
    }

    await db("clients").where({ id }).update({
      name,
      email,
      phone,
      address,
      updated_at: db.fn.now(),
    });

    return await db("clients").where({ id }).first();
  } catch (error) {
    console.error(`Service Error (updateClient - ${id}):`, error);
    throw error;
  }
};

// 🔹 Delete Client
module.exports.deleteClient = async (id) => {
  try {
    const client = await db("clients").where({ id }).first();
    if (!client) {
      const error = new Error("Client not found.");
      error.statusCode = 404;
      throw error;
    }

    await db("clients").where({ id }).del();
    return true;
  } catch (error) {
    console.error(`Service Error (deleteClient - ${id}):`, error);
    throw error;
  }
};
