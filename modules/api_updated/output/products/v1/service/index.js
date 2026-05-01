const db = require("../../../../config/db");

module.exports.createProduct = async (data, userId) => {
  try {
    // Duplicate check scoped to this user
    const existing = await db("products")
      .where({ name: data.name, user_id: userId })
      .first();

    if (existing) {
      throw new Error("Product already exists");
    }

    const [result] = await db("products").insert({
      user_id: userId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type,
      status: data.status ?? 1,
    }).returning("id");

    const id = typeof result === "object" ? result.id : result;
    const product = await db("products").where({ id }).first();
    return product;
  } catch (err) {
    console.error("Service Error (createProduct):", err.message);
    throw new Error(err.message || "Failed to create product");
  }
};

module.exports.getProducts = async (userId) => {
  try {
    return await db("products").where({ user_id: userId }).orderBy("id", "desc");
  } catch (err) {
    console.error("Service Error (getProducts):", err.message);
    throw new Error("Failed to fetch products");
  }
};

module.exports.getProductById = async (id, userId) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const product = await db("products").where({ id, user_id: userId }).first();

    if (!product) throw new Error("Product not found");

    return product;
  } catch (err) {
    console.error("Service Error (getProductById):", err.message);
    throw new Error(err.message || "Failed to fetch product");
  }
};

module.exports.updateProduct = async (id, data, userId) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    // Ensure product belongs to user
    const product = await db("products").where({ id, user_id: userId }).first();
    if (!product) throw new Error("Product not found or unauthorized");

    await db("products").where({ id, user_id: userId }).update({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type,
      status: data.status,
      updated_at: new Date(),
    });

    return await db("products").where({ id }).first();
  } catch (err) {
    console.error("Service Error (updateProduct):", err.message);
    throw err;
  }
};

module.exports.deleteProduct = async (id, userId) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const deleted = await db("products").where({ id, user_id: userId }).del();

    if (!deleted) throw new Error("Product not found");

    return true;
  } catch (err) {
    console.error("Service Error (deleteProduct):", err.message);
    throw new Error(err.message || "Failed to delete product");
  }
};

module.exports.toggleStatus = async (id, status, userId) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const updated = await db("products")
      .where({ id, user_id: userId })
      .update({ status, updated_at: new Date() });

    if (!updated) throw new Error("Product not found or unauthorized");

    return true;
  } catch (err) {
    console.error("Service Error (toggleStatus):", err.message);
    throw new Error("Failed to update status");
  }
};
