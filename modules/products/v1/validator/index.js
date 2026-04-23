const Joi = require("joi");

exports.createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().allow("").optional(),
  type: Joi.string().valid("product", "service").required(),
  status: Joi.number().valid(0, 1).optional(),
});

exports.updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().allow("").optional(),
  type: Joi.string().valid("product", "service").optional(),
  status: Joi.number().valid(0, 1).optional(),
});

exports.statusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required(),
});
