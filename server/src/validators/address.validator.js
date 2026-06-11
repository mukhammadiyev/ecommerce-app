// src/validators/address.validator.js
const Joi = require('joi');

exports.addressSchema = Joi.object({
  country: Joi.string().trim().min(2).max(50).default('Uzbekistan'),
  city: Joi.string().trim().min(2).max(50).required(),
  district: Joi.string().trim().min(2).max(50).required(),
  street_address: Joi.string().trim().min(5).max(255).required(),
  postal_code: Joi.string().trim().max(20).allow('', null),
  phone_number: Joi.string().pattern(/^\+?[0-9]{9,15}$/).required()
});