export const ERROR_MESSAGES = {
    USER: {
        NOT_FOUND: 'Пользователь с данным id не найден',
        NICKNAME_DUPLICATE: 'Пользователь с таким никнеймом уже существует',
        EMAIL_DUPLICATE: 'Пользователь с таким email уже существует',
        PHONE_DUPLICATE: 'Пользователь с таким номером телефона уже существует',
        CITY_NOT_FOUND: 'Не найден город',
    },
    AUTH: {
        SMS_FAIL: 'Не удалось отправить SMS',
        CODE_EXPIRED: 'Код не найден или истек',
        SESSION_REVOKED: 'Сессия недействительна или истекла',
        TOO_MANY_ATTEMPTS: 'Слишком много попыток. Попробуйте позже',
        WRONG_CODE: 'Неверный код подтверждения',
        INVALID_REFRESH_TOKEN: 'Невалидный refresh token',
        WRONG_TOKEN_TYPE: 'Неверный тип токена',
        REFRESH_TOKEN_NOT_FOUND: 'Refresh token не найден или уже использован',
        INVALID_WEBSOCKET_TOKEN: 'Невалидный websocket token',
        NO_PERMISSIONS: 'Недостаточно прав',
    },
    STORAGE: {
        MISSING_ENV: 'Нет обязательных переменных окружения для S3-хранилища',
        NO_FILE: 'Необходимо приложить файл',
        UPLOAD_FAILED: 'Не удалось сохранить файл',
    },
} as const;

export const SUCCESS_MESSAGES = {
    AUTH: {
        SMS_SUCCESS: 'Код подтверждения отправлен',
    },
} as const;
