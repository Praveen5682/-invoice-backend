// validator/index.js
const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required()
    .messages({ "string.empty": "Product name is required" }),

  description: Joi.string().trim().allow("").max(1000).optional(),

  price: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      "number.base": "Price must be a valid number",
      "number.min": "Price cannot be negative",
    }),

  category: Joi.string().trim().max(100).allow("").optional(),

  type: Joi.string().valid("product", "service").default("service"),

  status: Joi.number().valid(0, 1).default(1),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional(),
  description: Joi.string().trim().allow("").max(1000).optional(),
  price: Joi.number().min(0).precision(2).optional(),
  category: Joi.string().trim().max(100).allow("").optional(),
  type: Joi.string().valid("product", "service").optional(),
  status: Joi.number().valid(0, 1).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

const statusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  statusSchema,
};
