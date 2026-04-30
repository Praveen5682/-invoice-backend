const Joi = require("joi");

const createPaymentSchema = Joi.object({
  invoice_id: Joi.number().integer().required().messages({
    "any.required": "Invoice ID is required.",
  }),
  amount: Joi.number().min(0.01).required().messages({
    "number.min": "Amount must be greater than 0.",
    "any.required": "Amount is required.",
  }),
  method: Joi.string()
    .valid("UPI", "CARD", "CASH", "TRANSFER")
    .required()
    .messages({
      "any.required": "Payment method is required.",
    }),
  // transaction_id is required for non-CASH methods, optional for CASH
  transaction_id: Joi.when("method", {
    is: "CASH",
    then: Joi.string().trim().optional().allow("", null),
    otherwise: Joi.string().trim().optional().allow("", null),
  }),
  status: Joi.string()
    .valid("captured", "refunded", "failed")
    .default("captured"),
  payment_date: Joi.date().iso().required().messages({
    "any.required": "Payment date is required.",
  }),
});

const updatePaymentSchema = Joi.object({
  status: Joi.string().valid("captured", "refunded", "failed").optional(),
  transaction_id: Joi.string().trim().optional().allow("", null),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

module.exports = {
  createPaymentSchema,
  updatePaymentSchema,
};
