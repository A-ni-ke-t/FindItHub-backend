const Joi = require("joi");

const authSchemaPatch = Joi.object({
    name: Joi.string(),
    img: Joi.string(),
    summary: Joi.string(),
}).or('name', 'img', 'summary').required();

const authSchemaPut = Joi.object({
    name: Joi.string().required(),
    img: Joi.string().required(),
    summary: Joi.string().required(),
});

module.exports = {
    authSchemaPatch,
    authSchemaPut
};
