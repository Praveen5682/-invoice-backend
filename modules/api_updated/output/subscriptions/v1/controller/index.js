const service = require("../service/index");
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} = require("../validator/index");

module.exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await service.getAllSubscriptions(req.user.id);
    return res.status(200).json({ success: true, data: subscriptions });
  } catch (err) {
    console.error("Subscription Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch subscriptions." });
  }
};

module.exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await service.getSubscriptionById(
      req.params.id,
      req.user.id,
    );
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }
    return res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    console.error("Subscription Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch subscription." });
  }
};

module.exports.createSubscription = async (req, res) => {
  try {
    const { error, value } = createSubscriptionSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.createSubscription(value, req.user.id);
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Subscription Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create subscription." });
  }
};

module.exports.updateSubscription = async (req, res) => {
  try {
    const { error, value } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const response = await service.updateSubscription(
      req.params.id,
      value,
      req.user.id,
    );
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully.",
      data: response.data,
    });
  } catch (err) {
    console.error("Subscription Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update subscription." });
  }
};

module.exports.deleteSubscription = async (req, res) => {
  try {
    const response = await service.deleteSubscription(
      req.params.id,
      req.user.id,
    );
    if (!response.status) {
      return res
        .status(400)
        .json({ success: false, message: response.message });
    }
    return res
      .status(200)
      .json({ success: true, message: "Subscription deleted successfully." });
  } catch (err) {
    console.error("Subscription Controller Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete subscription." });
  }
};
