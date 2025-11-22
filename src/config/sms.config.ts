import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => ({
    apiId: process.env.SMS_RU_API_ID as string,
    testMode: process.env.SMS_TEST_MODE as string,
}));
