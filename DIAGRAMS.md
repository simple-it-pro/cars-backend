# Cars Backend - Architecture & Component Diagrams

## System Architecture Diagram

This diagram shows the high-level architecture of the Cars Backend system, including external services and infrastructure components.

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application]
        MobileApp[Mobile Application]
        WSClient[WebSocket Clients]
    end

    subgraph "API Layer"
        NGINX[NGINX/SSL Termination]
        NestJS[NestJS Application<br/>Port 3000]
    end

    subgraph "Application Core"
        Controllers[Controllers Layer<br/>REST + WebSocket]
        Guards[Guards & Middlewares<br/>Authentication]
        Services[Business Logic Services]
        Gateways[WebSocket Gateways]
    end

    subgraph "Data Layer"
        TypeORM[TypeORM]
        Entities[Entity Models]
        Migrations[Database Migrations]
    end

    subgraph "External Services"
        S3[AWS S3 / S3-Compatible<br/>File Storage]
        SMS[SMS.ru API<br/>Phone Verification]
        Cloudinary[Cloudinary<br/>Image Processing]
    end

    subgraph "Infrastructure"
        PostgreSQL[(PostgreSQL 17<br/>Main Database)]
        Redis[(Redis 7<br/>Cache & Sessions)]
    end

    WebApp -->|HTTPS| NGINX
    MobileApp -->|HTTPS| NGINX
    WSClient -->|WSS| NGINX

    NGINX --> NestJS

    NestJS --> Controllers
    NestJS --> Gateways

    Controllers --> Guards
    Guards --> Services
    Gateways --> Services

    Services --> TypeORM
    Services --> S3
    Services --> SMS
    Services --> Cloudinary
    Services --> Redis

    TypeORM --> Entities
    TypeORM --> Migrations
    Entities --> PostgreSQL
    Migrations --> PostgreSQL

    style NestJS fill:#e0234e,color:#fff
    style PostgreSQL fill:#336791,color:#fff
    style Redis fill:#dc382d,color:#fff
    style S3 fill:#569a31,color:#fff
```

## Component Architecture Diagram

This diagram shows the internal module structure and dependencies within the NestJS application.

```mermaid
graph TB
    subgraph "Core Modules"
        AppModule[App Module<br/>Root Module]
        SharedModule[Shared Module<br/>Database, Config, Common]
    end

    subgraph "Feature Modules"
        AuthModule[Auth Module<br/>Authentication & JWT]
        UsersModule[Users Module<br/>User Management]
        ChatsModule[Chats Module<br/>Messaging System]
        PostsModule[Posts Module<br/>Content Management]
        ReviewsModule[Reviews Module<br/>Rating System]
        NotificationsModule[Notifications Module<br/>Real-time Alerts]
        FilesModule[Files Module<br/>File Management]
        StorageModule[Storage Module<br/>Cloud Storage]
        SmsModule[SMS Module<br/>Phone Verification]
    end

    subgraph "Module Components"
        direction LR
        Controllers[Controllers<br/>HTTP Endpoints]
        Services[Services<br/>Business Logic]
        Gateways[Gateways<br/>WebSocket Events]
        Guards[Guards<br/>Authorization]
        DTOs[DTOs<br/>Validation]
        Entities[Entities<br/>Database Models]
    end

    AppModule --> SharedModule
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> ChatsModule
    AppModule --> PostsModule
    AppModule --> ReviewsModule
    AppModule --> NotificationsModule
    AppModule --> FilesModule
    AppModule --> StorageModule
    AppModule --> SmsModule

    AuthModule -.->|uses| UsersModule
    AuthModule -.->|uses| SmsModule
    ChatsModule -.->|uses| UsersModule
    ChatsModule -.->|uses| NotificationsModule
    ChatsModule -.->|uses| FilesModule
    PostsModule -.->|uses| UsersModule
    PostsModule -.->|uses| FilesModule
    ReviewsModule -.->|uses| UsersModule
    ReviewsModule -.->|uses| FilesModule
    NotificationsModule -.->|uses| UsersModule
    FilesModule -.->|uses| StorageModule

    AuthModule --> Controllers
    ChatsModule --> Gateways
    NotificationsModule --> Gateways

    style AppModule fill:#e0234e,color:#fff
    style SharedModule fill:#ff6b6b,color:#fff
    style AuthModule fill:#4ecdc4,color:#fff
    style ChatsModule fill:#95e1d3,color:#fff
    style PostsModule fill:#f38181,color:#fff
```

## Database Entity Relationship Diagram

This diagram shows the database schema and relationships between entities.

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ REVIEWS : receives
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ SUBSCRIPTIONS : subscribes
    USERS ||--o{ FOLLOWERS : follows
    USERS ||--o{ USER_BLOCKS : blocks
    USERS ||--o{ UNREAD_CHATS : tracks
    USERS }o--o{ CHATS : participates

    CHATS ||--o{ MESSAGES : contains
    CHATS ||--o{ UNREAD_CHATS : has
    CHATS ||--o| MESSAGES : "last_message"
    CHATS }o--|| USERS : "created_by"

    MESSAGES ||--|| MESSAGE_CONTENT : "current_content"
    MESSAGES ||--o{ MESSAGE_CONTENT : "history"
    MESSAGES ||--o{ MESSAGES : "replies_to"
    MESSAGES ||--o{ MESSAGES : "forwards_from"

    POSTS ||--o{ POST_FILES : contains
    POSTS }o--o{ HASHTAGS : tagged

    FILES ||--|| POST_FILES : linked

    USERS {
        uuid id PK
        string phone UK
        string email UK
        string nickname UK
        string login UK
        string password
        string name
        date birthdate
        string city
        string about
        jsonb image
        float rating
        enum role
        boolean isDeactivated
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    CHATS {
        uuid id PK
        string uniqueKey UK
        enum type
        string name
        string description
        uuid last_message_id FK
        uuid created_by_id FK
        timestamp createdAt
        timestamp updatedAt
    }

    MESSAGES {
        uuid id PK
        uuid chat_id FK
        uuid sender_id FK
        text content
        jsonb attachments
        string voiceUrl
        enum type
        boolean isRead
        boolean isDeleted
        uuid current_content_id FK
        uuid replied_message_id FK
        uuid forwarded_from_id FK
        text quotedText
        timestamp createdAt
        timestamp updatedAt
    }

    MESSAGE_CONTENT {
        uuid id PK
        uuid message_id FK
        text content
        jsonb attachments
        timestamp createdAt
    }

    POSTS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    POST_FILES {
        uuid id PK
        uuid post_id FK
        uuid file_id FK
        integer order
        timestamp createdAt
    }

    FILES {
        uuid id PK
        string name
        enum type
        string url
        integer size
        string ext
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    REVIEWS {
        uuid id PK
        uuid author_id FK
        uuid user_id FK
        text content
        text answer
        integer rank
        jsonb images
        boolean isVerified
        timestamp answeredAt
        timestamp createdAt
        timestamp updatedAt
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type
        string title
        string description
        boolean isRead
        timestamp createdAt
    }

    HASHTAGS {
        uuid id PK
        string name UK
        timestamp createdAt
    }

    FOLLOWERS {
        uuid id PK
        uuid follower_id FK
        uuid subscribed_user_id FK
        timestamp createdAt
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        uuid subscribed_user_id FK
        timestamp createdAt
    }

    USER_BLOCKS {
        uuid id PK
        uuid user_id FK
        uuid blocked_user_id FK
        timestamp createdAt
    }

    UNREAD_CHATS {
        uuid id PK
        uuid user_id FK
        uuid chat_id FK
        integer count
        timestamp updatedAt
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token
        timestamp expiresAt
        timestamp createdAt
    }

    SMS_VERIFICATION {
        uuid id PK
        string phone
        string code
        timestamp expiresAt
        timestamp createdAt
    }
```

## Authentication Flow Diagram

This diagram illustrates the authentication and authorization flow in the application.

```mermaid
sequenceDiagram
    participant Client
    participant API as NestJS API
    participant Auth as Auth Service
    participant SMS as SMS Service
    participant DB as Database
    participant Redis

    Note over Client,Redis: Registration Flow
    Client->>API: POST /auth/register (phone)
    API->>Auth: validatePhone()
    Auth->>SMS: sendVerificationCode()
    SMS-->>Client: SMS with code
    Auth->>DB: saveVerificationCode()
    DB-->>Auth: saved
    Auth-->>API: verification sent
    API-->>Client: 200 OK

    Client->>API: POST /auth/verify-phone (phone, code)
    API->>Auth: verifyCode()
    Auth->>DB: checkCode()
    DB-->>Auth: valid
    Auth->>Auth: generateTokens()
    Auth->>DB: saveRefreshToken()
    Auth->>Redis: cacheSession()
    Auth-->>API: {accessToken, refreshToken}
    API-->>Client: 200 OK + tokens

    Note over Client,Redis: Authentication Flow
    Client->>API: POST /auth/login (phone, password)
    API->>Auth: validateCredentials()
    Auth->>DB: findUser()
    DB-->>Auth: user
    Auth->>Auth: comparePassword()
    Auth->>Auth: generateTokens()
    Auth->>DB: saveRefreshToken()
    Auth->>Redis: cacheSession()
    Auth-->>API: {accessToken, refreshToken}
    API-->>Client: 200 OK + tokens

    Note over Client,Redis: Authorized Request
    Client->>API: GET /users/me (Bearer token)
    API->>Auth: validateAccessToken()
    Auth->>Redis: checkSession()
    Redis-->>Auth: valid
    Auth-->>API: user payload
    API->>DB: getUserData()
    DB-->>API: user
    API-->>Client: 200 OK + user data

    Note over Client,Redis: Token Refresh
    Client->>API: POST /auth/refresh (refreshToken)
    API->>Auth: validateRefreshToken()
    Auth->>DB: checkRefreshToken()
    DB-->>Auth: valid
    Auth->>Auth: generateNewTokens()
    Auth->>DB: revokeOldToken()
    Auth->>DB: saveNewRefreshToken()
    Auth->>Redis: updateSession()
    Auth-->>API: {accessToken, refreshToken}
    API-->>Client: 200 OK + new tokens
```

## Chat System Flow Diagram

This diagram shows the real-time messaging flow using WebSockets.

```mermaid
sequenceDiagram
    participant ClientA as Client A
    participant ClientB as Client B
    participant Gateway as Chats Gateway
    participant Service as Chats Service
    participant DB as Database
    participant NotifGW as Notifications Gateway

    Note over ClientA,NotifGW: Connect to Chat
    ClientA->>Gateway: connect (JWT token)
    Gateway->>Gateway: validateToken()
    Gateway->>Gateway: joinRoom(userId)
    Gateway-->>ClientA: connected

    ClientB->>Gateway: connect (JWT token)
    Gateway->>Gateway: validateToken()
    Gateway->>Gateway: joinRoom(userId)
    Gateway-->>ClientB: connected

    Note over ClientA,NotifGW: Send Message
    ClientA->>Gateway: sendMessage(chatId, content, attachments)
    Gateway->>Service: createMessage()
    Service->>DB: saveMessage()
    DB-->>Service: message
    Service->>DB: updateChatLastMessage()
    Service->>DB: incrementUnreadCount()
    Service-->>Gateway: message created

    Gateway->>Gateway: broadcast to chat room
    Gateway-->>ClientA: message:sent (own message)
    Gateway-->>ClientB: message:received (new message)

    Gateway->>NotifGW: sendNotification(userId, messageData)
    NotifGW-->>ClientB: notification:new

    Note over ClientA,NotifGW: Mark as Read
    ClientB->>Gateway: markAsRead(chatId, messageId)
    Gateway->>Service: markMessageAsRead()
    Service->>DB: updateMessage(isRead=true)
    Service->>DB: resetUnreadCount()
    Service-->>Gateway: marked as read
    Gateway-->>ClientA: message:read
    Gateway-->>ClientB: confirmed

    Note over ClientA,NotifGW: Edit Message
    ClientA->>Gateway: editMessage(messageId, newContent)
    Gateway->>Service: editMessage()
    Service->>DB: createMessageContent(oldContent)
    Service->>DB: updateCurrentContent(newContent)
    Service-->>Gateway: message edited
    Gateway-->>ClientA: message:edited
    Gateway-->>ClientB: message:edited

    Note over ClientA,NotifGW: Reply to Message
    ClientB->>Gateway: replyToMessage(chatId, messageId, content)
    Gateway->>Service: createReplyMessage()
    Service->>DB: saveMessage(repliedMessageId)
    Service->>DB: linkReplyToOriginal()
    Service-->>Gateway: reply created
    Gateway-->>ClientA: message:received (with reply reference)
    Gateway-->>ClientB: message:sent
```

## Post Creation & File Upload Flow

This diagram illustrates the process of creating posts with file attachments.

```mermaid
sequenceDiagram
    participant Client
    participant API as NestJS API
    participant Files as Files Service
    participant Posts as Posts Service
    participant Storage as Storage Service
    participant S3 as S3/Cloud Storage
    participant DB as Database

    Note over Client,DB: Step 1: Upload Files
    Client->>API: POST /files/upload (files[])
    API->>Files: validateFileTypes()
    Files->>Files: detectFileFormat()

    loop for each file
        Files->>Storage: uploadFile()
        Storage->>S3: putObject()
        S3-->>Storage: file URL
        Storage-->>Files: file uploaded
        Files->>DB: saveFileEntity(TEMPORARY)
        DB-->>Files: file record
    end

    Files-->>API: file IDs and URLs
    API-->>Client: 200 OK + file data

    Note over Client,DB: Step 2: Create Post
    Client->>API: POST /posts (title, description, fileIds[], hashtags[])
    API->>Posts: validatePostData()
    Posts->>DB: checkFilesExist(fileIds)
    DB-->>Posts: files found

    Posts->>DB: createPost(status=DRAFT)
    DB-->>Posts: post created

    Posts->>DB: createPostFiles(postId, fileIds)
    Posts->>DB: updateFileStatus(ATTACHED)
    Posts->>DB: createOrLinkHashtags()

    Posts-->>API: post with files and hashtags
    API-->>Client: 201 Created + post data

    Note over Client,DB: Step 3: Publish Post
    Client->>API: PATCH /posts/:id (status=PUBLISHED)
    API->>Posts: updatePostStatus()
    Posts->>DB: updatePost(status=PUBLISHED)
    DB-->>Posts: post updated
    Posts-->>API: published post
    API-->>Client: 200 OK + post data

    Note over Client,DB: Background: Cleanup Temporary Files
    loop Daily Scheduled Task
        Files->>DB: findTemporaryFiles(older than 24h)
        DB-->>Files: temp files list

        loop for each temp file
            Files->>Storage: deleteFile()
            Storage->>S3: deleteObject()
            S3-->>Storage: deleted
            Files->>DB: deleteFileEntity()
        end
    end
```

## Module Dependency Graph

This diagram shows the dependencies between different modules in the application.

```mermaid
graph LR
    subgraph "Independent Modules"
        Shared[Shared Module<br/>Config, Database, Common]
        Storage[Storage Module<br/>S3 Integration]
        SMS[SMS Module<br/>SMS.ru API]
    end

    subgraph "Auth & User Management"
        Auth[Auth Module<br/>JWT, Guards]
        Users[Users Module<br/>Profiles, Roles]
    end

    subgraph "Communication Modules"
        Chats[Chats Module<br/>Messages, WebSocket]
        Notifications[Notifications Module<br/>Alerts, WebSocket]
    end

    subgraph "Content Modules"
        Posts[Posts Module<br/>Content Creation]
        Reviews[Reviews Module<br/>Ratings]
        Files[Files Module<br/>Uploads]
    end

    Auth --> Shared
    Auth --> Users
    Auth --> SMS

    Users --> Shared

    Chats --> Shared
    Chats --> Users
    Chats --> Notifications
    Chats --> Files

    Notifications --> Shared
    Notifications --> Users

    Posts --> Shared
    Posts --> Users
    Posts --> Files

    Reviews --> Shared
    Reviews --> Users
    Reviews --> Files

    Files --> Shared
    Files --> Storage

    Storage --> Shared
    SMS --> Shared

    style Shared fill:#ff6b6b,color:#fff
    style Auth fill:#4ecdc4,color:#fff
    style Chats fill:#95e1d3,color:#fff
    style Posts fill:#f38181,color:#fff
    style Files fill:#ffd93d,color:#000
```

## Deployment Architecture

This diagram shows the Docker Compose deployment setup.

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Network Bridge (MTU: 1428)"
            App[cars-backend<br/>NestJS App<br/>Port: 3000]
            DB[(postgres-cars<br/>PostgreSQL 17<br/>Port: 5462→5432)]
            Cache[(redis-cars<br/>Redis 7<br/>Port: 6379)]
            Migrations[cars-migrations<br/>TypeORM CLI<br/>Runs once on startup]
        end

        subgraph "Volumes"
            DBVol[postgres_data<br/>Database Storage]
            RedisVol[redis_data<br/>Cache Storage]
        end

        subgraph "External Mounts"
            SSL[SSL Certificates<br/>Let's Encrypt<br/>Read-only]
        end
    end

    subgraph "External Services"
        S3Cloud[S3/Cloud Storage<br/>File Storage]
        SMSApi[SMS.ru API<br/>Verification]
    end

    Internet[Internet<br/>HTTPS/WSS Traffic] --> App

    App --> DB
    App --> Cache
    App --> S3Cloud
    App --> SMSApi

    Migrations --> DB

    DB --> DBVol
    Cache --> RedisVol
    SSL --> App

    App -.->|depends_on| DB
    App -.->|depends_on| Migrations
    Migrations -.->|depends_on| DB

    style App fill:#e0234e,color:#fff
    style DB fill:#336791,color:#fff
    style Cache fill:#dc382d,color:#fff
    style Migrations fill:#95e1d3,color:#000
    style S3Cloud fill:#569a31,color:#fff
```
