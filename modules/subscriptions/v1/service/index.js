const db = require("../../../../config/db");

module.exports.getAllSubscriptions = async () => {
    try {
        const subscriptions = await db("subscriptions")
            .leftJoin("clients", "subscriptions.client_id", "clients.id")
            .select(
                "subscriptions.*",
                "clients.name as client_name",
                "clients.email as client_email"
            )
            .orderBy("subscriptions.created_at", "desc");
        return subscriptions;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch subscriptions");
    }
};

module.exports.getSubscriptionById = async (id) => {
    try {
        const subscription = await db("subscriptions")
            .leftJoin("clients", "subscriptions.client_id", "clients.id")
            .select(
                "subscriptions.*",
                "clients.name as client_name",
                "clients.email as client_email"
            )
            .where({ "subscriptions.id": id })
            .first();
        return subscription;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error("Failed to fetch subscription");
    }
};

module.exports.createSubscription = async (data) => {
    try {
        const [id] = await db("subscriptions").insert(data);
        const newSubscription = await this.getSubscriptionById(id);
        return { status: true, data: newSubscription };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.updateSubscription = async (id, data) => {
    try {
        const updated = await db("subscriptions").where({ id }).update(data);
        if (!updated) {
            return { status: false, message: "Subscription not found" };
        }
        const updatedSubscription = await this.getSubscriptionById(id);
        return { status: true, data: updatedSubscription };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.deleteSubscription = async (id) => {
    try {
        const deleted = await db("subscriptions").where({ id }).del();
        if (!deleted) {
            return { status: false, message: "Subscription not found" };
        }
        return { status: true, message: "Subscription deleted successfully" };
    } catch (err) {
        console.error("Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};
