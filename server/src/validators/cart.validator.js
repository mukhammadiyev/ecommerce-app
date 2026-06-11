// src/validators/cart.validator.js
const Joi = require('joi');

exports.cartSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required()
});