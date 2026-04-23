const Joi = require("joi");

const createClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  contactPerson: Joi.string().trim().allow("").optional(),

  email: Joi.string().trim().email().required(),

  phone: Joi.string().trim().allow("").optional(),

  gstin: Joi.string().trim().length(15).allow("").optional(),

  address: Joi.string().trim().allow("").optional(),

  city: Joi.string().trim().allow("").optional(),

  state: Joi.string().trim().allow("").optional(),

  zip: Joi.string().trim().allow("").optional(),

  paymentTerms: Joi.string().trim().allow("").optional(),
});

const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),

  contactPerson: Joi.string().trim().allow("").optional(),

  email: Joi.string().trim().email().optional(),

  phone: Joi.string().trim().allow("").optional(),

  gstin: Joi.string().trim().length(15).allow("").optional(),

  address: Joi.string().trim().allow("").optional(),

  city: Joi.string().trim().allow("").optional(),

  state: Joi.string().trim().allow("").optional(),

  zip: Joi.string().trim().allow("").optional(),

  paymentTerms: Joi.string().trim().allow("").optional(),
}).min(1);

module.exports = {
  createClientSchema,
  updateClientSchema,
};
