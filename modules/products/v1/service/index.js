// service/index.js
const db = require("../../../../config/db");

module.exports.createProduct = async (data, userId) => {
  try {
    // Check duplicate name for this user
    const existing = await db("products")
      .where({ name: data.name, user_id: userId })
      .first();

    if (existing) {
      throw new Error("A product with this name already exists");
    }

    const [id] = await db("products").insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      price: data.price,
      category: data.category || null,
      type: data.type || "service",
      status: data.status ?? 1,
    });

    const product = await db("products").where({ id }).first();
    return product;
  } catch (err) {
    console.error("Service Error (createProduct):", err);
    throw err;
  }
};

module.exports.getProducts = async (userId) => {
  try {
    return await db("products")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  } catch (err) {
    console.error("Service Error (getProducts):", err);
    throw new Error("Failed to fetch products");
  }
};

module.exports.getProductById = async (id, userId) => {
  try {
    const product = await db("products").where({ id, user_id: userId }).first();

    if (!product) throw new Error("Product not found or unauthorized");

    return product;
  } catch (err) {
    console.error("Service Error (getProductById):", err);
    throw err;
  }
};

module.exports.updateProduct = async (id, data, userId) => {
  try {
    if (!id) throw new Error("Product ID is required");

    // Verify ownership
    const existing = await db("products")
      .where({ id, user_id: userId })
      .first();

    if (!existing) throw new Error("Product not found or unauthorized");

    await db("products").where({ id, user_id: userId }).update({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type,
      status: data.status,
      updated_at: db.fn.now(),
    });

    return await db("products").where({ id }).first();
  } catch (err) {
    console.error("Service Error (updateProduct):", err);
    throw err;
  }
};

module.exports.deleteProduct = async (id, userId) => {
  try {
    const deleted = await db("products").where({ id, user_id: userId }).del();

    if (!deleted) throw new Error("Product not found or unauthorized");

    return true;
  } catch (err) {
    console.error("Service Error (deleteProduct):", err);
    throw err;
  }
};

module.exports.toggleStatus = async (id, status, userId) => {
  try {
    const updated = await db("products")
      .where({ id, user_id: userId })
      .update({
        status: Number(status),
        updated_at: db.fn.now(),
      });

    if (!updated) throw new Error("Product not found or unauthorized");

    return true;
  } catch (err) {
    console.error("Service Error (toggleStatus):", err);
    throw err;
  }
};
