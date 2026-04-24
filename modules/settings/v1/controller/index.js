const service = require("../service/index");

module.exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await service.getSettings(userId);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await service.updateSettings(userId, req.body);
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "Passwords are required" });
        }
        const response = await service.changePassword(userId, { currentPassword, newPassword });
        return res.status(response.status ? 200 : 400).json(response);
    } catch (err) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
