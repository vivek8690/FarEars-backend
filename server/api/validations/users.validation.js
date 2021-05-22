const Joi = require('joi');

module.exports = {
    // POST /v1/users/register
    createUser: {
        body: {
            username: Joi.string().required().label('User Name'),
            password: Joi.string().required().label('Password'),
        },
    }
};