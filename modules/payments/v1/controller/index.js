const service = require("../service/index");
const { createPaymentSchema, updatePaymentSchema } = require("../validator/index");

module.exports.getAllPayments = async (req, res) => {
    try {
        const payments = await service.getAllPayments();
        return res.status(200).json({ success: true, data: payments });
    } catch (err) {
        console.error("Payment Controller Error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch payments." });
    }
};

module.exports.getPaymentById = async (req, res) => {
    try {
        const payment = await service.getPaymentById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found." });
        }
        return res.status(200).json({ success: true, data: payment });
    } catch (err) {
        console.error("Payment Controller Error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch payment." });
    }
};

module.exports.createPayment = async (req, res) => {
    try {
        const { error, value } = createPaymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const response = await service.createPayment(value);
        if (!response.status) {
            return res.status(400).json({ success: false, message: response.message });
        }

        return res.status(201).json({ success: true, message: "Payment created successfully.", data: response.data });
    } catch (err) {
        console.error("Payment Controller Error:", err);
        return res.status(500).json({ success: false, message: "Failed to create payment." });
    }
};

module.exports.updatePayment = async (req, res) => {
    try {
        const { error, value } = updatePaymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const response = await service.updatePayment(req.params.id, value);
        if (!response.status) {
            return res.status(400).json({ success: false, message: response.message });
        }

        return res.status(200).json({ success: true, message: "Payment updated successfully.", data: response.data });
    } catch (err) {
        console.error("Payment Controller Error:", err);
        return res.status(500).json({ success: false, message: "Failed to update payment." });
    }
};
