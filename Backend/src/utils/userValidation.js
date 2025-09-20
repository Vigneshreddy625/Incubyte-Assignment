import Joi from 'joi';

export const signupSchema = Joi.object({
    fullName: Joi.string().min(2).required().trim(),
    email: Joi.string().email().required().trim(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long.',
            'object.regex': 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character.'
        }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required(),
});