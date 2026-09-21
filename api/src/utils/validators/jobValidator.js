const Joi = require("joi");

const JobPayloadSchema = Joi.object({
  company_id: Joi.string().trim().required(),
  category_id: Joi.string().trim().required(),
  title: Joi.string().trim().min(1).max(150).required(),
  description: Joi.string().trim().min(1).required(),
  job_type: Joi.string().trim().min(1).max(50).optional(),
  experience_level: Joi.string().trim().min(1).max(50).optional(),
  location_type: Joi.string().trim().min(1).max(50).optional(),
  location_city: Joi.string().trim().allow("", null).max(100).optional(),
  salary_min: Joi.number().integer().min(0).allow(null).optional(),
  salary_max: Joi.number().integer().min(0).allow(null).optional(),
  is_salary_visible: Joi.boolean().optional(),
  status: Joi.string().valid("open", "close").optional(),
}).custom((value, helpers) => {
  if (
    value.salary_min != null &&
    value.salary_max != null &&
    value.salary_min > value.salary_max
  ) {
    return helpers.error("any.invalid");
  }
  return value;
}, "salary range validation");

const JobUpdateSchema = Joi.object({
  company_id: Joi.string().trim().optional(),
  category_id: Joi.string().trim().optional(),
  title: Joi.string().trim().min(1).max(150).optional(),
  description: Joi.string().trim().min(1).optional(),
  job_type: Joi.string().trim().min(1).max(50).optional(),
  experience_level: Joi.string().trim().min(1).max(50).optional(),
  location_type: Joi.string().trim().min(1).max(50).optional(),
  location_city: Joi.string().trim().allow("", null).max(100).optional(),
  salary_min: Joi.number().integer().min(0).allow(null).optional(),
  salary_max: Joi.number().integer().min(0).allow(null).optional(),
  is_salary_visible: Joi.boolean().optional(),
  status: Joi.string().valid("open", "close").optional(),
}).min(1);

module.exports = { JobPayloadSchema, JobUpdateSchema };
