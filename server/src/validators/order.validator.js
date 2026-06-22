const Joi = require('joi');

exports.orderSchema = Joi.object({
  shipping_address: Joi.string().trim().min(5).required().messages({
    'string.empty': 'Yetkazib berish manzili kiritilishi shart!'
  }),
  phone_number: Joi.string().pattern(/^\+?[0-9]{9,15}$/).required().messages({
    'string.empty': 'Telefon raqami kiritilishi shart!',
    'string.pattern.base': 'Telefon raqami formati notoʻgʻri!'
  }),
  
  // 🔥 MUAMMONI HAL ETUVCHI QATORLAR:
  // Kupon kodi ixtiyoriy, bo'sh string yoki null bo'lishi ham mumkin
  coupon_code: Joi.string().trim().allow('', null).optional(),
  
  // Agarda checkout'dan qo'shimcha discount_amount yuborayotgan bo'lsangiz, uni ham ruxsatlaymiz:
  discount_amount: Joi.number().min(0).allow(null).optional()
}).unknown(true); // .unknown(true) — kutilmagan boshqa maydonlar kelsa ham xato bermaslikni ta'minlaydi