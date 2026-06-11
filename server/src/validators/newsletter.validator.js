const Joi = require('joi');
exports.newsletterSchema = Joi.object({
  email: Joi.string().email().required()
});