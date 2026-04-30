const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../../../../config/db");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  pro: {
    amount: 999 * 100, // 999 INR in paise
    name: "Pro Plan",
    duration_days: 365,
  },
  enterprise: {
    amount: 4999 * 100, // 4999 INR in paise
    name: "Enterprise Plan",
    duration_days: 365,
  },
};

module.exports.createSubscriptionOrder = async (planType, userId) => {
  try {
    const plan = PLANS[planType];
    if (!plan) throw new Error("Invalid plan type");

    const options = {
      amount: plan.amount,
      currency: "INR",
      receipt: `sub_${userId}_${Date.now()}`,
      notes: {
        planType,
        userId,
      },
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Billing Order Error:", error);
    throw error;
  }
};

module.exports.verifySubscriptionPayment = async (paymentData, userId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = paymentData;

  // 1. Verify Signature
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  // 2. Update User Plan
  const plan = PLANS[planType];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

  await db("users")
    .where({ id: userId })
    .update({
      plan_type: planType,
      plan_expiry: expiryDate,
      updated_at: db.fn.now(),
    });

  return { success: true, planType, expiryDate };
};
