const Joi = require('joi');

exports.sendEmailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().trim().min(3).required(),
  htmlContent: Joi.string().required()
});