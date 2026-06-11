const Joi = require('joi');

exports.productSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().trim().allow('', null),
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().uri().allow('', null),
  
  // MANA SHU QATORNI QO'SHAMIZ:
  images: Joi.array().items(Joi.string().uri()).optional()
});