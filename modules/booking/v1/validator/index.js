const Joi = require("joi");

const bookTicketSchema = Joi.object({
  user_name: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.empty": "User name is required",
      "string.min": "User name must be at least 3 characters",
      "string.max": "User name must not exceed 50 characters",
      "string.pattern.base": "User name should contain only letters and spaces",
    }),

  user_email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

  user_phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/) // Indian phone format
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base":
        "Phone number must be a valid 10-digit Indian number",
    }),
});

module.exports = {
  bookTicketSchema,
};
