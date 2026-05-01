// const service = require("../service/index");

// module.exports.createOrder = async (req, res) => {
//   try {
//     const { planType } = req.body;
//     const order = await service.createSubscriptionOrder(planType, req.user.id);
//     return res.status(200).json({ success: true, data: order });
//   } catch (err) {
//     console.error("Billing Controller Error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Failed to create order" });
//   }
// };

// module.exports.verifyPayment = async (req, res) => {
//   try {
//     const response = await service.verifySubscriptionPayment(req.body, req.user.id);
//     return res.status(200).json({ 
//       success: true, 
//       message: `Successfully upgraded to ${response.planType} plan!`, 
//       data: response 
//     });
//   } catch (err) {
//     console.error("Billing Controller Error:", err);
//     return res.status(400).json({ success: false, message: err.message || "Payment verification failed" });
//   }
// };
