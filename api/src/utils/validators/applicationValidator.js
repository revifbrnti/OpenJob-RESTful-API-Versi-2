const Joi = require('joi');

const ApplicationPayloadSchema = Joi.object({
  user_id: Joi.string().trim().required(),
  job_id: Joi.string().trim().required(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').default('pending'),
});

const ApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
});

module.exports = { ApplicationPayloadSchema, ApplicationStatusSchema };
