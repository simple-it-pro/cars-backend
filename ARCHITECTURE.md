# Cars Backend - Architecture Documentation

## Overview

Cars Backend is a social platform for car dealerships and automotive enthusiasts built with NestJS, TypeORM, and PostgreSQL. The application enables users to create posts, engage in private and group chats, write reviews, and interact with a community focused on automotive content.

## Technology Stack

### Core Technologies
- **Framework**: NestJS 11.x (Node.js TypeScript framework)
- **Language**: TypeScript 5.7.x
- **Runtime**: Node.js
- **Database**: PostgreSQL 17
- **ORM**: TypeORM 0.3.26
- **Cache**: Redis 7
- **API Documentation**: Swagger/OpenAPI

### Key Dependencies
- **Authentication**: JWT (Passport, bcryptjs)
- **Real-time Communication**: Socket.IO, WebSockets
- **File Storage**: AWS S3 SDK, Cloudinary
- **Validation**: class-validator, class-transformer
- **SMS**: SMS.ru integration
- **Task Scheduling**: @nestjs/schedule
- **Testing**: Jest

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database Migrations**: TypeORM migrations
- **SSL/TLS**: Let's Encrypt certificates
- **Code Quality**: ESLint, Prettier, Husky

## System Architecture

### High-Level Architecture

The application follows a modular monolithic architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web/Mobile Apps, WebSocket Clients)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  (NestJS Controllers, Guards, Interceptors)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  (Services, Gateways, Validators)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │     Redis    │  │   S3/Cloud   │
│   Database   │  │     Cache    │  │   Storage    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Application Modules

The application is organized into the following modules:

1. **AuthModule** - Authentication and authorization
   - JWT token management (access, refresh, websocket tokens)
   - Phone number verification via SMS
   - Password-based and phone-based authentication
   - Guards and strategies for protected routes

2. **UsersModule** - User management
   - User profiles (name, nickname, email, phone, birthdate, city, about)
   - User roles (COMMON, ADMIN)
   - Profile images
   - User ratings
   - Account deactivation (soft delete)
   - User blocking functionality

3. **ChatsModule** - Messaging functionality
   - Private and group chats
   - Text and voice messages
   - Message attachments (images, files)
   - Message editing with history tracking
   - Message replies and forwarding
   - Quote functionality
   - Unread message tracking
   - Favorite chats
   - Real-time updates via WebSockets

4. **PostsModule** - Content creation
   - Post creation with title and description
   - Multi-file attachments (images, videos)
   - Hashtag support
   - Draft and published statuses
   - Post management

5. **ReviewsModule** - Review system
   - User-to-user reviews
   - 5-star rating system
   - Review images (up to 5)
   - Review answers
   - Verified reviews
   - Rating calculation

6. **NotificationsModule** - Notification system
   - Real-time notifications via WebSockets
   - Multiple notification types
   - Read/unread status
   - Push notification support

7. **FilesModule** - File management
   - File upload and storage
   - S3/Cloudinary integration
   - Temporary file cleanup scheduling
   - File type validation
   - File format detection

8. **StorageModule** - Cloud storage abstraction
   - S3-compatible storage integration
   - Pre-signed URL generation
   - File lifecycle management

9. **SmsModule** - SMS verification
   - SMS.ru API integration
   - Phone number verification
   - Test mode support

10. **SharedModule** - Common utilities
    - Database configuration
    - Global configuration management
    - Common DTOs and types
    - Constants and enums

## Database Schema

### Core Entities

#### Users
- **Primary Entity**: `users`
- **Key Fields**: id (UUID), phone (unique), email (unique), nickname (unique), login (unique)
- **Features**: Role-based access, soft delete, profile image (JSONB), rating
- **Relationships**:
  - Posts (1:N)
  - Reviews (1:N as author and target)
  - Chats (M:N)
  - Messages (1:N)
  - Followers/Subscriptions (M:N self-referencing)
  - Notifications (1:N)
  - Blocked users (M:N self-referencing)

#### Chats
- **Primary Entity**: `chats`
- **Types**: Private, Group
- **Key Fields**: id (UUID), type, uniqueKey (indexed), name, description
- **Features**: Last message tracking, favorite chats, indexed timestamps
- **Relationships**:
  - Users (M:N)
  - Messages (1:N)
  - UnreadChats (1:N)
  - Creator (M:1 to User)

#### Messages
- **Primary Entity**: `messages`
- **Types**: Text, Voice
- **Key Fields**: id (UUID), content, attachments (JSONB array), voiceUrl, type
- **Features**:
  - Read/delete status
  - Message editing with history
  - Reply and forward functionality
  - Quote text support
- **Relationships**:
  - Chat (M:1)
  - Sender (M:1 to User)
  - CurrentContent (1:1 to MessageContent)
  - ContentHistory (1:N to MessageContent)
  - RepliedMessage (M:1 self-referencing)
  - ForwardedFrom (M:1 self-referencing)

#### Posts
- **Primary Entity**: `posts`
- **Status**: DRAFT, PUBLISHED
- **Key Fields**: id (UUID), title, description (max 1000 chars), status
- **Relationships**:
  - User (M:1)
  - Files (1:N to PostFile)
  - Hashtags (M:N)

#### Reviews
- **Primary Entity**: `reviews`
- **Key Fields**: id (UUID), content, rank (1-5), images (JSONB array), answer, answeredAt
- **Features**: Verification flag, answer functionality
- **Relationships**:
  - Author (M:1 to User)
  - User/Target (M:1 to User)

#### Files
- **Primary Entity**: `files`
- **Types**: IMAGE, VIDEO, DOCUMENT
- **Status**: TEMPORARY, ATTACHED
- **Key Fields**: id (UUID), name, type, url, size, ext, status
- **Features**: Lifecycle management, automatic cleanup of temporary files

#### Supporting Entities
- **followers**: User following relationships
- **subscriptions**: User subscription tracking
- **notifications**: System notifications
- **refresh_tokens**: JWT refresh token storage
- **sms_verification**: Phone verification codes
- **unread_chats**: Unread message counters
- **user_blocks**: User blocking relationships
- **hashtags**: Post hashtags
- **post_files**: Post-file relationships
- **message_content**: Message edit history

### Database Relationships Summary

```
users (1) ──────> (N) posts
users (1) ──────> (N) reviews (as author)
users (1) ──────> (N) reviews (as target)
users (M) <────> (N) chats
users (1) ──────> (N) messages
users (M) <────> (N) users (followers/subscriptions)
users (M) <────> (N) users (blocks)
chats (1) ──────> (N) messages
posts (M) <────> (N) hashtags
posts (1) ──────> (N) post_files
files (1) <────> (1) post_files
messages (1) ──> (1) message_content (current)
messages (1) ──> (N) message_content (history)
```

## API Architecture

### REST API
- **Base Path**: `/api`
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger UI at `/api`
- **Validation**: Global validation pipes with class-validator

### WebSocket API
- **Namespaces**:
  - `/chats` - Real-time messaging
  - `/notifications` - Real-time notifications
- **Authentication**: JWT-based WebSocket authentication
- **Events**: Message sending, typing indicators, read receipts

### API Modules Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /verify-phone
├── /users
│   ├── GET /users
│   ├── GET /users/:id
│   ├── PATCH /users/:id
│   ├── DELETE /users/:id
│   └── /followers, /subscriptions, /blocks
├── /chats
│   ├── GET /chats
│   ├── POST /chats
│   ├── GET /chats/:id
│   └── /messages endpoints
├── /posts
│   ├── GET /posts
│   ├── POST /posts
│   ├── GET /posts/:id
│   ├── PATCH /posts/:id
│   └── DELETE /posts/:id
├── /reviews
│   ├── GET /reviews
│   ├── POST /reviews
│   ├── PATCH /reviews/:id/answer
│   └── GET /reviews/stats
└── /files
    └── POST /files/upload
```

## Security Features

### Authentication & Authorization
- JWT-based authentication with separate access and refresh tokens
- WebSocket-specific JWT tokens with 24h expiration
- Phone number verification via SMS
- Password hashing with bcryptjs
- Role-based access control (RBAC)

### Data Protection
- Password fields excluded from responses using class-transformer
- Soft delete for user accounts
- User blocking functionality
- SSL/TLS encryption in production

### Validation
- Input validation using class-validator
- File type validation
- Content length restrictions
- SQL injection prevention via TypeORM parameterized queries

## Performance Optimizations

### Database
- Indexed fields: chat timestamps, chat uniqueKey
- Eager loading for frequently accessed relations
- Connection pooling via TypeORM
- Soft delete for data retention without affecting queries

### Caching
- Redis for session management
- File caching strategy

### File Storage
- S3-compatible storage for scalability
- Cloudinary integration for image optimization
- Temporary file cleanup via scheduled tasks
- Pre-signed URLs for direct client uploads

## Deployment Architecture

### Docker Compose Setup
```
┌────────────────────────────────────────────┐
│  cars-backend (NestJS App)                 │
│  - Port: 3000                              │
│  - SSL certificates mounted                │
└──────────┬─────────────────────────────────┘
           │
           ├─> postgres-cars (PostgreSQL 17)
           │   - Port: 5462 (mapped)
           │   - Persistent volume
           │
           ├─> redis-cars (Redis 7)
           │   - Port: 6379
           │   - Persistent volume
           │
           └─> cars-migrations
               - Runs on startup
               - Applies database migrations
```

### Environment Configuration
- Separate `.env` files for different environments
- Configuration validation via Joi
- SSL certificate paths configurable
- S3 credentials and endpoints configurable
- SMS API credentials configurable

## Development Workflow

### Database Migrations
```bash
# Generate migration from entity changes
yarn migration:generate src/database/migrations/MigrationName

# Create empty migration
yarn migration:create src/database/migrations/MigrationName

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest for unit and e2e testing

### Development Commands
```bash
# Development mode with hot reload
yarn start:dev

# Production build
yarn build

# Run tests
yarn test

# Format code
yarn format
```

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Session management via Redis
- WebSocket clustering support (Socket.IO)
- File storage on external S3-compatible service

### Vertical Scaling
- Connection pooling for database
- Async/await for non-blocking operations
- Scheduled tasks for background processing
- Stream processing for large file uploads

### Monitoring & Observability
- TypeORM query logging
- Structured logging
- Error tracking and reporting
- Health check endpoints

## Future Enhancements

### Planned Features
- Real-time typing indicators
- Message reactions
- Video call support
- Advanced search with Elasticsearch
- GraphQL API
- Mobile push notifications
- Multi-language support (i18n)

### Technical Improvements
- Microservices migration for specific modules
- Event sourcing for audit trails
- CQRS pattern for complex queries
- API rate limiting
- Advanced caching strategies
- CDN integration for static assets
