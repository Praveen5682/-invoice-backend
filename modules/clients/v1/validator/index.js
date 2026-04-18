const Joi = require("joi");

const clientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Client name cannot be empty.",
    "string.min": "Client name must be at least 2 characters.",
    "string.max": "Client name cannot exceed 100 characters.",
    "any.required": "Client name is required.",
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "Email address is required.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email address is required.",
  }),
  phone: Joi.string().trim().pattern(/^[0-9+\s-]{10,15}$/).allow("", null).messages({
    "string.pattern.base": "Please provide a valid phone number (10-15 digits).",
  }),
  address: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Address cannot exceed 500 characters.",
  }),
});

module.exports.validateClient = (data) => {
  const { error, value } = clientSchema.validate(data, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return { success: false, errors: errorDetails };
  }
  return { success: true, value };
};
