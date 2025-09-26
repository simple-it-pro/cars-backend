export const ERROR_MESSAGES = {
  USER: {
    NOT_FOUND: 'Пользователь с данным id не найден',
    NICKNAME_DUPLICATE: 'Пользователь с таким никнеймом уже существует',
    EMAIL_DUPLICATE: 'Пользователь с таким email уже существует',
  },
  AUTH: {
    SMS_FAIL: 'Не удалось отправить SMS',
    CODE_EXPIRED: 'Код не найден или истек',
    TOO_MANY_ATTEMPTS: 'Слишком много попыток. Попробуйте позже',
    WRONG_CODE: 'Неверный код подтверждения',
    INVALID_REFRESH_TOKEN: 'Невалидный refresh token',
    WRONG_TOKEN_TYPE: 'Неверный тип токена',
    REFRESH_TOKEN_NOT_FOUND: 'Refresh token не найден или уже использован',
    INVALID_WEBSOCKET_TOKEN: 'Невалидный websocket token',
    NO_PERMISSIONS: 'Недостаточно прав',
  },
  CHAT: {
    NOT_FOUND: 'Чат с данным id не найден',
    NO_PERMISSIONS: 'Пользователь не имеет доступа к чату',
  },
};

export const SUCCESS_MESSAGES = {
  AUTH: {
    SMS_SUCCESS: 'Код подтверждения отправлен',
  },
};
