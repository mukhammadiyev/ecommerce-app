const Joi = require('joi');
exports.contactSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().email().required(),
  message: Joi.string().trim().min(5).required()
});