const Joi = require('joi');

exports.blogSchema = Joi.object({
  title: Joi.string().trim().min(3).required(),
  content: Joi.string().trim().min(10).required(),
  image_url: Joi.string().allow('', null),
  author_name: Joi.string().trim().allow('', null),  // 🌟 Qo'shildi
  author_image: Joi.string().allow('', null)          // 🌟 Qo'shildi
});