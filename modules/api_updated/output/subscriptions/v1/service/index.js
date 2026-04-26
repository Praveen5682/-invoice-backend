const db = require("../../../../config/db");

module.exports.getAllSubscriptions = async (userId) => {
  try {
    const subscriptions = await db("subscriptions")
      .leftJoin("clients", "subscriptions.client_id", "clients.id")
      .where("subscriptions.user_id", userId)
      .select(
        "subscriptions.*",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .orderBy("subscriptions.created_at", "desc");
    return subscriptions;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch subscriptions");
  }
};

module.exports.getSubscriptionById = async (id, userId) => {
  try {
    const subscription = await db("subscriptions")
      .leftJoin("clients", "subscriptions.client_id", "clients.id")
      .where("subscriptions.id", id)
      .andWhere("subscriptions.user_id", userId)
      .select(
        "subscriptions.*",
        "clients.name as client_name",
        "clients.email as client_email",
      )
      .first();
    return subscription;
  } catch (err) {
    console.error("Service Error:", err);
    throw new Error("Failed to fetch subscription");
  }
};

module.exports.createSubscription = async (data, userId) => {
  try {
    const [id] = await db("subscriptions").insert({ ...data, user_id: userId });
    const newSubscription = await module.exports.getSubscriptionById(id, userId);
    return { status: true, data: newSubscription };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.updateSubscription = async (id, data, userId) => {
  try {
    const updated = await db("subscriptions")
      .where({ id, user_id: userId })
      .update(data);

    if (!updated) {
      return { status: false, message: "Subscription not found" };
    }
    const updatedSubscription = await module.exports.getSubscriptionById(id, userId);
    return { status: true, data: updatedSubscription };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};

module.exports.deleteSubscription = async (id, userId) => {
  try {
    const deleted = await db("subscriptions")
      .where({ id, user_id: userId })
      .del();

    if (!deleted) {
      return { status: false, message: "Subscription not found" };
    }
    return { status: true, message: "Subscription deleted successfully" };
  } catch (err) {
    console.error("Service Error:", err);
    return { status: false, message: "Internal server error" };
  }
};
