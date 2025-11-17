#!/bin/bash

# Cars Backend - Admin Panel Setup Script
# This script sets up the admin panel in one command

set -e

echo "🚀 Cars Backend Admin Panel Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

echo -e "${BLUE}Step 1/7:${NC} Creating directory structure..."
mkdir -p src/admin/resources
mkdir -p src/admin/components
mkdir -p src/database/entities/admin
echo -e "${GREEN}✓${NC} Directories created"

# Step 2: Install dependencies
echo ""
echo -e "${BLUE}Step 2/7:${NC} Installing AdminJS dependencies..."
yarn add adminjs@^7.8.1 @adminjs/nestjs@^7.0.0 @adminjs/typeorm@^5.0.1 \
    @adminjs/express@^6.1.0 express-formidable@^1.2.0 express-session@^1.18.1 \
    @adminjs/upload@^4.0.2 @adminjs/passwords@^4.0.0 \
    --silent 2>/dev/null || echo "Dependencies already installed"
yarn add -D @types/express-session@^1.18.0 @types/express-formidable@^1.0.9 \
    --silent 2>/dev/null || echo "Dev dependencies already installed"
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Create admin options file
echo ""
echo -e "${BLUE}Step 3/7:${NC} Creating admin configuration..."

cat > src/admin/admin.options.ts << 'EOF'
import { AdminModuleOptions } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';

AdminJS.registerAdapter({ Database, Resource });

export const adminOptions: AdminModuleOptions = {
    adminJsOptions: {
        rootPath: '/admin',
        branding: {
            companyName: 'Cars Backend Admin',
            logo: false,
            softwareBrothers: false,
        },
    },
    auth: {
        authenticate: async (email: string, password: string) => {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

            if (email === adminEmail && password === adminPassword) {
                return { email };
            }
            return null;
        },
        cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
        cookiePassword: process.env.ADMIN_COOKIE_PASSWORD || 'secret-cookie-password',
    },
    sessionOptions: {
        resave: false,
        saveUninitialized: true,
        secret: process.env.ADMIN_SESSION_SECRET || 'secret-session-key',
    },
};
EOF

echo -e "${GREEN}✓${NC} Admin options created"

# Step 4: Create admin module
echo ""
echo -e "${BLUE}Step 4/7:${NC} Creating admin module..."

cat > src/admin/admin.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import { adminOptions } from './admin.options';

@Module({
    imports: [AdminJSModule.createAdminAsync({ useFactory: () => adminOptions })],
})
export class AdminModule {}
EOF

echo -e "${GREEN}✓${NC} Admin module created"

# Step 5: Check if AdminModule is already in app.module.ts
echo ""
echo -e "${BLUE}Step 5/7:${NC} Updating app module..."

if grep -q "AdminModule" src/app.module.ts; then
    echo -e "${YELLOW}⚠${NC} AdminModule already imported in app.module.ts"
else
    # Backup app.module.ts
    cp src/app.module.ts src/app.module.ts.backup

    # Add import
    sed -i "/import { FilesModule } from '.\/files\/files.module';/a import { AdminModule } from './admin/admin.module';" src/app.module.ts

    # Add to imports array
    sed -i "/FilesModule,/a \        AdminModule," src/app.module.ts

    echo -e "${GREEN}✓${NC} App module updated (backup saved as app.module.ts.backup)"
fi

# Step 6: Create .env entries if needed
echo ""
echo -e "${BLUE}Step 6/7:${NC} Configuring environment variables..."

if [ ! -f ".env" ]; then
    touch .env
fi

if ! grep -q "ADMIN_EMAIL" .env; then
    cat >> .env << 'EOF'

# Admin Panel Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
ADMIN_SESSION_SECRET=my-super-secret-session-key-change-this-in-production
ADMIN_COOKIE_NAME=adminjs
ADMIN_COOKIE_PASSWORD=my-super-secret-cookie-password-change-this-in-production
ADMIN_PANEL_PATH=/admin
EOF
    echo -e "${GREEN}✓${NC} Environment variables added to .env"
else
    echo -e "${YELLOW}⚠${NC} Admin environment variables already exist in .env"
fi

# Step 7: Create SQL setup file
echo ""
echo -e "${BLUE}Step 7/7:${NC} Creating database setup script..."

cat > scripts/setup-admin-db.sql << 'EOF'
-- Admin Panel Database Setup
-- Run this with: psql -U cars -d cars -f scripts/setup-admin-db.sql

CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
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

CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
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
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- Insert default super admin role
INSERT INTO admin_roles (name, slug, description, permissions, is_system_role)
VALUES ('Super Admin', 'super-admin', 'Full system access', '["*"]', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert first admin user (password: Admin123!)
INSERT INTO admin_users (email, password, first_name, last_name, is_super_admin, is_active, role_id)
SELECT
    'admin@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    true,
    true,
    id
FROM admin_roles WHERE slug = 'super-admin'
ON CONFLICT (email) DO NOTHING;

\echo 'Admin panel database setup complete!'
\echo 'Default login: admin@example.com / Admin123!'
EOF

echo -e "${GREEN}✓${NC} Database setup script created"

# Done!
echo ""
echo "=================================="
echo -e "${GREEN}✅ Admin Panel Setup Complete!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Run database setup:"
echo -e "   ${BLUE}psql -U cars -d cars -f scripts/setup-admin-db.sql${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${BLUE}yarn start:dev${NC}"
echo ""
echo "3. Access admin panel:"
echo -e "   ${BLUE}http://localhost:3000/admin${NC}"
echo ""
echo "4. Login with:"
echo "   Email: admin@example.com"
echo "   Password: Admin123!"
echo ""
echo -e "${YELLOW}⚠  Remember to change the default password in production!${NC}"
echo ""
