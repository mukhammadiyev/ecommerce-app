const Joi = require('joi');

exports.updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Ism kamida 2 ta harfdan iborat boʻlishi kerak!'
  }),
  last_name: Joi.string().trim().max(50).allow('', null).optional(),
  phone_number: Joi.string().trim().pattern(/^\+?[0-9]{9,15}$/).optional().messages({
    'string.pattern.base': 'Telefon raqami formati noto‘g‘ri!'
  }),
  shipping_address: Joi.string().trim().min(5).optional().messages({
    'string.min': 'Manzil juda qisqa!'
  })
});

exports.changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'string.empty': 'Eski parol kiritilishi shart!'
  }),
  new_password: Joi.string().min(6).invalid(Joi.ref('old_password')).required().messages({
    'string.empty': 'Yangi parol kiritilishi shart!',
    'string.min': 'Yangi parol kamida 6 ta belgidan iborat boʻlishi kerak!',
    'any.invalid': 'Yangi parol eski paroldan farqli bo‘lishi kerak!'
  })
});