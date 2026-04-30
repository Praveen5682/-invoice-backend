const db = require("../../../../config/db");
const bcrypt = require("bcrypt");

module.exports.getSettings = async (userId) => {
    try {
        const user = await db("users")
            .select("name", "email", "company_name", "gst_number", "address", "phone", "company_logo")
            .where({ id: userId })
            .first();
        return { status: true, data: user };
    } catch (err) {
        console.error("Settings Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.updateSettings = async (userId, data) => {
    try {
        await db("users").where({ id: userId }).update(data);
        const updatedUser = await module.exports.getSettings(userId);
        return { status: true, data: updatedUser.data };
    } catch (err) {
        console.error("Settings Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};

module.exports.changePassword = async (userId, { currentPassword, newPassword }) => {
    try {
        const user = await db("users").where({ id: userId }).first();
        if (!user) return { status: false, message: "User not found" };

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return { status: false, message: "Incorrect current password" };

        const hashed = await bcrypt.hash(newPassword, 10);
        await db("users").where({ id: userId }).update({ password: hashed });

        return { status: true, message: "Password updated successfully" };
    } catch (err) {
        console.error("Settings Service Error:", err);
        return { status: false, message: "Internal server error" };
    }
};
