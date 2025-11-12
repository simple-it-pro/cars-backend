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
        CONFIRMATION_INCORRECT: 'Неверное подтверждение удаления',
        ALREADY_BLOCKED: 'Пользователь уже заблокирован',
        NOT_BLOCKED: 'Пользователь не заблокирован',
        BLOCKED_INTERACTION: 'Взаимодействие с этим пользователем невозможно',
        CANNOT_ADD_BLOCKED_USERS:
            'Невозможно добавить заблокированных пользователей',
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
        BLOCKED_INTERACTION:
            'Нельзя оставить отзыв заблокированному пользователю',
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
    NOTIFICATION: {
        NOT_FOUND: 'Уведомление не найдено',
        FORBIDDEN: 'Нельзя удалить чужое уведомление',
        CREATE_FAILED: 'Не удалось создать уведомление',
        UPDATE_FAILED: 'Не удалось обновить уведомление',
        DELETE_FAILED: 'Не удалось удалить уведомление',
    },
    STORAGE: {
        MISSING_ENV: 'Нет обязательных переменных окружения для S3-хранилища',
        NO_FILE: 'Необходимо приложить файл',
        UPLOAD_FAILED: 'Не удалось сохранить файл',
    },
    FILE: {
        DELETION_FAILED: 'Не удалось удалить файл',
        VOICE_DELETION_FAILED: 'Не удалось удалить голосовое сообщение',
        NOT_FOUND: 'Файл не найден',
    },
    DELETION: {
        FILES_PARTIAL_FAILURE: 'Некоторые файлы не были удалены из хранилища',
    },
    SUBSCRIPTION: {
        SELF_SUBSCRIBE: 'Нельзя подписаться на самого себя',
        USER_NOT_FOUND: 'Пользователь не найден',
        ALREADY_SUBSCRIBED: 'Вы уже подписаны на этого пользователя',
        NOT_SUBSCRIBED: 'Вы не подписаны',
        CANNOT_SUBSCRIBE_BLOCKED:
            'Нельзя подписаться на заблокированного пользователя',
        BLOCKED_BY_USER: 'Этот пользователь заблокировал вас',
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
    POST: {
        CANNOT_DELETE_LAST_FILE: 'Нельзя удалить последний файл поста',
        FILES_NOT_FOUND:
            'Загруженные файлы не найдены или уже используются в другом постe',
        ALREADY_PUBLISHED: 'Пост уже опубликован',
        ACCESS_DENIED: 'У вас нет доступа к этому посту',
        NOT_FOUND: 'Пост не найден',
    },

    GARAGE: {
        CAR: {
            NOT_FOUND: 'Автомобиль не найден',
            NO_PHOTOS: 'Не загружено ни одного фото',
            PHOTO_NOT_FOUND: 'Фото не найдено',
            INVALID_STATUS_TRANSITION: 'Недопустимый переход между статусами',
            MISSING_REQUIRED_FIELDS:
                'Не заполнены обязательные поля для публикации',
            NO_PHOTOS_FOR_PUBLICATION:
                'Для публикации необходимо хотя бы одно фото',
            CANNOT_REMOVE_REQUIRED_FIELDS:
                'Нельзя удалять обязательные поля у автомобиля, выставленного на продажу',
            FORBIDDEN: 'Доступ к автомобилю запрещен',
            PRICE_REQUIRED: 'Цена обязательна при выставлении на продажу',
            INVALID_YEAR: 'Неверный год выпуска',
            INVALID_MILEAGE: 'Пробег не может быть отрицательным',
        },
        EXPENSE: {
            NOT_FOUND: 'Запись расхода не найдена',
            INVALID_DATE: 'Неверная дата',
            INVALID_AMOUNT: 'Сумма не может быть отрицательной',
        },
        MAINTENANCE: {
            NOT_FOUND: 'Запись обслуживания не найдена',
            INVALID_DATE: 'Неверная дата',
        },
        PHOTO: {
            UPLOAD_FAILED: 'Не удалось загрузить фото',
            DELETE_FAILED: 'Не удалось удалить фото',
            TOO_MANY_PHOTOS: 'Можно загрузить не более 10 фото',
            INVALID_FILE_TYPE: 'Можно загружать только файлы изображений',
        },
    },
} as const;

export const SUCCESS_MESSAGES = {
    AUTH: {
        SMS_SUCCESS: 'Код подтверждения отправлен',
    },
    CHAT: {
        MARK_READ: 'Сообщения отмечены как прочитанные',
        ALL_MARKED_READ: 'Все чаты отмечены как прочитанные',
        CHATS_MARKED_READ: 'Чаты отмечены как прочитанные',
        DELETED: 'Чаты удалены успешно',
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
        BLOCKED: 'Пользователь успешно заблокирован',
        UNBLOCKED: 'Пользователь успешно разблокирован',
    },
    NOTIFICATION: {
        CREATED: 'Уведомление успешно создано',
        MARKED_AS_READ: 'Уведомление отмечено как прочитанное',
        ALL_MARKED_AS_READ: 'Все уведомления отмечены как прочитанные',
        DELETED: 'Уведомление успешно удалено',
    },
    PUBLIC_PROFILE: {
        LINK_READY: 'Ссылка на публичный профиль сгенерирована',
    },
    POST: {
        PUBLISHED: 'Пост успешно опубликован',
        DELETED: 'Пост успешно удален',
        FILE_DELETED: 'Файл успешно удален',
    },
    FILE: {
        DELETED: 'Файл успешно удален',
    },

    GARAGE: {
        CAR: {
            CREATED: 'Автомобиль успешно добавлен в гараж',
            UPDATED: 'Автомобиль успешно обновлен',
            DELETED: 'Автомобиль успешно удален',
            STATUS_CHANGED: 'Статус автомобиля успешно изменен',
            RETRIEVED: 'Автомобиль успешно получен',
            LIST_RETRIEVED: 'Список автомобилей успешно получен',
        },
        EXPENSE: {
            CREATED: 'Запись расхода успешно создана',
            UPDATED: 'Запись расхода успешно обновлена',
            DELETED: 'Запись расхода успешно удалена',
            RETRIEVED: 'Запись расхода успешно получена',
            LIST_RETRIEVED: 'Список расходов успешно получен',
        },
        MAINTENANCE: {
            CREATED: 'Запись обслуживания успешно создана',
            UPDATED: 'Запись обслуживания успешно обновлена',
            DELETED: 'Запись обслуживания успешно удалена',
            RETRIEVED: 'Запись обслуживания успешно получена',
            LIST_RETRIEVED: 'Список обслуживаний успешно получен',
        },
        PHOTO: {
            UPLOADED: 'Фото успешно загружены',
            DELETED: 'Фото успешно удалено',
            REORDERED: 'Порядок фото успешно изменен',
        },
        STATS: {
            RETRIEVED: 'Статистика успешно получена',
        },
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

    GARAGE: {
        PHOTO: {
            PARTIAL_UPLOAD: 'Некоторые фото не были загружены',
            PARTIAL_DELETION: 'Некоторые фото не были удалены из хранилища',
        },
        EXPENSE: {
            PARTIAL_DELETION: 'Некоторые записи расходов не были удалены',
        },
    },
} as const;
