// validator/index.js
const Joi = require("joi");

const createClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Client name is required",
    "string.min": "Client name must be at least 2 characters",
    "string.max": "Client name cannot exceed 150 characters",
  }),

  clientType: Joi.string()
    .valid("Company", "Individual", "Proprietorship", "LLP", "Partnership")
    .default("Company"),

  contactPerson: Joi.string().trim().max(100).allow("").optional(),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\s-]{10,15}$/)
    .allow("")
    .optional()
    .messages({ "string.pattern.base": "Please enter a valid phone number" }),

  gstin: Joi.string()
    .trim()
    .length(15)
    .allow("")
    .optional()
    .messages({ "string.length": "GSTIN must be exactly 15 characters" }),

  pan: Joi.string()
    .trim()
    .length(10)
    .allow("")
    .optional()
    .messages({ "string.length": "PAN must be exactly 10 characters" }),

  placeOfSupply: Joi.string().trim().max(100).allow("").optional(),

  address: Joi.string().trim().max(500).allow("").optional(),

  city: Joi.string().trim().max(100).allow("").optional(),

  state: Joi.string().trim().max(100).allow("").optional(),

  zip: Joi.string()
    .trim()
    .length(6)
    .allow("")
    .optional()
    .messages({ "string.length": "PIN code must be exactly 6 digits" }),

  paymentTerms: Joi.string()
    .valid("Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60")
    .default("Net 30"),

  notes: Joi.string().trim().max(1000).allow("").optional(),
});

const updateClientSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .optional()
    .messages({ "string.min": "Client name must be at least 2 characters" }),

  clientType: Joi.string()
    .valid("Company", "Individual", "Proprietorship", "LLP", "Partnership")
    .optional(),

  contactPerson: Joi.string().trim().max(100).allow("").optional(),

  email: Joi.string()
    .trim()
    .email()
    .optional()
    .messages({ "string.email": "Please provide a valid email address" }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\s-]{10,15}$/)
    .allow("")
    .optional(),

  gstin: Joi.string().trim().length(15).allow("").optional(),

  pan: Joi.string().trim().length(10).allow("").optional(),

  placeOfSupply: Joi.string().trim().max(100).allow("").optional(),

  address: Joi.string().trim().max(500).allow("").optional(),

  city: Joi.string().trim().max(100).allow("").optional(),

  state: Joi.string().trim().max(100).allow("").optional(),

  zip: Joi.string().trim().length(6).allow("").optional(),

  paymentTerms: Joi.string()
    .valid("Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60")
    .optional(),

  notes: Joi.string().trim().max(1000).allow("").optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

module.exports = {
  createClientSchema,
  updateClientSchema,
};
