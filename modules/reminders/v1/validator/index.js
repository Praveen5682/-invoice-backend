const Joi = require("joi");

const createReminderSchema = Joi.object({
  invoice_id: Joi.number().integer().required().messages({
    "any.required": "Invoice ID is required.",
  }),
  type: Joi.string().valid('email', 'whatsapp').default('email'),
  reminder_date: Joi.date().iso().required().messages({
    "any.required": "Reminder date is required.",
    "date.format": "Reminder date must be a valid date format."
  }),
});

const updateReminderSchema = Joi.object({
  status: Joi.string().valid('pending', 'sent', 'failed').optional(),
  reminder_date: Joi.date().iso().optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update."
});

module.exports = {
  createReminderSchema,
  updateReminderSchema
};
