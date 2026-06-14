const Joi = require('joi');

exports.productSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().trim().allow('', null),
  category_id: Joi.number().integer().required(), // 💡 Diqqat: Bu yerda raqam (Integer) talab qilingan!
  
  // 🛠️ 'image_url' o'rniga shunchaki 'image' qilamiz:
  image: Joi.string().trim().required(), // yoki rasm majburiy bo'lsa .required(), ixtiyoriy bo'lsa .allow('', null)
  
  images: Joi.array().items(Joi.string().trim()).optional() // Base64 rasm ketsa .uri() xato berishi mumkin, shuning uchun .string().trim() ma'qul
});