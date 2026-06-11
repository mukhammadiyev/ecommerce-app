const Joi = require('joi');

exports.updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(50).optional(),
  last_name: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[0-9]{9,15}$/).optional()
});

exports.changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().min(6).required()
});