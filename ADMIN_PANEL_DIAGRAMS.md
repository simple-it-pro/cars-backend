# Admin Panel - Database Diagrams

## Overview

This document contains visual diagrams for the admin panel database structure including:
1. Complete Entity Relationship Diagram (ERD)
2. Admin Module Architecture
3. Marketplace Module Architecture
4. Moderation Flow Diagram
5. Permission System Diagram

---

## 1. Complete Admin Panel ERD (All New Tables)

This diagram shows all NEW entities required for the admin panel and marketplace features.

```mermaid
erDiagram
    %% ============ ADMIN SYSTEM ============
    ADMIN_USERS ||--o{ ADMIN_AUDIT_LOGS : creates
    ADMIN_USERS ||--o{ MODERATION_QUEUE : reviews
    ADMIN_USERS ||--o{ USER_BANS : issues
    ADMIN_USERS ||--o{ USER_WARNINGS : issues
    ADMIN_USERS }o--|| ADMIN_ROLES : has

    ADMIN_ROLES ||--o{ ADMIN_USERS : contains
    ADMIN_ROLES }o--o{ ADMIN_PERMISSIONS : has

    USERS ||--o{ USER_REPORTS : creates
    USERS ||--o{ USER_BANS : receives
    USERS ||--o{ USER_WARNINGS : receives
    USERS ||--o{ USER_SUSPENSIONS : receives

    MODERATION_QUEUE }o--|| ADMIN_USERS : assigned_to
    USER_REPORTS }o--|| ADMIN_USERS : assigned_to

    %% ============ MARKETPLACE ============
    USERS ||--o{ CAR_LISTINGS : creates
    USERS ||--o{ DEALERSHIPS : owns
    USERS ||--o{ FAVORITE_LISTINGS : saves
    USERS ||--o{ SAVED_SEARCHES : creates

    DEALERSHIPS ||--o{ CAR_LISTINGS : has
    DEALERSHIPS ||--o{ DEALERSHIP_STAFF : employs
    DEALERSHIPS ||--o{ DEALERSHIP_REVIEWS : receives
    DEALERSHIPS ||--o{ TRANSACTIONS : participates

    CAR_LISTINGS ||--o{ CAR_LISTING_IMAGES : has
    CAR_LISTINGS ||--o{ INQUIRIES : receives
    CAR_LISTINGS ||--o{ TEST_DRIVES : scheduled_for
    CAR_LISTINGS ||--o{ TRANSACTIONS : involves
    CAR_LISTINGS ||--o{ FAVORITE_LISTINGS : favorited
    CAR_LISTINGS ||--o{ CAR_VALUATIONS : has
    CAR_LISTINGS }o--o{ CAR_CATEGORIES : belongs_to

    CAR_LISTING_IMAGES }o--|| FILES : references

    INQUIRIES ||--o{ TEST_DRIVES : generates
    INQUIRIES ||--o{ TRANSACTIONS : leads_to

    %% ============ ANALYTICS ============
    DAILY_STATISTICS ||--o| USERS : tracks
    USER_ACTIVITY_LOGS }o--|| USERS : logs

    %% ============ SYSTEM ============
    ADMIN_USERS ||--o{ ADMIN_ANNOUNCEMENTS : creates
    ADMIN_USERS ||--o{ BULK_NOTIFICATIONS : sends
    ADMIN_USERS ||--o{ SYSTEM_SETTINGS : updates

    %% ============ ENTITY DEFINITIONS ============

    ADMIN_USERS {
        uuid id PK
        uuid userId FK
        string email UK
        string password
        string firstName
        string lastName
        string phone
        jsonb avatar
        uuid roleId FK
        boolean isActive
        boolean isSuperAdmin
        timestamp lastLoginAt
        string lastLoginIp
        timestamp createdAt
        timestamp updatedAt
    }

    ADMIN_ROLES {
        uuid id PK
        string name
        string slug UK
        text description
        jsonb permissions
        boolean isSystemRole
        timestamp createdAt
        timestamp updatedAt
    }

    ADMIN_PERMISSIONS {
        uuid id PK
        string name
        string slug UK
        string module
        text description
        string category
        timestamp createdAt
    }

    ADMIN_AUDIT_LOGS {
        uuid id PK
        uuid adminUserId FK
        string action
        string entityType
        uuid entityId
        jsonb changes
        string ipAddress
        string userAgent
        enum result
        text errorMessage
        timestamp createdAt
    }

    MODERATION_QUEUE {
        uuid id PK
        enum entityType
        uuid entityId
        uuid reportedBy FK
        uuid assignedTo FK
        enum reason
        text description
        enum priority
        enum status
        uuid reviewedBy FK
        timestamp reviewedAt
        text reviewNotes
        enum action
        jsonb metadata
        timestamp createdAt
    }

    USER_REPORTS {
        uuid id PK
        uuid reporterId FK
        enum reportedEntityType
        uuid reportedEntityId
        uuid reportedUserId FK
        enum category
        text description
        jsonb evidence
        enum status
        uuid assignedTo FK
        text resolution
        timestamp resolvedAt
        timestamp createdAt
    }

    USER_BANS {
        uuid id PK
        uuid userId FK
        uuid bannedBy FK
        enum reason
        text description
        enum type
        timestamp startsAt
        timestamp expiresAt
        boolean isActive
        enum appealStatus
        text appealNotes
        timestamp appealedAt
        uuid reviewedBy FK
        timestamp createdAt
    }

    USER_WARNINGS {
        uuid id PK
        uuid userId FK
        uuid issuedBy FK
        enum reason
        text message
        enum severity
        timestamp acknowledgedAt
        timestamp createdAt
    }

    USER_SUSPENSIONS {
        uuid id PK
        uuid userId FK
        uuid suspendedBy FK
        text reason
        enum type
        timestamp startsAt
        timestamp expiresAt
        boolean isActive
        timestamp createdAt
    }

    CAR_LISTINGS {
        uuid id PK
        uuid userId FK
        uuid dealershipId FK
        string title
        text description
        enum status
        enum condition
        decimal price
        string currency
        boolean negotiable
        integer mileage
        integer year
        string make
        string model
        string trim
        string vin UK
        enum bodyType
        enum fuelType
        enum transmission
        enum drivetrain
        string exteriorColor
        string interiorColor
        integer doors
        integer seats
        decimal engineSize
        integer horsepower
        integer viewCount
        integer favoriteCount
        jsonb location
        jsonb features
        jsonb specifications
        boolean isVerified
        boolean isFeatured
        timestamp featuredUntil
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }

    CAR_LISTING_IMAGES {
        uuid id PK
        uuid listingId FK
        uuid fileId FK
        integer order
        boolean isPrimary
        string caption
        timestamp createdAt
    }

    CAR_CATEGORIES {
        uuid id PK
        string name
        string slug UK
        text description
        uuid parentId FK
        string icon
        integer order
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    DEALERSHIPS {
        uuid id PK
        uuid ownerId FK
        string name
        string slug UK
        text description
        string email
        string phone
        string website
        jsonb logo
        jsonb coverImage
        jsonb address
        jsonb location
        jsonb businessHours
        string licenseNumber
        string taxId
        decimal rating
        integer reviewCount
        enum verificationStatus
        boolean isActive
        boolean isPremium
        timestamp premiumUntil
        integer establishedYear
        jsonb specializations
        jsonb socialMedia
        timestamp createdAt
        timestamp updatedAt
    }

    DEALERSHIP_STAFF {
        uuid id PK
        uuid dealershipId FK
        uuid userId FK
        enum role
        jsonb permissions
        boolean isActive
        timestamp hiredAt
        timestamp createdAt
    }

    DEALERSHIP_REVIEWS {
        uuid id PK
        uuid dealershipId FK
        uuid userId FK
        uuid listingId FK
        integer rating
        text content
        text answer
        timestamp answeredAt
        jsonb images
        boolean isVerified
        timestamp createdAt
        timestamp updatedAt
    }

    INQUIRIES {
        uuid id PK
        uuid listingId FK
        uuid buyerId FK
        uuid sellerId FK
        uuid dealershipId FK
        enum type
        text message
        enum status
        enum priority
        uuid assignedTo FK
        timestamp createdAt
        timestamp updatedAt
        timestamp closedAt
    }

    TEST_DRIVES {
        uuid id PK
        uuid inquiryId FK
        uuid listingId FK
        uuid customerId FK
        uuid dealershipId FK
        timestamp scheduledAt
        integer duration
        jsonb location
        enum status
        text notes
        uuid confirmedBy FK
        timestamp completedAt
        timestamp createdAt
    }

    TRANSACTIONS {
        uuid id PK
        uuid listingId FK
        uuid buyerId FK
        uuid sellerId FK
        uuid dealershipId FK
        uuid inquiryId FK
        enum type
        enum status
        decimal amount
        string currency
        enum paymentMethod
        enum paymentStatus
        decimal commissionAmount
        enum commissionStatus
        text notes
        string contractUrl
        jsonb metadata
        timestamp createdAt
        timestamp completedAt
    }

    FAVORITE_LISTINGS {
        uuid id PK
        uuid userId FK
        uuid listingId FK
        text notes
        timestamp createdAt
    }

    SAVED_SEARCHES {
        uuid id PK
        uuid userId FK
        string name
        jsonb filters
        boolean notifyOnNew
        timestamp createdAt
        timestamp updatedAt
    }

    CAR_VALUATIONS {
        uuid id PK
        uuid listingId FK
        uuid userId FK
        string make
        string model
        integer year
        integer mileage
        enum condition
        decimal estimatedValue
        jsonb valuationRange
        jsonb marketData
        enum source
        uuid createdBy FK
        timestamp createdAt
        timestamp expiresAt
    }

    DAILY_STATISTICS {
        uuid id PK
        date date UK
        integer newUsers
        integer activeUsers
        integer newPosts
        integer newListings
        integer newTransactions
        integer newDealerships
        decimal totalRevenue
        integer moderationActions
        integer reportedItems
        jsonb metadata
        timestamp createdAt
    }

    USER_ACTIVITY_LOGS {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        jsonb metadata
        string ipAddress
        string userAgent
        timestamp createdAt
    }

    SYSTEM_SETTINGS {
        uuid id PK
        string key UK
        jsonb value
        string category
        text description
        boolean isPublic
        uuid updatedBy FK
        timestamp createdAt
        timestamp updatedAt
    }

    FEATURE_FLAGS {
        uuid id PK
        string name
        string slug UK
        boolean isEnabled
        text description
        integer rolloutPercentage
        jsonb userSegments
        timestamp createdAt
        timestamp updatedAt
    }

    ADMIN_ANNOUNCEMENTS {
        uuid id PK
        string title
        text content
        enum type
        enum priority
        enum targetAudience
        jsonb userSegment
        enum status
        timestamp scheduledAt
        timestamp publishedAt
        timestamp expiresAt
        uuid createdBy FK
        jsonb style
        timestamp createdAt
    }

    BULK_NOTIFICATIONS {
        uuid id PK
        uuid createdBy FK
        string title
        text message
        enum type
        jsonb targetUsers
        integer totalRecipients
        integer sentCount
        integer failedCount
        enum status
        timestamp scheduledAt
        timestamp completedAt
        timestamp createdAt
    }
```

---

## 2. Admin Module Architecture

This diagram shows how admin modules are organized and their relationships.

```mermaid
graph TB
    subgraph "Admin Core"
        AdminAuth[Admin Authentication<br/>Login, 2FA, Sessions]
        AdminUsers[Admin Users<br/>Admin Accounts]
        AdminRoles[Admin Roles<br/>RBAC System]
        AdminPerms[Permissions<br/>Access Control]
        AuditLogs[Audit Logs<br/>Track All Actions]
    end

    subgraph "User Management"
        UserCRUD[User CRUD<br/>View, Edit, Delete]
        UserBans[Ban System<br/>Temporary/Permanent]
        UserWarnings[Warning System<br/>Issue Warnings]
        UserSuspensions[Suspensions<br/>Restrict Access]
    end

    subgraph "Content Moderation"
        ModQueue[Moderation Queue<br/>Pending Reviews]
        Reports[User Reports<br/>Community Reports]
        ContentReview[Content Review<br/>Approve/Reject]
        AutoMod[Auto Moderation<br/>ML-based Detection]
    end

    subgraph "Marketplace Management"
        ListingMgmt[Listing Management<br/>Approve, Feature, Delete]
        DealerMgmt[Dealership Management<br/>Verify, Manage]
        TransactionMgmt[Transaction Tracking<br/>Monitor Sales]
        ValuationMgmt[Valuation System<br/>Price Estimates]
    end

    subgraph "Analytics & Reporting"
        Dashboard[Admin Dashboard<br/>Key Metrics]
        Reports2[Analytics Reports<br/>Custom Reports]
        Statistics[Daily Statistics<br/>Aggregated Data]
        UserActivity[Activity Logs<br/>User Behavior]
    end

    subgraph "System Management"
        Settings[System Settings<br/>Configuration]
        FeatureFlags[Feature Flags<br/>Toggle Features]
        Announcements[Announcements<br/>System Messages]
        BulkNotifs[Bulk Notifications<br/>Mass Messaging]
    end

    AdminAuth --> AdminUsers
    AdminUsers --> AdminRoles
    AdminRoles --> AdminPerms
    AdminAuth --> AuditLogs

    AdminUsers --> UserCRUD
    UserCRUD --> UserBans
    UserCRUD --> UserWarnings
    UserCRUD --> UserSuspensions

    Reports --> ModQueue
    ModQueue --> ContentReview
    ContentReview --> AuditLogs

    ListingMgmt --> TransactionMgmt
    DealerMgmt --> ListingMgmt

    Dashboard --> Statistics
    Dashboard --> UserActivity
    Statistics --> Reports2

    Settings --> FeatureFlags
    Announcements --> BulkNotifs

    style AdminAuth fill:#e0234e,color:#fff
    style ModQueue fill:#ff6b6b,color:#fff
    style ListingMgmt fill:#4ecdc4,color:#fff
    style Dashboard fill:#95e1d3,color:#000
```

---

## 3. Marketplace Architecture

This diagram shows the complete marketplace module structure.

```mermaid
graph TB
    subgraph "Listing Management"
        CreateListing[Create Listing<br/>Users/Dealerships]
        ListingImages[Upload Images<br/>Multiple Photos]
        Categories[Categorize<br/>Select Category]
        PriceSet[Set Price<br/>Price & Negotiation]
    end

    subgraph "Discovery"
        Search[Search Listings<br/>Advanced Filters]
        Browse[Browse Categories<br/>Category Navigation]
        Featured[Featured Listings<br/>Premium Placement]
        Saved[Saved Searches<br/>Get Alerts]
    end

    subgraph "Interaction"
        ViewListing[View Listing<br/>Detail Page]
        Favorite[Add to Favorites<br/>Save for Later]
        Inquiry[Send Inquiry<br/>Contact Seller]
        RequestTD[Request Test Drive<br/>Schedule Visit]
    end

    subgraph "Dealership"
        DealerProfile[Dealership Profile<br/>Business Info]
        DealerInventory[Manage Inventory<br/>Bulk Operations]
        DealerStaff[Staff Management<br/>Team Access]
        DealerReviews[Dealership Reviews<br/>Customer Feedback]
    end

    subgraph "Transaction"
        LeadMgmt[Lead Management<br/>Track Inquiries]
        TestDrive[Test Drives<br/>Schedule & Track]
        Negotiation[Price Negotiation<br/>Offers & Counter]
        CompleteSale[Complete Sale<br/>Transaction Record]
    end

    subgraph "Admin Control"
        VerifyListing[Verify Listing<br/>Admin Approval]
        VerifyDealer[Verify Dealership<br/>Business Verification]
        MonitorTrans[Monitor Transactions<br/>Fraud Prevention]
        Valuations[Manage Valuations<br/>Price Guidance]
    end

    CreateListing --> ListingImages
    ListingImages --> Categories
    Categories --> PriceSet
    PriceSet --> VerifyListing

    VerifyListing --> Search
    Search --> Browse
    Browse --> Featured
    Featured --> ViewListing

    ViewListing --> Favorite
    ViewListing --> Inquiry
    ViewListing --> RequestTD

    Inquiry --> LeadMgmt
    RequestTD --> TestDrive
    TestDrive --> Negotiation
    Negotiation --> CompleteSale
    CompleteSale --> MonitorTrans

    CreateListing -.->|Dealership| DealerInventory
    DealerInventory --> DealerProfile
    DealerProfile --> DealerStaff
    DealerProfile --> DealerReviews
    DealerProfile --> VerifyDealer

    Search --> Saved

    style CreateListing fill:#4ecdc4,color:#fff
    style VerifyListing fill:#ff6b6b,color:#fff
    style CompleteSale fill:#95e1d3,color:#000
    style DealerProfile fill:#f38181,color:#fff
```

---

## 4. Moderation Flow Sequence

This diagram shows the complete moderation workflow from report to resolution.

```mermaid
sequenceDiagram
    participant User as Regular User
    participant System as System
    participant ModQueue as Moderation Queue
    participant Mod as Moderator
    participant Admin as Admin User
    participant DB as Database
    participant AuditLog as Audit Log

    Note over User,AuditLog: User Reports Content
    User->>System: Report inappropriate content
    System->>DB: Create user_report
    System->>ModQueue: Add to moderation_queue
    System->>User: Report submitted confirmation

    Note over User,AuditLog: Auto-Detection (Optional)
    System->>System: ML content scan
    alt Suspicious Content Detected
        System->>ModQueue: Auto-flag content
        System->>ModQueue: Set priority=HIGH
    end

    Note over User,AuditLog: Moderator Assignment
    Admin->>ModQueue: View pending items
    Admin->>ModQueue: Assign to moderator
    ModQueue->>Mod: Notification sent

    Note over User,AuditLog: Moderation Review
    Mod->>ModQueue: Open item for review
    Mod->>DB: Fetch entity details
    DB-->>Mod: Entity data + history

    Mod->>Mod: Review content

    alt Content Violates Policy
        Mod->>ModQueue: Mark as REJECTED
        Mod->>DB: Take action (delete/suspend)
        Mod->>User: Notify reporter - Resolved
        Mod->>System: Notify violator - Warning/Ban
        Mod->>AuditLog: Log action
    else Content is OK
        Mod->>ModQueue: Mark as APPROVED
        Mod->>User: Notify reporter - Dismissed
        Mod->>AuditLog: Log action
    else Needs Escalation
        Mod->>ModQueue: Escalate to admin
        Mod->>Admin: Request review
        Admin->>ModQueue: Final decision
        Admin->>AuditLog: Log decision
    end

    Note over User,AuditLog: Statistics Update
    ModQueue->>DB: Update daily_statistics
    DB->>DB: Increment moderationActions
```

---

## 5. Admin Permission System Architecture

This diagram shows how the RBAC (Role-Based Access Control) system works.

```mermaid
graph LR
    subgraph "Admin User"
        AdminUser[Admin User<br/>John Doe]
    end

    subgraph "Role Assignment"
        AdminUser -->|has role| Role1[Content Moderator]
        AdminUser -->|has role| Role2[User Manager]
    end

    subgraph "Role Permissions"
        Role1 -->|grants| Perm1[posts.view]
        Role1 -->|grants| Perm2[posts.moderate]
        Role1 -->|grants| Perm3[posts.delete]
        Role1 -->|grants| Perm4[moderation.review]

        Role2 -->|grants| Perm5[users.view]
        Role2 -->|grants| Perm6[users.edit]
        Role2 -->|grants| Perm7[users.ban]
    end

    subgraph "Permission Check"
        Request[API Request:<br/>DELETE /admin/posts/123]

        Request -->|requires| CheckPerm{Has permission?}

        Perm3 -->|Yes| CheckPerm
        CheckPerm -->|Authorized| Execute[Execute Action]
        CheckPerm -->|Denied| Reject[403 Forbidden]

        Execute --> AuditLog[Log to Audit Trail]
    end

    subgraph "Super Admin Override"
        SuperAdmin[Super Admin]
        SuperAdmin -->|bypass| CheckPerm
        SuperAdmin -.->|ALL permissions| Wildcard[*.*]
    end

    style AdminUser fill:#e0234e,color:#fff
    style Role1 fill:#4ecdc4,color:#fff
    style Role2 fill:#95e1d3,color:#000
    style Execute fill:#51cf66,color:#fff
    style Reject fill:#ff6b6b,color:#fff
    style SuperAdmin fill:#ffd93d,color:#000
```

---

## 6. Transaction Lifecycle Diagram

This diagram shows the complete flow from listing view to completed sale.

```mermaid
stateDiagram-v2
    [*] --> ListingCreated: Seller creates listing

    ListingCreated --> PendingApproval: Submit for review

    PendingApproval --> Active: Admin approves
    PendingApproval --> Rejected: Admin rejects
    Rejected --> [*]

    Active --> ViewedByBuyer: Buyer views listing

    ViewedByBuyer --> InquirySent: Buyer sends inquiry
    ViewedByBuyer --> Favorited: Buyer saves listing
    Favorited --> InquirySent

    InquirySent --> InProgress: Seller responds

    InProgress --> TestDriveScheduled: Schedule test drive
    InProgress --> NegotiationStarted: Price discussion

    TestDriveScheduled --> TestDriveCompleted: Complete test drive
    TestDriveCompleted --> NegotiationStarted

    NegotiationStarted --> AgreementReached: Price agreed
    NegotiationStarted --> InquiryClosed: Buyer declines
    InquiryClosed --> [*]

    AgreementReached --> TransactionPending: Create transaction

    TransactionPending --> PaymentReceived: Buyer pays deposit
    TransactionPending --> TransactionCancelled: Cancelled
    TransactionCancelled --> Active: Relist

    PaymentReceived --> SaleCompleted: Transfer ownership

    SaleCompleted --> ListingSold: Mark as sold
    ListingSold --> [*]

    Active --> Expired: Listing expires
    Expired --> Active: Renew
    Expired --> [*]

    note right of PendingApproval
        Admin verifies:
        - Valid information
        - Proper images
        - No fraud indicators
    end note

    note right of TransactionPending
        Platform collects:
        - Commission fee
        - Payment processing
        - Contract generation
    end note
```

---

## 7. Admin Dashboard Metrics Overview

This diagram shows the key metrics displayed on the admin dashboard.

```mermaid
graph TB
    subgraph "User Metrics"
        TotalUsers[Total Users<br/>150,432]
        NewUsers[New Today<br/>+234]
        ActiveUsers[Active Today<br/>12,453]
        BannedUsers[Banned Users<br/>342]
    end

    subgraph "Content Metrics"
        TotalPosts[Total Posts<br/>45,234]
        TotalListings[Total Listings<br/>8,932]
        PendingMod[Pending Moderation<br/>67]
        RemovedContent[Removed Today<br/>23]
    end

    subgraph "Marketplace Metrics"
        ActiveListings[Active Listings<br/>7,821]
        SoldToday[Sold Today<br/>45]
        RevenueToday[Revenue Today<br/>₽2,345,000]
        AvgPrice[Avg Price<br/>₽1,850,000]
    end

    subgraph "Moderation Metrics"
        OpenReports[Open Reports<br/>34]
        ResolvedToday[Resolved Today<br/>89]
        AvgResponseTime[Avg Response<br/>2.3 hours]
        ModQueue[Queue Size<br/>67]
    end

    subgraph "Dealership Metrics"
        TotalDealers[Total Dealerships<br/>432]
        VerifiedDealers[Verified<br/>387]
        PendingVerif[Pending<br/>45]
        DealerRevenue[Dealer Revenue<br/>₽1,234,000]
    end

    subgraph "System Health"
        APIStatus[API Status<br/>✓ Healthy]
        DBStatus[Database<br/>✓ Healthy]
        StorageUsed[Storage Used<br/>834 GB / 2 TB]
        ErrorRate[Error Rate<br/>0.02%]
    end

    Dashboard[Admin Dashboard]

    Dashboard --> TotalUsers
    Dashboard --> TotalPosts
    Dashboard --> ActiveListings
    Dashboard --> OpenReports
    Dashboard --> TotalDealers
    Dashboard --> APIStatus

    style Dashboard fill:#e0234e,color:#fff
    style TotalUsers fill:#4ecdc4,color:#fff
    style TotalListings fill:#95e1d3,color:#000
    style OpenReports fill:#ff6b6b,color:#fff
    style RevenueToday fill:#51cf66,color:#fff
```

---

## 8. Data Flow: From User Report to Resolution

```mermaid
flowchart TD
    Start([User Encounters<br/>Inappropriate Content]) --> Report[User Clicks<br/>Report Button]

    Report --> SelectReason{Select Reason}

    SelectReason -->|Spam| CreateReport1[Create Report:<br/>Category=SPAM]
    SelectReason -->|Harassment| CreateReport2[Create Report:<br/>Category=HARASSMENT]
    SelectReason -->|Fraud| CreateReport3[Create Report:<br/>Category=FRAUD]
    SelectReason -->|Other| CreateReport4[Create Report:<br/>Category=OTHER]

    CreateReport1 --> SaveDB[(Save to<br/>user_reports)]
    CreateReport2 --> SaveDB
    CreateReport3 --> SaveDB
    CreateReport4 --> SaveDB

    SaveDB --> AddQueue[Add to<br/>moderation_queue]

    AddQueue --> CheckPriority{Auto-detect<br/>Priority}

    CheckPriority -->|Multiple Reports| HighPriority[Set Priority:<br/>HIGH]
    CheckPriority -->|Fraud/Violence| HighPriority
    CheckPriority -->|Other| NormalPriority[Set Priority:<br/>NORMAL]

    HighPriority --> NotifyMods[Notify Available<br/>Moderators]
    NormalPriority --> WaitQueue[Add to<br/>Pending Queue]

    NotifyMods --> ModReview[Moderator<br/>Reviews Content]
    WaitQueue --> ModReview

    ModReview --> Evaluate{Evaluate<br/>Content}

    Evaluate -->|Violates Policy| TakeAction[Take Action]
    Evaluate -->|Within Policy| Dismiss[Dismiss Report]
    Evaluate -->|Unclear| Escalate[Escalate to<br/>Senior Admin]

    TakeAction --> ActionType{Action Type}

    ActionType -->|Minor| Warn[Issue Warning]
    ActionType -->|Moderate| Remove[Remove Content]
    ActionType -->|Severe| Ban[Ban User]

    Warn --> NotifyUser[Notify User]
    Remove --> NotifyUser
    Ban --> NotifyUser

    NotifyUser --> LogAudit[Log to<br/>Audit Trail]
    Dismiss --> LogAudit

    Escalate --> AdminReview[Admin Reviews]
    AdminReview --> Evaluate

    LogAudit --> UpdateStats[Update<br/>Statistics]
    UpdateStats --> NotifyReporter[Notify Reporter<br/>of Resolution]
    NotifyReporter --> End([Case Closed])

    style Start fill:#4ecdc4,color:#fff
    style TakeAction fill:#ff6b6b,color:#fff
    style LogAudit fill:#95e1d3,color:#000
    style End fill:#51cf66,color:#fff
```

---

## Summary

These diagrams provide a complete visual overview of:

1. **Complete ERD** - All 25 new database tables with relationships
2. **Admin Module Architecture** - How admin features are organized
3. **Marketplace Architecture** - Complete marketplace flow
4. **Moderation Flow** - Step-by-step moderation process
5. **Permission System** - RBAC implementation
6. **Transaction Lifecycle** - From listing to sale
7. **Dashboard Metrics** - Key performance indicators
8. **Report Resolution Flow** - Complete moderation workflow

### Key Relationships:
- Admin users have roles → Roles have permissions
- Content generates reports → Reports enter moderation queue
- Listings belong to users OR dealerships
- Transactions link buyers, sellers, listings, and inquiries
- Everything is tracked in audit logs
