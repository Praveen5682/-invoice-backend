const Joi = require("joi");

const createClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Client name is required.",
    "string.min": "Name must be at least 2 characters.",
    "any.required": "Client name is required.",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string().trim().allow("").optional(),
  address: Joi.string().trim().allow("").optional(),
});

const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().allow("").optional(),
  address: Joi.string().trim().allow("").optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update."
});

module.exports = {
  createClientSchema,
  updateClientSchema,
};
