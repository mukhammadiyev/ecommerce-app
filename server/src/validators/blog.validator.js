const Joi = require('joi');
exports.blogSchema = Joi.object({
  title: Joi.string().trim().min(3).required(),
  content: Joi.string().trim().min(10).required(),
  image_url: Joi.string().uri().allow('', null)
});