const Joi = require('joi');
exports.reviewSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().min(3).required()
});