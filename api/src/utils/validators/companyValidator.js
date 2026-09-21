const Joi = require("joi");

const CompanyPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  location: Joi.string().trim().min(1).max(150).required(),
  description: Joi.string().trim().min(1).optional(),
});

const CompanyUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  location: Joi.string().trim().min(1).max(150).optional(),
  description: Joi.string().trim().min(1).optional(),
}).min(1);

module.exports = { CompanyPayloadSchema, CompanyUpdateSchema };
