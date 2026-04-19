const db = require("../../../../config/db");

module.exports.getAllClients = async () => {
    try {
        const clients = await db("clients").select("*").orderBy("created_at", "desc");
        return clients;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch clients from database");
    }
};

module.exports.getClientById = async (id) => {
    try {
        const client = await db("clients").where({ id }).first();
        return client;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch client from database");
    }
};

module.exports.createClient = async (data) => {
    try {
        const existing = await db("clients").where({ email: data.email }).first();
        if (existing) {
            return { status: false, message: "Client with this email already exists." };
        }
        const [id] = await db("clients").insert(data);
        const newClient = await db("clients").where({ id }).first();
        return { status: true, data: newClient };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.updateClient = async (id, data) => {
    try {
        if (data.email) {
            const existing = await db("clients").where({ email: data.email }).whereNot({ id }).first();
            if (existing) {
                return { status: false, message: "Another client with this email already exists." };
            }
        }
        const updated = await db("clients").where({ id }).update(data);
        if (!updated) {
            return { status: false, message: "Client not found." };
        }
        const updatedClient = await db("clients").where({ id }).first();
        return { status: true, data: updatedClient };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
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
