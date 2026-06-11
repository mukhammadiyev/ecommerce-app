const Joi = require('joi');

exports.orderSchema = Joi.object({
  shipping_address: Joi.string().trim().min(5).required().messages({
    'string.empty': 'Yetkazib berish manzili kiritilishi shart!'
  }),
  phone_number: Joi.string().pattern(/^\+?[0-9]{9,15}$/).required().messages({
    'string.empty': 'Telefon raqami kiritilishi shart!',
    'string.pattern.base': 'Telefon raqami formati notoʻgʻri!'
  })
});