const Joi = require("joi");

const invoiceItemSchema = Joi.object({
  description: Joi.string().trim().required().messages({
    "string.empty": "Item description is required.",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
  }),
  unit_price: Joi.number().min(0).required().messages({
    "number.base": "Unit price must be a number.",
    "number.min": "Unit price cannot be negative.",
  }),
  amount: Joi.number().min(0).required().messages({
    "number.base": "Amount must be a number.",
  }),
});

const invoiceSchema = Joi.object({
  invoice_no: Joi.string().trim().required().messages({
    "string.empty": "Invoice number is required.",
  }),
  client_id: Joi.number().integer().required().messages({
    "number.base": "Please select a valid client.",
  }),
  status: Joi.string().valid("paid", "pending", "overdue", "draft").default("pending"),
  total_amount: Joi.number().min(0).required().messages({
    "number.base": "Total amount must be a number.",
  }),
  issue_date: Joi.date().required().messages({
    "date.base": "Please provide a valid issue date.",
  }),
  due_date: Joi.date().allow(null).messages({
    "date.base": "Please provide a valid due date.",
  }),
  notes: Joi.string().trim().allow("", null),
  items: Joi.array().items(invoiceItemSchema).min(1).required().messages({
    "array.min": "At least one invoice item is required.",
  }),
});

module.exports.validateInvoice = (data) => {
  const { error, value } = invoiceSchema.validate(data, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return { success: false, errors: errorDetails };
  }
  return { success: true, value };
};
