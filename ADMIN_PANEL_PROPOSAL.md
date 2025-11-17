# Admin Panel - Database Structure & Feature Proposal

## Executive Summary

This document proposes a comprehensive admin panel for the Cars Backend - a social platform for drivers and car marketplace. The proposal includes:

1. **Current Backend Analysis** - What can be managed with existing database
2. **New Marketplace Features** - Car listings, dealerships, transactions (NOT YET IMPLEMENTED)
3. **Complete Admin Panel Database Schema** - All required entities
4. **Admin Operations & Permissions** - RBAC system

---

## Part 1: Current Backend - What Can Be Managed Now

### 1.1 Existing Database Entities

The current backend has these entities that need admin management:

#### **Users Management** ✅
- **Table**: `users`
- **Current Fields**: id, phone, email, nickname, login, password, name, birthdate, city, about, image, rating, role, isDeactivated, createdAt, updatedAt, deletedAt
- **Current Roles**: COMMON, ADVANCED (no full ADMIN role yet)
- **Admin Operations Needed**:
  - View all users with filters (role, status, registration date, city)
  - Edit user profiles
  - Activate/deactivate accounts (isDeactivated flag)
  - Delete users (soft delete using deletedAt)
  - Change user roles (COMMON ↔ ADVANCED)
  - Reset passwords
  - View user statistics (posts count, reviews count, chats count)
  - Ban/unban users
  - View user activity logs

#### **Posts Management** ✅
- **Table**: `posts`
- **Current Fields**: id, userId, title, description, status (DRAFT/PUBLISHED), createdAt, updatedAt
- **Relationships**: files (via post_files), hashtags (M:N), user
- **Admin Operations Needed**:
  - View all posts with filters (status, user, date, hashtags)
  - Moderate posts (approve/reject)
  - Delete inappropriate posts
  - Feature posts (promote to homepage)
  - Edit post content
  - Manage hashtags
  - View post analytics (views, likes, shares)
  - Bulk actions (delete, publish, unpublish)

#### **Reviews Management** ✅
- **Table**: `reviews`
- **Current Fields**: id, authorId, userId, content, answer, rank (1-5), images, isVerified, answeredAt, createdAt, updatedAt
- **Admin Operations Needed**:
  - View all reviews with filters (verified, rating, user, date)
  - Verify/unverify reviews
  - Delete fake/spam reviews
  - Edit review content
  - Manage review answers
  - Flag suspicious reviews
  - View review statistics per user
  - Dispute management

#### **Chats & Messages Management** ✅
- **Tables**: `chats`, `messages`, `message_content`
- **Admin Operations Needed**:
  - View all chats (private/group)
  - Monitor flagged messages
  - Delete inappropriate messages
  - Ban users from chatting
  - View chat analytics
  - Export chat logs for investigations
  - Message content moderation

#### **Files Management** ✅
- **Table**: `files`
- **Current Fields**: id, name, type (IMAGE/VIDEO/DOCUMENT), url, size, ext, status (ATTACHED/TEMPORARY), createdAt, updatedAt
- **Admin Operations Needed**:
  - View all files with filters
  - Delete files (and orphaned files)
  - View storage usage statistics
  - Manage file cleanup policies
  - View files by user
  - Scan for inappropriate content

#### **Notifications** ✅
- **Table**: `notifications`
- **Current Types**: like, follow, comment, reply, message, review, reviewAnswer
- **Admin Operations Needed**:
  - Send bulk notifications
  - View notification delivery status
  - Manage notification templates
  - Create system announcements

#### **User Relationships** ✅
- **Tables**: `followers`, `subscriptions`, `user_blocks`
- **Admin Operations Needed**:
  - View user networks
  - Identify fake follower networks
  - Manage blocked users
  - View relationship analytics

### 1.2 Missing Admin Functionality (Current Backend)

#### **Need to Add**:
1. **Admin User Entity** - Separate admin accounts with permissions
2. **User Reports/Complaints** - Users reporting inappropriate content
3. **Audit Logs** - Track all admin actions
4. **Moderation Queue** - Content pending review
5. **Ban System** - Temporary/permanent bans with reasons
6. **Analytics Tables** - Aggregated statistics

---

## Part 2: New Marketplace Features (NOT YET IMPLEMENTED)

For a complete car marketplace, we need these new features:

### 2.1 Car Listings (NEW)

**Purpose**: Users can list cars for sale

**Required Tables**:

#### `car_listings`
```
id: uuid (PK)
userId: uuid (FK to users) - Seller
dealershipId: uuid (FK to dealerships, nullable) - If from dealership
title: string - "2020 BMW X5 M Sport"
description: text - Full description
status: enum - DRAFT, ACTIVE, SOLD, EXPIRED, REMOVED
condition: enum - NEW, USED, CERTIFIED_PRE_OWNED
price: decimal(10,2) - Price in currency
currency: string - "RUB", "USD"
negotiable: boolean - Can negotiate price
mileage: integer - Odometer reading in km
year: integer - Manufacturing year
make: string - Brand (BMW, Mercedes, etc.)
model: string - Model name
trim: string - Trim level/variant
vin: string (unique, nullable) - Vehicle Identification Number
bodyType: enum - SEDAN, SUV, COUPE, HATCHBACK, TRUCK, VAN, CONVERTIBLE
fuelType: enum - GASOLINE, DIESEL, ELECTRIC, HYBRID, PLUG_IN_HYBRID
transmission: enum - AUTOMATIC, MANUAL, CVT, DUAL_CLUTCH
drivetrain: enum - FWD, RWD, AWD, 4WD
exteriorColor: string
interiorColor: string
doors: integer
seats: integer
engineSize: decimal(3,1) - Liters (e.g., 3.0)
horsepower: integer
torque: integer
viewCount: integer - Number of views
favoriteCount: integer - Times favorited
location: jsonb - {city, region, country, lat, lng}
features: jsonb - Array of features ["Leather Seats", "Sunroof", etc.]
specifications: jsonb - Detailed specs
isVerified: boolean - Verified by admin/inspector
isFeatured: boolean - Premium listing
featuredUntil: timestamp
expiresAt: timestamp - Listing expiration
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp (soft delete)
```

#### `car_listing_images`
```
id: uuid (PK)
listingId: uuid (FK to car_listings)
fileId: uuid (FK to files)
order: integer - Display order
isPrimary: boolean - Main image
caption: string
createdAt: timestamp
```

#### `car_categories`
```
id: uuid (PK)
name: string - "Luxury Cars", "Electric Vehicles"
slug: string (unique)
description: text
parentId: uuid (FK to car_categories, nullable) - For subcategories
icon: string - Icon URL
order: integer
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

#### `listing_categories` (M:N)
```
listingId: uuid (FK to car_listings)
categoryId: uuid (FK to car_categories)
```

### 2.2 Dealerships (NEW)

**Purpose**: Car dealerships can have accounts and manage inventory

#### `dealerships`
```
id: uuid (PK)
ownerId: uuid (FK to users) - Dealership owner
name: string - "Premium Auto Moscow"
slug: string (unique)
description: text
email: string
phone: string
website: string
logo: jsonb - Image data
coverImage: jsonb - Image data
address: jsonb - {street, city, region, country, postalCode}
location: jsonb - {lat, lng}
businessHours: jsonb - Operating hours
licenseNumber: string
taxId: string
rating: decimal(2,1) - Average rating
reviewCount: integer
verificationStatus: enum - PENDING, VERIFIED, REJECTED
isActive: boolean
isPremium: boolean - Premium dealership features
premiumUntil: timestamp
establishedYear: integer
employeeCount: integer
specializations: jsonb - Array of specializations
socialMedia: jsonb - {facebook, instagram, etc.}
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```

#### `dealership_staff`
```
id: uuid (PK)
dealershipId: uuid (FK to dealerships)
userId: uuid (FK to users)
role: enum - OWNER, MANAGER, SALESPERSON, MECHANIC
permissions: jsonb - Array of permissions
isActive: boolean
hiredAt: timestamp
createdAt: timestamp
updatedAt: timestamp
```

#### `dealership_reviews`
```
id: uuid (PK)
dealershipId: uuid (FK to dealerships)
userId: uuid (FK to users) - Reviewer
listingId: uuid (FK to car_listings, nullable) - Related car purchase
rating: integer (1-5)
content: text
answer: text - Dealership response
answeredAt: timestamp
images: jsonb - Array of images
isVerified: boolean
createdAt: timestamp
updatedAt: timestamp
```

### 2.3 Transactions & Orders (NEW)

**Purpose**: Track inquiries, test drives, and purchases

#### `inquiries`
```
id: uuid (PK)
listingId: uuid (FK to car_listings)
buyerId: uuid (FK to users)
sellerId: uuid (FK to users)
dealershipId: uuid (FK to dealerships, nullable)
type: enum - GENERAL_INQUIRY, PRICE_NEGOTIATION, TEST_DRIVE_REQUEST, PURCHASE_INTENT
message: text
status: enum - NEW, IN_PROGRESS, RESPONDED, CLOSED, CANCELLED
priority: enum - LOW, MEDIUM, HIGH
assignedTo: uuid (FK to users, nullable) - For dealerships
createdAt: timestamp
updatedAt: timestamp
closedAt: timestamp
```

#### `test_drives`
```
id: uuid (PK)
inquiryId: uuid (FK to inquiries, nullable)
listingId: uuid (FK to car_listings)
customerId: uuid (FK to users)
dealershipId: uuid (FK to dealerships, nullable)
scheduledAt: timestamp
duration: integer - Minutes
location: jsonb - Where test drive happens
status: enum - REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
notes: text
confirmedBy: uuid (FK to users, nullable)
completedAt: timestamp
createdAt: timestamp
updatedAt: timestamp
```

#### `transactions`
```
id: uuid (PK)
listingId: uuid (FK to car_listings)
buyerId: uuid (FK to users)
sellerId: uuid (FK to users)
dealershipId: uuid (FK to dealerships, nullable)
inquiryId: uuid (FK to inquiries, nullable)
type: enum - SALE, RESERVATION, DEPOSIT
status: enum - PENDING, CONFIRMED, COMPLETED, CANCELLED, REFUNDED
amount: decimal(10,2)
currency: string
paymentMethod: enum - CASH, BANK_TRANSFER, FINANCING, TRADE_IN, MIXED
paymentStatus: enum - PENDING, PARTIAL, PAID, REFUNDED
commissionAmount: decimal(10,2) - Platform commission
commissionStatus: enum - PENDING, PAID
notes: text
contractUrl: string - Link to contract document
metadata: jsonb - Additional transaction data
createdAt: timestamp
updatedAt: timestamp
completedAt: timestamp
```

### 2.4 Favorites & Saved Searches (NEW)

#### `favorite_listings`
```
id: uuid (PK)
userId: uuid (FK to users)
listingId: uuid (FK to car_listings)
notes: text - User notes
createdAt: timestamp
```

#### `saved_searches`
```
id: uuid (PK)
userId: uuid (FK to users)
name: string - "BMW under 2M RUB"
filters: jsonb - Search criteria
notifyOnNew: boolean - Email when new matches
createdAt: timestamp
updatedAt: timestamp
```

### 2.5 Pricing & Valuations (NEW)

#### `car_valuations`
```
id: uuid (PK)
listingId: uuid (FK to car_listings, nullable)
userId: uuid (FK to users) - Who requested
make: string
model: string
year: integer
mileage: integer
condition: enum
estimatedValue: decimal(10,2)
valuationRange: jsonb - {min, max}
marketData: jsonb - Comparable listings data
source: enum - AUTOMATED, MANUAL, THIRD_PARTY
createdBy: uuid (FK to admin_users, nullable)
createdAt: timestamp
expiresAt: timestamp
```

---

## Part 3: Admin Panel Database Schema

### 3.1 Admin Users & Permissions

#### `admin_users`
```
id: uuid (PK)
userId: uuid (FK to users, nullable) - Link to main user account
email: string (unique)
password: string - Hashed
firstName: string
lastName: string
phone: string
avatar: jsonb
roleId: uuid (FK to admin_roles)
isActive: boolean
isSuperAdmin: boolean - Full system access
lastLoginAt: timestamp
lastLoginIp: string
passwordChangedAt: timestamp
twoFactorEnabled: boolean
twoFactorSecret: string
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```

#### `admin_roles`
```
id: uuid (PK)
name: string - "Content Moderator", "User Manager", "Super Admin"
slug: string (unique)
description: text
permissions: jsonb - Array of permission slugs
isSystemRole: boolean - Cannot be deleted
createdAt: timestamp
updatedAt: timestamp
```

#### `admin_permissions`
```
id: uuid (PK)
name: string - "Manage Users", "Delete Posts"
slug: string (unique) - "users.manage", "posts.delete"
module: string - "users", "posts", "dealerships", "listings"
description: text
category: string - For grouping in UI
createdAt: timestamp
```

### 3.2 Content Moderation

#### `moderation_queue`
```
id: uuid (PK)
entityType: enum - USER, POST, REVIEW, MESSAGE, LISTING, DEALERSHIP
entityId: uuid - ID of the entity being moderated
reportedBy: uuid (FK to users, nullable) - Who reported
assignedTo: uuid (FK to admin_users, nullable)
reason: enum - SPAM, INAPPROPRIATE_CONTENT, HARASSMENT, FAKE, SCAM, OTHER
description: text
priority: enum - LOW, MEDIUM, HIGH, CRITICAL
status: enum - PENDING, IN_REVIEW, APPROVED, REJECTED, ESCALATED
reviewedBy: uuid (FK to admin_users, nullable)
reviewedAt: timestamp
reviewNotes: text
action: enum - NONE, WARN, REMOVE_CONTENT, SUSPEND_USER, BAN_USER
metadata: jsonb - Screenshots, links, etc.
createdAt: timestamp
updatedAt: timestamp
```

#### `user_reports`
```
id: uuid (PK)
reporterId: uuid (FK to users)
reportedEntityType: enum - USER, POST, REVIEW, MESSAGE, LISTING, DEALERSHIP, COMMENT
reportedEntityId: uuid
reportedUserId: uuid (FK to users, nullable) - If reporting a user
category: enum - SPAM, HARASSMENT, INAPPROPRIATE, FRAUD, VIOLENCE, HATE_SPEECH, OTHER
description: text
evidence: jsonb - Screenshots, URLs
status: enum - NEW, UNDER_REVIEW, RESOLVED, DISMISSED, ESCALATED
assignedTo: uuid (FK to admin_users, nullable)
resolution: text - Admin notes
resolvedAt: timestamp
createdAt: timestamp
```

### 3.3 User Moderation

#### `user_bans`
```
id: uuid (PK)
userId: uuid (FK to users)
bannedBy: uuid (FK to admin_users)
reason: enum - SPAM, HARASSMENT, FRAUD, VIOLATION_TOS, OTHER
description: text - Detailed reason
type: enum - TEMPORARY, PERMANENT
startsAt: timestamp
expiresAt: timestamp (nullable for permanent)
isActive: boolean
appealStatus: enum - NONE, PENDING, APPROVED, REJECTED
appealNotes: text
appealedAt: timestamp
reviewedBy: uuid (FK to admin_users, nullable)
createdAt: timestamp
updatedAt: timestamp
```

#### `user_warnings`
```
id: uuid (PK)
userId: uuid (FK to users)
issuedBy: uuid (FK to admin_users)
reason: enum
message: text - Warning message
severity: enum - LOW, MEDIUM, HIGH
acknowledgedAt: timestamp
createdAt: timestamp
```

#### `user_suspensions`
```
id: uuid (PK)
userId: uuid (FK to users)
suspendedBy: uuid (FK to admin_users)
reason: text
type: enum - CHAT_SUSPEND, POST_SUSPEND, FULL_SUSPEND
startsAt: timestamp
expiresAt: timestamp
isActive: boolean
createdAt: timestamp
```

### 3.4 Audit & Logging

#### `admin_audit_logs`
```
id: uuid (PK)
adminUserId: uuid (FK to admin_users)
action: string - "user.ban", "post.delete", "listing.approve"
entityType: string - "user", "post", "listing"
entityId: uuid
changes: jsonb - Before/after data
ipAddress: string
userAgent: string
result: enum - SUCCESS, FAILED
errorMessage: text
metadata: jsonb
createdAt: timestamp
```

#### `system_logs`
```
id: uuid (PK)
level: enum - DEBUG, INFO, WARNING, ERROR, CRITICAL
module: string - "auth", "payments", "moderation"
message: text
context: jsonb
userId: uuid (FK to users, nullable)
adminUserId: uuid (FK to admin_users, nullable)
ipAddress: string
createdAt: timestamp
```

### 3.5 Analytics & Statistics

#### `daily_statistics`
```
id: uuid (PK)
date: date (unique)
newUsers: integer
activeUsers: integer - DAU
newPosts: integer
newListings: integer
newTransactions: integer
newDealerships: integer
totalRevenue: decimal(10,2)
moderationActions: integer
reportedItems: integer
metadata: jsonb - Additional metrics
createdAt: timestamp
updatedAt: timestamp
```

#### `user_activity_logs`
```
id: uuid (PK)
userId: uuid (FK to users)
action: string - "login", "post_created", "listing_viewed"
entityType: string (nullable)
entityId: uuid (nullable)
metadata: jsonb
ipAddress: string
userAgent: string
createdAt: timestamp
```

### 3.6 System Settings

#### `system_settings`
```
id: uuid (PK)
key: string (unique) - "maintenance_mode", "registration_enabled"
value: jsonb - Any type of value
category: string - "general", "security", "features"
description: text
isPublic: boolean - Can be read by non-admins
updatedBy: uuid (FK to admin_users, nullable)
createdAt: timestamp
updatedAt: timestamp
```

#### `feature_flags`
```
id: uuid (PK)
name: string - "marketplace_enabled", "test_drives_enabled"
slug: string (unique)
isEnabled: boolean
description: text
rolloutPercentage: integer - For gradual rollout
userSegments: jsonb - Target specific user groups
createdAt: timestamp
updatedAt: timestamp
```

### 3.7 Notifications & Announcements

#### `admin_announcements`
```
id: uuid (PK)
title: string
content: text
type: enum - INFO, WARNING, MAINTENANCE, FEATURE, PROMOTION
priority: enum - LOW, MEDIUM, HIGH
targetAudience: enum - ALL_USERS, VERIFIED_USERS, DEALERSHIPS, SPECIFIC_USERS
userSegment: jsonb - Criteria for targeting
status: enum - DRAFT, SCHEDULED, PUBLISHED, EXPIRED
scheduledAt: timestamp
publishedAt: timestamp
expiresAt: timestamp
createdBy: uuid (FK to admin_users)
style: jsonb - Colors, icons for display
metadata: jsonb
createdAt: timestamp
updatedAt: timestamp
```

#### `bulk_notifications`
```
id: uuid (PK)
createdBy: uuid (FK to admin_users)
title: string
message: text
type: enum (NotificationType)
targetUsers: jsonb - Array of user IDs or criteria
totalRecipients: integer
sentCount: integer
failedCount: integer
status: enum - PENDING, IN_PROGRESS, COMPLETED, FAILED
scheduledAt: timestamp
completedAt: timestamp
metadata: jsonb
createdAt: timestamp
```

---

## Part 4: Admin Operations Matrix

### 4.1 User Management Operations

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View Users | `users.view` | List and search users |
| View User Details | `users.view.details` | Full user profile |
| Edit Users | `users.edit` | Update user information |
| Delete Users | `users.delete` | Soft delete users |
| Ban Users | `users.ban` | Temporary/permanent bans |
| Unban Users | `users.unban` | Remove bans |
| Change Roles | `users.roles.manage` | Assign roles |
| Reset Password | `users.password.reset` | Force password reset |
| Impersonate User | `users.impersonate` | Login as user (audit logged) |
| Export Users | `users.export` | Export user data |

### 4.2 Content Management Operations

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View Posts | `posts.view` | List all posts |
| Moderate Posts | `posts.moderate` | Approve/reject |
| Delete Posts | `posts.delete` | Remove posts |
| Feature Posts | `posts.feature` | Promote to homepage |
| Edit Posts | `posts.edit` | Modify content |
| Manage Hashtags | `hashtags.manage` | Create/edit/delete hashtags |

### 4.3 Marketplace Operations (NEW)

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View Listings | `listings.view` | All car listings |
| Approve Listings | `listings.approve` | Verify and approve |
| Feature Listings | `listings.feature` | Premium placement |
| Edit Listings | `listings.edit` | Modify details |
| Delete Listings | `listings.delete` | Remove listings |
| Manage Dealerships | `dealerships.manage` | CRUD dealerships |
| Verify Dealerships | `dealerships.verify` | Verify legitimacy |
| View Transactions | `transactions.view` | All transactions |
| Manage Valuations | `valuations.manage` | Car valuations |

### 4.4 Moderation Operations

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View Queue | `moderation.view` | Moderation queue |
| Assign Items | `moderation.assign` | Assign to moderators |
| Review Items | `moderation.review` | Approve/reject |
| View Reports | `reports.view` | User reports |
| Resolve Reports | `reports.resolve` | Handle reports |

### 4.5 Analytics Operations

| Operation | Permission | Description |
|-----------|-----------|-------------|
| View Dashboard | `analytics.dashboard` | Main analytics |
| View Reports | `analytics.reports` | Detailed reports |
| Export Data | `analytics.export` | Export analytics |

### 4.6 System Operations

| Operation | Permission | Description |
|-----------|-----------|-------------|
| Manage Settings | `system.settings` | System configuration |
| View Logs | `system.logs` | Audit logs |
| Manage Admins | `admins.manage` | Admin users |
| Manage Roles | `roles.manage` | Admin roles |
| Send Announcements | `announcements.send` | System announcements |

---

## Part 5: Recommended Admin Role Templates

### 5.1 Super Admin
**Permissions**: ALL
- Full system access
- Manage other admins
- System settings
- Cannot be banned or restricted

### 5.2 Content Moderator
**Permissions**:
- `posts.view`, `posts.moderate`, `posts.delete`
- `reviews.view`, `reviews.moderate`, `reviews.delete`
- `messages.view`, `messages.delete`
- `moderation.view`, `moderation.review`
- `reports.view`, `reports.resolve`

### 5.3 User Manager
**Permissions**:
- `users.view`, `users.view.details`, `users.edit`
- `users.ban`, `users.unban`
- `users.password.reset`
- `reports.view`, `reports.resolve`

### 5.4 Marketplace Manager (NEW)
**Permissions**:
- `listings.view`, `listings.approve`, `listings.edit`, `listings.delete`
- `dealerships.view`, `dealerships.verify`, `dealerships.edit`
- `transactions.view`
- `valuations.manage`

### 5.5 Support Agent
**Permissions**:
- `users.view`, `users.view.details`
- `listings.view`
- `reports.view`
- `announcements.send`

### 5.6 Analytics Manager
**Permissions**:
- `analytics.dashboard`, `analytics.reports`, `analytics.export`
- `users.view` (read-only)
- `listings.view` (read-only)
- `transactions.view` (read-only)

---

## Part 6: Implementation Priority

### Phase 1: Core Admin (CRITICAL)
1. ✅ `admin_users` - Admin accounts
2. ✅ `admin_roles` - Role-based access
3. ✅ `admin_permissions` - Permission system
4. ✅ `admin_audit_logs` - Audit trail
5. ✅ `moderation_queue` - Content moderation
6. ✅ `user_reports` - User reporting
7. ✅ `user_bans` - Ban management

### Phase 2: Marketplace (HIGH PRIORITY)
1. 🔶 `car_listings` - Car marketplace
2. 🔶 `car_listing_images` - Listing photos
3. 🔶 `car_categories` - Categories
4. 🔶 `dealerships` - Dealership accounts
5. 🔶 `inquiries` - Lead management
6. 🔶 `transactions` - Sales tracking

### Phase 3: Enhanced Features (MEDIUM)
1. 🔶 `test_drives` - Test drive scheduling
2. 🔶 `dealership_staff` - Staff management
3. 🔶 `dealership_reviews` - Dealership ratings
4. 🔶 `car_valuations` - Price estimations
5. 🔶 `favorite_listings` - User favorites
6. 🔶 `saved_searches` - Search alerts

### Phase 4: Analytics & Advanced (LOW)
1. 🔷 `daily_statistics` - Analytics
2. 🔷 `user_activity_logs` - Activity tracking
3. 🔷 `admin_announcements` - System announcements
4. 🔷 `system_settings` - Configuration
5. 🔷 `feature_flags` - Feature toggles

---

## Part 7: Database Indexes (Performance)

### Critical Indexes for Admin Panel

```sql
-- Admin Users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(roleId);
CREATE INDEX idx_admin_users_active ON admin_users(isActive);

-- Moderation Queue
CREATE INDEX idx_moderation_status ON moderation_queue(status);
CREATE INDEX idx_moderation_priority ON moderation_queue(priority);
CREATE INDEX idx_moderation_entity ON moderation_queue(entityType, entityId);
CREATE INDEX idx_moderation_assigned ON moderation_queue(assignedTo);

-- User Reports
CREATE INDEX idx_reports_status ON user_reports(status);
CREATE INDEX idx_reports_reporter ON user_reports(reporterId);
CREATE INDEX idx_reports_entity ON user_reports(reportedEntityType, reportedEntityId);

-- User Bans
CREATE INDEX idx_bans_user ON user_bans(userId, isActive);
CREATE INDEX idx_bans_expires ON user_bans(expiresAt);

-- Car Listings (NEW)
CREATE INDEX idx_listings_status ON car_listings(status);
CREATE INDEX idx_listings_user ON car_listings(userId);
CREATE INDEX idx_listings_dealership ON car_listings(dealershipId);
CREATE INDEX idx_listings_make_model ON car_listings(make, model);
CREATE INDEX idx_listings_price ON car_listings(price);
CREATE INDEX idx_listings_featured ON car_listings(isFeatured, featuredUntil);
CREATE INDEX idx_listings_created ON car_listings(createdAt);

-- Dealerships (NEW)
CREATE INDEX idx_dealerships_owner ON dealerships(ownerId);
CREATE INDEX idx_dealerships_verified ON dealerships(verificationStatus);
CREATE INDEX idx_dealerships_active ON dealerships(isActive);

-- Transactions (NEW)
CREATE INDEX idx_transactions_buyer ON transactions(buyerId);
CREATE INDEX idx_transactions_seller ON transactions(sellerId);
CREATE INDEX idx_transactions_listing ON transactions(listingId);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Audit Logs
CREATE INDEX idx_audit_admin ON admin_audit_logs(adminUserId);
CREATE INDEX idx_audit_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_entity ON admin_audit_logs(entityType, entityId);
CREATE INDEX idx_audit_created ON admin_audit_logs(createdAt);
```

---

## Summary

### Current Backend Can Manage:
✅ Users (8,000+ potential operations)
✅ Posts & Content (moderation, deletion)
✅ Reviews (verification, moderation)
✅ Chats & Messages (monitoring, moderation)
✅ Files (storage management)
✅ Notifications (bulk sending)
✅ User Relationships (followers, blocks)

### NEW Features Needed:
🔶 **Car Listings** - Complete marketplace functionality
🔶 **Dealerships** - Business accounts
🔶 **Transactions** - Sales & inquiries
🔶 **Test Drives** - Scheduling system
🔶 **Valuations** - Price estimates

### Admin Infrastructure:
🔧 **Admin Users** - Separate admin accounts
🔧 **RBAC System** - Roles & permissions
🔧 **Moderation Queue** - Content review
🔧 **Audit Logs** - Complete tracking
🔧 **Analytics** - Business intelligence
🔧 **Reports** - User complaints

### Total New Tables Required:
- **Core Admin**: 7 tables
- **Marketplace**: 11 tables
- **Analytics**: 3 tables
- **System**: 4 tables
**TOTAL: 25 new tables**

### Estimated Development Time:
- Phase 1 (Core Admin): 3-4 weeks
- Phase 2 (Marketplace): 4-6 weeks
- Phase 3 (Enhanced): 3-4 weeks
- Phase 4 (Analytics): 2-3 weeks
**TOTAL: 12-17 weeks**
