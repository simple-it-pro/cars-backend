export default () => ({
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '60m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  sms: {
    apiId: process.env.SMS_RU_API_ID,
    testMode: process.env.SMS_TEST_MODE === 'true',
  },

  verification: {
    codeLength: 4,
    codeTtl: 5 * 60 * 1000, // 5 минут
    maxAttempts: 3,
    blockTime: 5 * 60 * 1000, // 5 минут
    maxRequestsPerMinute: 1, // Защита от флуда
  },
});
