const Joi = require("joi");

const CategoryPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

const CategoryUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
}).min(1);

module.exports = { CategoryPayloadSchema, CategoryUpdateSchema };
