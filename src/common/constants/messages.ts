export const ERROR_MESSAGES = {
  USER: {
    NOT_FOUND: 'Пользователь с данным id не найден',
    NICKNAME_DUPLICATE: 'Пользователь с таким никнеймом уже существует',
    EMAIL_DUPLICATE: 'Пользователь с таким email уже существует',
    SOME_NOT_FOUND: 'Один или несколько пользователей не найдены',
    SOME_NOT_FOUND_WITH_IDS_PREFIX: 'Пользователи с id не найдены: ', // далее подставляем список id
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
    NO_CREATOR: 'Нельзя создать групповой чат без создателя',
  },
  MESSAGE: {
    EMPTY: 'Сообщение должно содержать текст или голосовое вложение',
    RELOAD_FAIL: 'Сообщение сохранено, но не удалось его перечитать',
  },
} as const;

export const SUCCESS_MESSAGES = {
  AUTH: {
    SMS_SUCCESS: 'Код подтверждения отправлен',
  },
  CHAT: {
    MARK_READ: 'Сообщения отмечены как прочитанные',
  },
} as const;
