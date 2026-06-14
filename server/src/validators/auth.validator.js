const Joi = require('joi');

exports.registerSchema = Joi.object({
  // Front-enddagi 'Full Name' maydoni uchun 'name' deb o'zgartirdik
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Ism maydoni boʻsh boʻlishi mumkin emas!',
    'string.min': 'Ism kamida 2 ta harfdan iborat boʻlishi kerak!'
  }),
  
  // Bu maydonlar front-endda yo'qligi uchun .optional() qildik (xato bermaydi)
  last_name: Joi.string().min(2).max(30).optional(),
  phone_number: Joi.string().pattern(/^\+?[0-9]{9,15}$/).optional(),

  email: Joi.string().email().required().messages({
    'string.email': 'Iltimos, haqiqiy email manzilingizni kiriting!',
    'string.empty': 'Email majburiy maydon!'
  }),
  
  password: Joi.string().min(6).required().messages({
    'string.min': 'Parol juda qisqa! Kamida 6 ta belgidan iborat boʻlishi shart.'
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