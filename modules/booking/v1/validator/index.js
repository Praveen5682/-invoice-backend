const Joi = require("joi");

const bookTicketSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "User name is required",
    "string.min": "User name must be at least 3 characters",
    "string.max": "User name must be less than 50 characters",
  }),

  user_email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email",
  }),

  user_phone: Joi.string().min(10).max(15).required().messages({
    "string.empty": "Phone number is required",
    "string.min": "Phone number must be at least 10 digits",
    "string.max": "Phone number must be less than 15 digits",
  }),
});

const updateTicketSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).messages({
    "string.min": "User name must be at least 3 characters",
    "string.max": "User name must be less than 50 characters",
  }),

  user_email: Joi.string().email().messages({
    "string.email": "Enter a valid email",
  }),

  user_phone: Joi.string().min(10).max(15).messages({
    "string.min": "Phone number must be at least 10 digits",
    "string.max": "Phone number must be less than 15 digits",
  }),
}).min(1);

const deleteTicketSchema = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "Ticket ID must be a number",
    "any.required": "Ticket ID is required",
  }),
});

module.exports = {
  bookTicketSchema,
  updateTicketSchema,
  deleteTicketSchema,
};
