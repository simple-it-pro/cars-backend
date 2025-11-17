# Cars Backend - Project Overview

## Quick Summary

**Cars Backend** is a comprehensive social platform backend for car dealerships and automotive enthusiasts built with NestJS, TypeORM, and PostgreSQL. It provides a complete suite of features including user management, real-time messaging, content creation, and a review system.

## 🚀 Key Features

### User Management
- Phone and password-based authentication
- SMS verification for phone numbers
- User profiles with ratings
- Role-based access control (COMMON, ADMIN)
- Follow/subscription system
- User blocking functionality
- Soft delete for account deactivation

### Real-Time Messaging
- Private and group chats
- Text and voice messages
- Message attachments (images, files)
- Message editing with full history tracking
- Reply and forward functionality
- Quote messages
- Unread message tracking
- Favorite chats
- WebSocket-based real-time updates

### Content Management
- Post creation with title and description
- Multi-file attachments (images, videos)
- Hashtag support for posts
- Draft and published status
- Post management and editing

### Review System
- User-to-user reviews
- 5-star rating system
- Review images (up to 5 per review)
- Review answer functionality
- Verified reviews flag
- Automatic rating calculation

### File Management
- S3/Cloudinary integration
- Multiple file type support (images, videos, documents)
- Automatic temporary file cleanup
- File type validation
- Pre-signed URL generation

### Real-Time Notifications
- WebSocket-based push notifications
- Multiple notification types
- Read/unread status tracking
- User-specific notification feeds

## 🏗️ Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7.x
- **Runtime**: Node.js
- **API Style**: REST + WebSockets

### Database & Storage
- **Database**: PostgreSQL 17
- **ORM**: TypeORM 0.3.26
- **Cache**: Redis 7
- **File Storage**: AWS S3 / Cloudinary

### Authentication & Security
- **Auth**: JWT (access, refresh, websocket tokens)
- **Password Hashing**: bcryptjs
- **Validation**: class-validator, class-transformer
- **SMS**: SMS.ru API integration

### Real-Time Communication
- **WebSockets**: Socket.IO
- **Gateways**: @nestjs/websockets

### DevOps
- **Containerization**: Docker, Docker Compose
- **SSL/TLS**: Let's Encrypt
- **Migrations**: TypeORM migrations
- **Code Quality**: ESLint, Prettier, Husky

## 📊 Database Schema Overview

### Core Tables
- **users** - User accounts and profiles
- **chats** - Chat conversations (private/group)
- **messages** - Chat messages with attachments
- **message_content** - Message edit history
- **posts** - User-generated content
- **post_files** - Post file attachments
- **files** - File metadata and storage
- **reviews** - User reviews and ratings
- **notifications** - System notifications
- **hashtags** - Post tags

### Relationship Tables
- **chat_users** - Chat participants (M:N)
- **favorite_chats** - User favorite chats (M:N)
- **followers** - User following relationships
- **subscriptions** - User subscriptions
- **user_blocks** - Blocked users
- **unread_chats** - Unread message counters
- **post_hashtags** - Post hashtag associations (M:N)
- **refresh_tokens** - JWT refresh tokens
- **sms_verification** - Phone verification codes

## 🎯 Module Architecture

### Core Modules
1. **SharedModule** - Database config, common utilities
2. **AuthModule** - Authentication & JWT management
3. **UsersModule** - User CRUD operations
4. **ChatsModule** - Messaging functionality
5. **PostsModule** - Content management
6. **ReviewsModule** - Rating system
7. **NotificationsModule** - Real-time alerts
8. **FilesModule** - File upload & management
9. **StorageModule** - Cloud storage abstraction
10. **SmsModule** - Phone verification

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Separate WebSocket JWT tokens (24h expiration)
- Phone number verification via SMS
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- User blocking functionality
- Soft delete for data retention
- Input validation on all endpoints
- File type validation
- SQL injection prevention via TypeORM

## 🌐 API Overview

### REST Endpoints
```
/api
├── /auth          - Authentication (login, register, verify)
├── /users         - User management and profiles
├── /chats         - Chat operations
├── /messages      - Message operations
├── /posts         - Content management
├── /reviews       - Review operations
├── /notifications - Notification management
└── /files         - File upload
```

### WebSocket Namespaces
- `/chats` - Real-time messaging
- `/notifications` - Real-time notifications

### API Documentation
- **Swagger UI**: Available at `/api` endpoint
- **Authentication**: JWT Bearer token required
- **Validation**: Automatic with class-validator

## 🐳 Deployment

### Docker Compose Services
- **cars-backend** - NestJS application (Port 3000)
- **postgres-cars** - PostgreSQL 17 database (Port 5462)
- **redis-cars** - Redis 7 cache (Port 6379)
- **cars-migrations** - Database migration runner

### Environment Variables
See `.env.example` for required configuration:
- Database connection (DB_URL, DB_SCHEMA)
- JWT secrets (access, refresh, websocket)
- SMS API credentials
- S3/Cloud storage credentials
- SSL certificate paths

## 📁 Project Structure

```
cars-backend/
├── src/
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── chats/              # Messaging system
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── gateways/       # WebSocket handlers
│   │   └── dto/
│   ├── posts/              # Content management
│   ├── reviews/            # Review system
│   ├── notifications/      # Notification system
│   ├── files/              # File management
│   ├── storage/            # Cloud storage
│   ├── sms/                # SMS integration
│   ├── shared/             # Common utilities
│   ├── database/
│   │   ├── entities/       # TypeORM entities
│   │   ├── migrations/     # Database migrations
│   │   ├── enums/          # Database enums
│   │   └── interfaces/     # Type definitions
│   ├── config/             # Configuration modules
│   ├── common/             # Common DTOs, types, constants
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── docker-compose.yml      # Docker services
├── Dockerfile              # App container
├── Dockerfile.Migrations   # Migration container
├── typeorm.config.ts       # TypeORM configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── .env.example            # Environment template
```

## 🛠️ Development

### Setup
```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
yarn migration:run

# Start development server
yarn start:dev
```

### Common Commands
```bash
# Development
yarn start:dev           # Start with hot reload
yarn build              # Build for production
yarn start:prod         # Run production build

# Database
yarn migration:generate # Generate migration from entities
yarn migration:create   # Create empty migration
yarn migration:run      # Run pending migrations
yarn migration:revert   # Revert last migration

# Code Quality
yarn lint               # Run ESLint
yarn format             # Format code with Prettier
yarn test               # Run tests
yarn test:e2e           # Run e2e tests
```

## 📈 Performance Features

- Connection pooling for database access
- Redis caching for sessions
- Indexed database fields for fast queries
- Eager loading for frequently accessed relations
- Async/await for non-blocking operations
- Scheduled background tasks for cleanup
- Pre-signed URLs for direct S3 uploads
- WebSocket clustering support (Socket.IO)

## 🔄 Real-Time Features

### WebSocket Events

**Chats Gateway** (`/chats`)
- `message:send` - Send new message
- `message:received` - Receive message
- `message:edit` - Edit message
- `message:delete` - Delete message
- `message:read` - Mark as read
- `typing:start` - User typing
- `typing:stop` - User stopped typing

**Notifications Gateway** (`/notifications`)
- `notification:new` - New notification
- `notification:read` - Mark notification as read

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[DIAGRAMS.md](./DIAGRAMS.md)** - Visual architecture and component diagrams
- **[README.md](./README.md)** - Basic project information
- **API Documentation** - Available at `/api` when running

## 🎨 Diagrams Included

### Architecture Diagrams
1. **System Architecture** - High-level system overview with external services
2. **Component Architecture** - Internal module structure and dependencies
3. **Database ERD** - Complete entity relationship diagram
4. **Module Dependency Graph** - Module dependency visualization
5. **Deployment Architecture** - Docker Compose infrastructure

### Flow Diagrams
1. **Authentication Flow** - Registration, login, and token refresh
2. **Chat System Flow** - Real-time messaging with WebSockets
3. **Post Creation Flow** - Content creation with file uploads

## 🚦 Current Status

### Implemented Features ✅
- User authentication with JWT
- Phone verification with SMS
- Real-time messaging (text and voice)
- Message editing with history
- Reply and forward messages
- Group chats
- Post creation with files
- Hashtag system
- Review system with ratings
- Real-time notifications
- File upload to S3/Cloudinary
- User following/subscription
- User blocking
- Soft delete

### Future Enhancements 🔮
- Typing indicators
- Message reactions
- Video calls
- Advanced search (Elasticsearch)
- GraphQL API
- Mobile push notifications
- Multi-language support (i18n)
- Admin panel
- Analytics dashboard
- Rate limiting
- CDN integration

## 🤝 Module Dependencies

```
Shared Module (Independent)
    ↓
Auth Module → Users Module, SMS Module
    ↓
Chats Module → Users, Notifications, Files
Posts Module → Users, Files
Reviews Module → Users, Files
Notifications Module → Users
Files Module → Storage Module
```

## 📊 Key Metrics

- **Modules**: 10 feature modules
- **Entities**: 17 database entities
- **API Endpoints**: 50+ REST endpoints
- **WebSocket Events**: 10+ real-time events
- **File Types Supported**: Images, Videos, Documents, Voice
- **Authentication Methods**: Phone + SMS, Password
- **Token Types**: 3 (Access, Refresh, WebSocket)
- **Database Migrations**: Auto-generated with TypeORM

## 🔗 Related Files

- View [detailed architecture documentation](./ARCHITECTURE.md)
- View [visual diagrams](./DIAGRAMS.md)
- Check [environment configuration](./.env.example)
- Review [database configuration](./typeorm.config.ts)
- Explore [Docker setup](./docker-compose.yml)

## 📞 Support & Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **TypeORM Documentation**: https://typeorm.io
- **Socket.IO Documentation**: https://socket.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

**Project Type**: Social Platform Backend
**Industry**: Automotive / Car Dealerships
**Architecture**: Modular Monolith
**Deployment**: Docker Compose
**License**: UNLICENSED
**Node Version**: 22.x
**TypeScript Version**: 5.7.x
