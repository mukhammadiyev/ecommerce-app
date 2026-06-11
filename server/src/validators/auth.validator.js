const Joi = require('joi');

exports.registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'Ism maydoni boʻsh boʻlishi mumkin emas!',
    'string.min': 'Ism kamida 2 ta harfdan iborat boʻlishi kerak!'
  }),
  last_name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().required().messages({
    'string.email': 'Iltimos, haqiqiy email manzilingizni kiriting!',
    'string.empty': 'Email majburiy maydon!'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Parol juda qisqa! Kamida 6 ta belgidan iborat boʻlishi shart.'
  }),
  // 🔥 Mana shu maydon qo'shildi:
  phone_number: Joi.string().pattern(/^\+?[0-9]{9,15}$/).required().messages({
    'string.empty': 'Telefon raqami kiritilishi shart!',
    'string.pattern.base': 'Telefon raqami formati notoʻgʻri! (Masalan: +998901234567)'
  })
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email kiritilishi shart!'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Parol kiritilishi shart!'
  })
});