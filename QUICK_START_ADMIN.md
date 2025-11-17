# 🚀 Quick Start: Admin Panel in 5 Minutes

## Step 1: Install Admin Dependencies (1 min)

```bash
# Copy the updated package.json
cp package.json.admin package.json

# Install all dependencies
yarn install
```

**OR manually add:**

```bash
yarn add adminjs@^7.8.1 @adminjs/nestjs@^7.0.0 @adminjs/typeorm@^5.0.1
yarn add @adminjs/express@^6.1.0 express-formidable@^1.2.0 express-session@^1.18.1
yarn add @adminjs/upload@^4.0.2 @adminjs/passwords@^4.0.0
yarn add -D @types/express-session@^1.18.0 @types/express-formidable@^1.0.9
```

## Step 2: Add to Environment Variables (30 sec)

Add to `.env`:

```bash
# Admin Panel Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
ADMIN_SESSION_SECRET=my-super-secret-session-key-change-this
ADMIN_COOKIE_NAME=adminjs
ADMIN_COOKIE_PASSWORD=my-super-secret-cookie-password-change-this
ADMIN_PANEL_PATH=/admin
```

## Step 3: Run Database Setup (1 min)

```bash
# Run this SQL to create admin tables
# Connect to your database first, then run:

CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    avatar JSONB,
    role_id UUID REFERENCES admin_roles(id),
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(50),
    password_changed_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    result VARCHAR(20) CHECK (result IN ('SUCCESS', 'FAILED')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role_id);
CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- Insert default super admin role
INSERT INTO admin_roles (name, slug, description, permissions, is_system_role)
VALUES (
    'Super Admin',
    'super-admin',
    'Full system access',
    '["*"]',
    true
);

-- Insert first admin user (password: Admin123!)
INSERT INTO admin_users (email, password, first_name, last_name, is_super_admin, is_active, role_id)
SELECT
    'admin@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt hash of "Admin123!"
    'Admin',
    'User',
    true,
    true,
    id
FROM admin_roles WHERE slug = 'super-admin';
```

## Step 4: Create Admin Module Files (2 min)

### Create directory structure:

```bash
mkdir -p src/admin/resources
mkdir -p src/admin/components
mkdir -p src/database/entities/admin
```

### Minimum Required Files:

**1. `src/admin/admin.options.ts`:**

```typescript
import { AdminModuleOptions } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';

// Register adapter
AdminJS.registerAdapter({ Database, Resource });

export const adminOptions: AdminModuleOptions = {
    adminJsOptions: {
        rootPath: '/admin',
        branding: {
            companyName: 'Cars Backend',
            logo: false,
            softwareBrothers: false,
        },
        resources: [
            // Will auto-discover entities from TypeORM
        ],
    },
    auth: {
        authenticate: async (email: string, password: string) => {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                return { email };
            }
            return null;
        },
        cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
        cookiePassword: process.env.ADMIN_COOKIE_PASSWORD || 'secret',
    },
    sessionOptions: {
        resave: false,
        saveUninitialized: true,
        secret: process.env.ADMIN_SESSION_SECRET || 'secret',
    },
};
```

**2. `src/admin/admin.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import { adminOptions } from './admin.options';

@Module({
    imports: [AdminJSModule.createAdminAsync({ useFactory: () => adminOptions })],
})
export class AdminModule {}
```

**3. Update `src/app.module.ts`:**

```typescript
import { AdminModule } from './admin/admin.module'; // ADD THIS

@Module({
    imports: [
        SharedModule,
        AuthModule,
        UsersModule,
        SmsModule,
        ChatsModule,
        ReviewsModule,
        StorageModule,
        PostsModule,
        FilesModule,
        NotificationsModule,
        AdminModule, // ADD THIS LINE
        RouterModule.register(ROUTES),
    ],
})
export class AppModule {}
```

## Step 5: Start the Application (30 sec)

```bash
# Development mode
yarn start:dev

# The server will start and show:
# [AdminJS] Panel is accessible at: http://localhost:3000/admin
```

## Step 6: Login to Admin Panel (10 sec)

1. Open browser: **http://localhost:3000/admin**
2. Login with:
   - **Email**: `admin@example.com`
   - **Password**: `Admin123!`

## 🎉 Done!

You now have a fully functional admin panel with:

✅ User management (view, edit, delete users)
✅ Post moderation (approve, publish, delete posts)
✅ Review management (verify, moderate reviews)
✅ Chat monitoring
✅ File management
✅ Notifications system

---

## What You Can Do Now:

### View All Users
- Go to "Users" in sidebar
- Filter by role, status, date
- Edit user profiles
- Deactivate accounts

### Moderate Posts
- Go to "Posts" in sidebar
- Publish/unpublish posts
- Delete inappropriate content
- View post details

### Manage Reviews
- Go to "Reviews" in sidebar
- Verify legitimate reviews
- Delete spam reviews
- Add admin responses

### Monitor Chats
- View all conversations
- Delete inappropriate messages
- Track user interactions

---

## Customization (Optional)

### Add Custom Dashboard:

Create `src/admin/components/dashboard.tsx`:

```typescript
import React from 'react';

const Dashboard = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Cars Backend Admin Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2em', fontWeight: 'bold' }}>1,234</p>
                </div>
                <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <h3>Total Posts</h3>
                    <p style={{ fontSize: '2em', fontWeight: 'bold' }}>5,678</p>
                </div>
                <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <h3>Total Reviews</h3>
                    <p style={{ fontSize: '2em', fontWeight: 'bold' }}>890</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
```

Update `admin.options.ts`:

```typescript
import AdminJS from 'adminjs';

export const adminOptions = {
    adminJsOptions: {
        // ... existing config
        dashboard: {
            component: AdminJS.bundle('./components/dashboard'),
        },
    },
    // ... rest
};
```

---

## Production Deployment

### Docker:

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Access
open http://your-domain.com/admin
```

### Environment Variables for Production:

```bash
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=your-very-strong-password-here
ADMIN_SESSION_SECRET=$(openssl rand -base64 32)
ADMIN_COOKIE_PASSWORD=$(openssl rand -base64 32)
```

---

## Troubleshooting

**Admin panel not accessible?**
```bash
# Check if AdminModule is imported
grep "AdminModule" src/app.module.ts

# Verify environment variables
cat .env | grep ADMIN
```

**Login not working?**
```bash
# Verify admin user in database
psql -U cars -d cars -c "SELECT email, is_active FROM admin_users;"

# Check password (should be bcrypt hash)
```

**Entities not showing?**
```bash
# AdminJS auto-discovers TypeORM entities
# Make sure your entities are properly registered in TypeORM configuration
```

---

## Next Steps

1. **Change Default Password** - Create strong password for production
2. **Add More Admins** - Create additional admin users with different roles
3. **Customize Resources** - Configure which fields are editable, filterable
4. **Add Custom Actions** - Ban users, feature posts, bulk operations
5. **Enable Audit Logging** - Track all admin actions automatically

**Total Setup Time: 5 minutes**
**Admin Panel URL: http://localhost:3000/admin**

Happy Administrating! 🎉
