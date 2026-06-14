const Joi = require('joi');

exports.updateProfileSchema = Joi.object({
  // Faqat front-enddan keladigan To'liq ismni qoldirdik
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Ism maydoni boʻsh boʻlishi mumkin emas!',
    'string.min': 'Ism kamida 2 ta harfdan iborat boʻlishi kerak!'
  })
});

exports.changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'string.empty': 'Eski parol kiritilishi shart!'
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.empty': 'Yangi parol kiritilishi shart!',
    'string.min': 'Yangi parol kamida 6 ta belgidan iborat boʻlishi kerak!'
  })
});