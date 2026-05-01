const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../../../../config/db");

// Razorpay is currently disabled as per user request
/*
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
*/

module.exports.createOrder = async (invoiceId) => {
  throw new Error("Razorpay integration is currently disabled.");
  /*
  try {
    const invoice = await db("invoices")
      .where({ id: invoiceId })
      .select("total_amount", "invoice_no", "currency")
      .first();

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const options = {
      amount: Math.round(invoice.total_amount * 100), // amount in the smallest currency unit
      currency: invoice.currency || "INR",
      receipt: `receipt_${invoice.invoice_no}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw error;
  }
  */
};

module.exports.verifyPayment = async (paymentData) => {
  throw new Error("Razorpay integration is currently disabled.");
  /*
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature !== razorpay_signature) {
    throw new Error("Invalid signature");
  }

  return true;
  */
};
