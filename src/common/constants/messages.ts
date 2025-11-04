import { reviewLength } from './reviews';

export const ERROR_MESSAGES = {
    USER: {
        NOT_FOUND: 'Пользователь с данным id не найден',
        NICKNAME_DUPLICATE: 'Пользователь с таким никнеймом уже существует',
        EMAIL_DUPLICATE: 'Пользователь с таким email уже существует',
        PHONE_DUPLICATE: 'Пользователь с таким номером телефона уже существует',
        SOME_NOT_FOUND: 'Один или несколько пользователей не найдены',
        SOME_NOT_FOUND_WITH_IDS_PREFIX: 'Пользователи с id не найдены: ',
        CITY_NOT_FOUND: 'Не найден город',
        PUBLIC_PROFILE_ACCESS_DENIED: 'Доступ к публичному профилю запрещен',
        PUBLIC_PROFILE_NOT_AVAILABLE: 'Публичный профиль недоступен',
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
    CHAT: {
        NOT_FOUND: 'Чат с данным id не найден',
        NO_PERMISSIONS: 'Пользователь не имеет доступа к чату',
        NO_CREATOR: 'Нельзя создать групповой чат без создателя',
    },
    REVIEW: {
        NOT_FOUND: 'Отзыв не найден',
        FORBIDDEN_AUTHOR: 'Нельзя оставить отзыв от имени другого пользователя',
        SELF_REVIEW: 'Нельзя оставить отзыв самому себе',
        TOO_MANY_IMAGES: 'Можно прикрепить не более 5 изображений',
        ANSWER_FORBIDDEN: 'Вы можете отвечать только на свои отзывы',
        ANSWER_TOO_LONG: `Текст ответа не должен превышать ${reviewLength} символов`,
        INVALID_FILE_TYPE: 'Можно загружать только файлы изображений',
        USER_NOT_FOUND: 'Пользователь не найден',
        AUTHOR_NOT_FOUND: 'Автор не найден',
    },
    MESSAGE: {
        EMPTY: 'Сообщение должно содержать текст, вложение или голосовое сообщение',
        RELOAD_FAIL: 'Сообщение сохранено, но не удалось его перечитать',
        NOT_FOUND: 'Сообщение не найдено',
        REPLY_TARGET_NOT_FOUND:
            'Сообщение, на которое выполняется ответ, не найдено',
        REPLY_ID_NOT_ALLOWED_HERE:
            'Параметр replyToMessageId недопустим для этого запроса',
        FILE_REQUIRED: 'Необходимо отправить файл',
        VOICE_REQUIRED: 'Файл должен содержать аудио',
        FORWARD_SOURCE_NOT_FOUND: 'Исходное сообщение для пересылки не найдено',
        FORWARD_ID_NOT_ALLOWED_HERE:
            'Параметр forwardFromMessageId недопустим для этого запроса',
        REPLY_AND_FORWARD_CONFLICT:
            'Нельзя одновременно указывать replyToMessageId и forwardFromMessageId',
        NO_CHANGES: 'Нечего обновлять: содержимое не изменилось',
    },
    STORAGE: {
        MISSING_ENV: 'Нет обязательных переменных окружения для S3-хранилища',
        NO_FILE: 'Необходимо приложить файл',
        UPLOAD_FAILED: 'Не удалось сохранить файл',
    },
    FILE: {
        DELETION_FAILED: 'Не удалось удалить файл',
        VOICE_DELETION_FAILED: 'Не удалось удалить голосовое сообщение',
    },
    DELETION: {
        FILES_PARTIAL_FAILURE: 'Некоторые файлы не были удалены из хранилища',
    },

    SUBSCRIPTION: {
        SELF_SUBSCRIBE: 'Нельзя подписаться на самого себя',
        USER_NOT_FOUND: 'Пользователь не найден',
        ALREADY_SUBSCRIBED: 'Вы уже подписаны на этого пользователя',
        NOT_SUBSCRIBED: 'Вы не подписаны',
    },
    AVATAR: {
        UPLOAD_FAILED: 'Не удалось загрузить аватар',
        DELETE_FAILED: 'Не удалось удалить старый аватар',
    },
    PROFILE: {
        DEACTIVATION_FAILED: 'Не удалось деактивировать профиль',
        ACTIVATION_FAILED: 'Не удалось активировать профиль',
    },
    PUBLIC_PROFILE: {
        ACCESS_DISABLED: 'Публичный доступ к профилю отключён',
        SLUG_NOT_FOUND: 'Пользователь с таким slug не найден',
    },
} as const;

export const SUCCESS_MESSAGES = {
    AUTH: {
        SMS_SUCCESS: 'Код подтверждения отправлен',
    },
    CHAT: {
        MARK_READ: 'Сообщения отмечены как прочитанные',
    },
    REVIEW: {
        CREATED: 'Отзыв успешно создан',
        ANSWERED: 'Ответ на отзыв успешно добавлен',
        VERIFIED: 'Отзыв верифицирован',
        UNVERIFIED: 'Отзыв снят с верификации',
    },
    STORAGE: {
        DELETED_SUCCESS: 'Файл успешно удалён',
    },
    MESSAGE: {
        DELETED: 'Сообщение и все вложения успешно удалены',
        DELETED_WITH_WARNINGS:
            'Сообщение удалено, но некоторые файлы не были удалены из хранилища',
    },
    USER: {
        UPDATED: 'Профиль успешно обновлен',
        AVATAR_UPDATED: 'Аватар успешно обновлен',
        SUBSCRIBED: 'Подписка успешно оформлена',
        UNSUBSCRIBED: 'Подписка успешно отменена',
        DEACTIVATED: 'Профиль успешно деактивирован',
        ACTIVATED: 'Профиль успешно активирован',
        DELETED: 'Профиль успешно удален',
        PUBLIC_PROFILE_GENERATED: 'Публичная ссылка успешно сгенерирована',
        PUBLIC_PROFILE_ACCESSED: 'Публичный профиль успешно получен',
        PUBLIC_LINK_GENERATED: 'Публичная ссылка успешно сгенерирована',
    },
    PUBLIC_PROFILE: {
        LINK_READY: 'Ссылка на публичный профиль сгенерирована',
    },
} as const;

export const WARNING_MESSAGES = {
    MESSAGE: {
        FILES_DELETION_FAILED: 'Некоторые файлы не были удалены из хранилища',
    },
    USER: {
        AVATAR_DELETION_FAILED:
            'Не удалось удалить старый аватар, но новый был загружен',
        PARTIAL_FILE_UPLOAD: 'Некоторые файлы не были загружены',
        PUBLIC_PROFILE_DEACTIVATED: 'Публичный профиль деактивирован',
    },
} as const;
