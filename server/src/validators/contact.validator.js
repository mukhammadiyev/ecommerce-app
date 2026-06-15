const Joi = require('joi');

exports.contactSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().allow('', null).optional(), // 🆕 Telefon raqami ixtiyoriy qo'shildi
  subject: Joi.string().trim().allow('', null).optional(), // 🆕 Mavzu ixtiyoriy qo'shildi
  message: Joi.string().trim().min(5).required()
});