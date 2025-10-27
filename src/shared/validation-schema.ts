import * as Joi from 'joi';

export default Joi.object({
    DB_URL: Joi.string().required(),
    DB_SCHEMA: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('60m'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
    JWT_WEBSOCKET_EXPIRES_IN: Joi.string().default('24h'),
    PORT: Joi.number().default(3000),
    SMS_RU_API_ID: Joi.string().required(),
    SMS_TEST_MODE: Joi.boolean().default(true),
    S3_ACCESS_KEY: Joi.string().required(),
    S3_SECRET_KEY: Joi.string().required(),
    S3_BUCKET_NAME: Joi.string().required(),
    S3_API_ENDPOINT: Joi.string().required(),
    S3_REGION: Joi.string().required(),
});
