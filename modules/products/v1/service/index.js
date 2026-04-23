const db = require("../../../../config/db");

// ✅ CREATE
module.exports.createProduct = async (data) => {
  try {
    const existing = await db("products").where({ name: data.name }).first();

    if (existing) {
      throw new Error("Product already exists");
    }

    const [id] = await db("products").insert({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type, // product / service
      status: data.status ?? 1,
    });

    const product = await db("products").where({ id }).first();
    return product;
  } catch (err) {
    console.error("Service Error (createProduct):", err.message);
    throw new Error(err.message || "Failed to create product");
  }
};

// ✅ GET ALL
module.exports.getProducts = async () => {
  try {
    return await db("products").orderBy("id", "desc");
  } catch (err) {
    console.error("Service Error (getProducts):", err.message);
    throw new Error("Failed to fetch products");
  }
};

// ✅ GET BY ID
module.exports.getProductById = async (id) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const product = await db("products").where({ id }).first();

    if (!product) throw new Error("Product not found");

    return product;
  } catch (err) {
    console.error("Service Error (getProductById):", err.message);
    throw new Error(err.message || "Failed to fetch product");
  }
};

// ✅ UPDATE
module.exports.updateProduct = async (id, data) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const affectedRows = await db("products").where({ id }).update({
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
    throw err; // ✅ keep original error
  }
};
// ✅ DELETE
module.exports.deleteProduct = async (id) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    const deleted = await db("products").where({ id }).del();

    if (!deleted) throw new Error("Product not found");

    return true;
  } catch (err) {
    console.error("Service Error (deleteProduct):", err.message);
    throw new Error(err.message || "Failed to delete product");
  }
};

// ✅ TOGGLE STATUS
module.exports.toggleStatus = async (id, status) => {
  try {
    if (!id) throw new Error("Product ID is missing");

    await db("products").where({ id }).update({
      status,
      updated_at: new Date(),
    });

    return true;
  } catch (err) {
    console.error("Service Error (toggleStatus):", err.message);
    throw new Error("Failed to update status");
  }
};
