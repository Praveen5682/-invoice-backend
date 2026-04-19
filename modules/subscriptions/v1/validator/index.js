const Joi = require("joi");

const createSubscriptionSchema = Joi.object({
  client_id: Joi.number().integer().required().messages({
    "any.required": "Client ID is required.",
  }),
  plan_name: Joi.string().trim().required().messages({
    "any.required": "Plan name is required.",
  }),
  amount: Joi.number().min(0).required().messages({
    "number.min": "Amount cannot be negative.",
    "any.required": "Amount is required.",
  }),
  status: Joi.string().valid('active', 'paused', 'expired').default('active'),
  cycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
  start_date: Joi.date().iso().required().messages({
    "any.required": "Start date is required.",
  }),
  next_billing_date: Joi.date().iso().required().messages({
    "any.required": "Next billing date is required.",
  }),
});

const updateSubscriptionSchema = Joi.object({
  plan_name: Joi.string().trim().optional(),
  amount: Joi.number().min(0).optional(),
  status: Joi.string().valid('active', 'paused', 'expired').optional(),
  cycle: Joi.string().valid('monthly', 'yearly').optional(),
  next_billing_date: Joi.date().iso().optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update."
});

module.exports = {
  createSubscriptionSchema,
  updateSubscriptionSchema,
};
