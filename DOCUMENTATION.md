# 📚 Family Hub - Complete Project Documentation

A detailed guide explaining every module, function, and feature in the Family Hub application.

---

## 📑 Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [Family & Member Management](#2-family--member-management)
3. [Task Management Module](#3-task-management-module)
4. [Points & Rewards System](#4-points--rewards-system)
5. [Budget Module](#5-budget-module)
6. [Inventory & Food Management](#6-inventory--food-management)
7. [Location & Map Features](#7-location--map-features)
8. [Settings & Profile Management](#8-settings--profile-management)

---

---

## 1. Authentication Module

### Overview
The authentication module handles user registration, login, password management, and session management with multi-family support. A single email can be linked to multiple families.

### Key Features
- **Multi-Family Support**: One email can have accounts in multiple families
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt for secure password storage
- **Email Verification**: Optional email verification for security
- **Session Management**: Profile switching and active session tracking

### Database Models

#### `FamilyAccountModel`
Stores family-level authentication details.

**Fields:**
- `email` (String, unique) - Family email address
- `password` (String, hashed) - Family password
- `familyTitle` (String) - Name of the family
- `createdAt` (Date) - Account creation date
- `isVerified` (Boolean) - Email verification status

**Relationships:**
- Has many Members
- Has many Tasks
- Has many Point Wallets

#### `MemberModel`
Individual family members with role-based access.

**Fields:**
- `username` (String, unique per family) - Member username
- `mail` (String, unique per family) - Member email
- `family_id` (ObjectId) - Reference to FamilyAccount
- `member_type` (String) - Role: "Parent", "Child", etc.
- `birth_date` (Date) - Member's birthdate
- `profile_pic` (String) - Profile picture URL
- `isActive` (Boolean) - Account status

**Indexes:**
- `{ username, family_id }` - Ensure username is unique per family
- `{ mail, family_id }` - Ensure email is unique per family

### API Endpoints

#### 1. **POST `/api/auth/signup`** - Register New Family
**Request Body:**
```json
{
  "email": "family@example.com",
  "password": "securePassword123",
  "familyTitle": "Smith Family",
  "username": "parent_user",
  "birth_date": "1990-01-15",
  "Title": "Smith Family"
}
```

**Backend Flow:**
- Validate email format and password strength
- Check if email already exists in database
- Hash password using BCrypt (10 salt rounds)
- Create new FamilyAccount document
- Create first Member (parent) for the family
- Initialize Point Wallet for new member
- Return JWT token and user data

**Flutter Implementation:**
- Form validation (email, password, username)
- Show loading indicator during signup
- Save JWT token to SharedPreferences
- Save user profile to local storage
- Navigate to home page on success
- Display error snackbar on failure

---

#### 2. **POST `/api/auth/login`** - Standard Login
**Request Body:**
```json
{
  "mail": "user@example.com",
  "password": "password123",
  "family_id": "64a5f8c9e1f2b3c4d5e6f7g8"
}
```

**Backend Flow:**
- Find FamilyAccount by email
- Compare password with stored hash
- Find Member in that family
- Generate JWT token with user data
- Update last login timestamp
- Return token and user profile

**Database Query:**
```
1. Find FamilyAccount by email
2. Verify password hash
3. Find Member where family_id = X
4. Generate JWT token
```

---

#### 3. **GET `/api/auth/families`** - Get Families by Email
**Purpose:** Allow users to select which family they want to log into (multi-family support)

**Request:**
```
GET /api/auth/families?email=user@example.com
```

**Backend Flow:**
- Find all FamilyAccounts linked to this email
- For each family, find member data
- Return list of families with member details
- User selects family and enters password

**Response:**
```json
{
  "families": [
    {
      "family_id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "familyTitle": "Smith Family",
      "username": "parent_user"
    },
    {
      "family_id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "familyTitle": "Johnson Family",
      "username": "child_user"
    }
  ]
}
```

**Flutter Flow:**
1. User enters email on login screen
2. App calls `/api/auth/families` endpoint
3. Display list of families as selectable chips
4. User selects a family
5. Navigate to password entry screen
6. Submit password for selected family

---

#### 4. **POST `/api/auth/setPassword`** - Set/Change Password
**Purpose:** First-time password setup or password change for existing accounts

**Request Body:**
```json
{
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Backend Flow:**
- Validate JWT token (user must be authenticated)
- Validate password strength (6+ characters, as per testing mode)
- Hash new password
- Update Member document
- Return success message

**Flutter Implementation:**
- Show dialog only on first login (isFirstLogin = true)
- Require password confirmation
- Show/hide password toggle
- Validate passwords match before submission
- Display success snackbar
- Proceed to home page

---

#### 5. **POST `/api/auth/logout`** - Logout Current Profile
**Request Body:**
```json
{
  "profileKey": "profile_key_abc123"
}
```

**Backend Flow:**
- Verify JWT token
- Clear active session for this profile
- Remove profile from active sessions list
- Return success

**Flutter Implementation:**
- Clear JWT token from storage
- Clear user data from SharedPreferences
- Clear active profile from storage
- Navigate to login screen
- Show success message

---

#### 6. **POST `/api/auth/logoutAll`** - Logout All Profiles
**Purpose:** User wants to exit from all logged-in devices/profiles

**Backend Flow:**
- Verify JWT token
- Find all active sessions for user
- Clear all sessions
- Invalidate all tokens

**Flutter Implementation:**
- Confirm action with alert dialog
- Clear all saved profiles from local storage
- Clear all tokens
- Clear all user data
- Navigate to login screen
- Show "Logged out from all devices" message

---

### Frontend Implementation (`flutter_app/lib/pages/signup_login.dart`)

#### `LoginPage` Class
**Purpose:** Handle email input and display saved profiles

**Key Functions:**
- `_loadSavedProfiles()` - Fetch saved profiles from storage
- `_quickSwitchProfile(profileKey)` - Switch to different profile
- `_handleEmailSubmit()` - Validate email and fetch families
- `_showAccountSwitcherSheet()` - Show bottom sheet with saved accounts

**Flow:**
```
1. User enters email
2. Click "Continue" button
3. Call _handleEmailSubmit()
4. Fetch families for email from backend
5. Navigate to FamilyPasswordLoginPage
6. Show family selector and password input
```

---

#### `FamilyPasswordLoginPage` Class
**Purpose:** Handle password entry for selected family

**Key Functions:**
- `_handleLogin()` - Submit credentials to backend
- `_navigateToHome()` - Navigate after successful login
- `_showSetPasswordDialog()` - Show password setup for first login

**Flow:**
```
1. Display list of families as dropdown
2. User selects family
3. User enters password
4. Click "Log In"
5. Call _handleLogin()
6. If isFirstLogin = true:
   - Show password setup dialog
   - User sets new password
7. Navigate to home page
8. Save profile as "active"
```

---

#### `SignUpPage` Class
**Purpose:** Handle new account registration

**Key Functions:**
- `_selectDate()` - Show date picker for birthdate
- `_handleSignUp()` - Submit registration data
- Form validation methods

**Flow:**
```
1. User fills signup form
   - Email
   - Birthdate
   - Family Title
   - Username
   - Password
   - Confirm Password
2. Click "Sign Up"
3. Validate all fields
4. Call _handleSignUp()
5. Submit to /api/auth/signup endpoint
6. If success:
   - Show success message
   - Navigate to login page
7. If error:
   - Show error snackbar
```

---

### Security Features

**Password Hashing:**
- Uses BCrypt with 10 salt rounds
- Passwords never stored in plain text
- Comparison is timing-safe

**JWT Tokens:**
- Stored in SharedPreferences (Flutter)
- Expires in 90 days
- Verified on every protected endpoint

**Family Scoping:**
- All data queries are scoped by family_id
- Prevents cross-family data access
- Validated at middleware level

---

---

## 2. Family & Member Management

### Overview
This module handles family creation, member management, member types, and family-level settings.

### Key Features
- Create and manage family accounts
- Add/remove family members
- Define member roles (Parent, Child, Guardian, etc.)
- View all family members
- Member profile management

### Database Models

#### `MemberTypeModel`
Defines roles available in the system.

**Fields:**
- `type_name` (String) - Role name ("Parent", "Child", etc.)
- `permissions` (Array) - Permissions for this role
- `description` (String) - Description of role
- `family_id` (ObjectId) - Reference to family

**Default Types:**
- Parent - Full access
- Child - Limited access
- Guardian - Parental-like access
- Teen - More access than child

---

### API Endpoints

#### 1. **POST `/api/members`** - Add New Family Member
**Request Body:**
```json
{
  "mail": "child@example.com",
  "username": "child_username",
  "birth_date": "2015-05-20",
  "member_type": "Child"
}
```

**Backend Flow:**
- Verify JWT (only Parent can add members)
- Validate member_type exists
- Create new Member document
- Check for duplicate username in family
- Create Point Wallet for new member
- Return new member data

**Family Scoping:**
- All members must have family_id set to current family
- Username uniqueness checked per family
- Email uniqueness checked per family

---

#### 2. **GET `/api/members`** - Get All Family Members
**Purpose:** Display list of all family members

**Response:**
```json
{
  "members": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "username": "parent_user",
      "mail": "parent@example.com",
      "member_type": "Parent",
      "birth_date": "1990-01-15",
      "profile_pic": "https://..."
    },
    {
      "id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "username": "child_user",
      "mail": "child@example.com",
      "member_type": "Child",
      "birth_date": "2015-05-20"
    }
  ]
}
```

**Backend Flow:**
- Verify JWT token
- Get current family_id from token
- Query all Members where family_id = current
- Return sorted by member_type

---

#### 3. **DELETE `/api/members/:id`** - Remove Family Member
**Purpose:** Remove a member from the family

**Backend Flow:**
- Verify JWT (only Parent can remove members)
- Check member exists in current family
- Delete all related data:
  - Tasks assigned to member
  - Point wallets and history
  - Wishlist items
- Delete Member document
- Return success

---

#### 4. **GET `/api/memberTypes`** - Get Available Member Types
**Purpose:** Display member type options when adding new member

**Response:**
```json
{
  "memberTypes": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "type_name": "Parent",
      "permissions": ["manage_tasks", "manage_members", "approve_tasks"],
      "description": "Full access to family features"
    },
    {
      "id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "type_name": "Child",
      "permissions": ["view_tasks", "complete_tasks"],
      "description": "Limited access, can view and complete tasks"
    }
  ]
}
```

---

### Frontend Implementation (`flutter_app/lib/pages/home.dart`)

#### Profile Switching Feature
**Purpose:** Quickly switch between different family accounts (Instagram-style)

**Key Functions:**
- `_loadSavedProfiles()` - Fetch all saved profiles from storage
- `_switchProfileFromHome()` - Switch to different profile
- `_showAccountSwitcherSheet()` - Display account switching UI
- `_fetchFamilyMembers()` - Load members for current profile

**Flow:**
```
1. User long-presses profile icon on home
2. Show bottom sheet with all saved profiles
3. Current profile highlighted in green
4. Click different profile
5. Call _switchProfileFromHome()
6. Clear current user data
7. Load new profile data
8. Reload family members
9. Show success snackbar
```

---

---

## 3. Task Management Module

### Overview
The task management system allows parents to create tasks, assign them to children, track completion, and award points upon completion.

### Key Features
- Create and assign tasks
- Set due dates and priorities
- Track task status (Pending, In Progress, Completed)
- Award points for completed tasks
- Task categories and organization
- Task history tracking

### Database Models

#### `taskModel`
Stores individual tasks.

**Fields:**
- `task_name` (String) - Task title
- `description` (String) - Task details
- `assigned_to` (ObjectId) - Member ID
- `assigned_by` (ObjectId) - Parent ID
- `family_id` (ObjectId) - Family reference
- `category` (String) - Task category
- `due_date` (Date) - Task due date
- `priority` (String) - "Low", "Medium", "High"
- `status` (String) - "Pending", "In Progress", "Completed"
- `points_reward` (Number) - Points for completion
- `createdAt` (Date) - Creation date
- `completedAt` (Date) - Completion date

**Indexes:**
- `{ family_id, assigned_to }` - Get tasks for member in family
- `{ family_id, status }` - Filter by status

---

#### `task_categoryModel`
Categories for organizing tasks.

**Fields:**
- `category_name` (String) - Category title
- `family_id` (ObjectId) - Family reference
- `color` (String) - Display color (hex)
- `icon` (String) - Icon name

---

#### `task_historyModel`
Tracks task completion history.

**Fields:**
- `task_id` (ObjectId) - Reference to task
- `member_id` (ObjectId) - Who completed it
- `family_id` (ObjectId) - Family reference
- `completed_date` (Date) - When completed
- `points_awarded` (Number) - Points given
- `notes` (String) - Completion notes
- `proof_image` (String) - Image URL (for proof)

---

### API Endpoints

#### 1. **POST `/api/tasks`** - Create New Task
**Request Body:**
```json
{
  "task_name": "Clean Bedroom",
  "description": "Organize toys and make bed",
  "assigned_to": "65b6f9d0e2f3c4d5e6f7g8h9",
  "category": "Household Chores",
  "due_date": "2026-04-25",
  "priority": "High",
  "points_reward": 50
}
```

**Backend Flow:**
1. Verify JWT (Parent access only)
2. Validate assigned_to member exists in family
3. Validate category exists
4. Create Task document with family_id
5. Send notification to assigned member
6. Return task data

---

#### 2. **GET `/api/tasks`** - Get Tasks
**Query Parameters:**
```
GET /api/tasks?status=Pending&assigned_to=memberId
```

**Backend Flow:**
1. Verify JWT
2. Get family_id from token
3. Query Tasks with filters:
   - family_id = current family
   - status = query parameter
   - assigned_to = query parameter
4. Sort by due_date (earliest first)
5. Return paginated results

---

#### 3. **PATCH `/api/tasks/:id`** - Update Task Status
**Request Body:**
```json
{
  "status": "Completed",
  "proof_image": "https://image-url.jpg",
  "notes": "Task completed successfully"
}
```

**Backend Flow:**
1. Find task by ID
2. Verify user is Parent or assigned member
3. Update task status
4. If status = "Completed":
   - Record in task_history
   - Calculate points_reward
   - Add points to member's wallet
   - Send notification to parent
5. Return updated task

---

#### 4. **DELETE `/api/tasks/:id`** - Delete Task
**Backend Flow:**
1. Verify JWT (Parent only)
2. Check task exists in family
3. Delete from task collection
4. Delete related history records
5. Return success

---

#### 5. **GET `/api/task-categories`** - Get Task Categories
**Response:**
```json
{
  "categories": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "category_name": "Household Chores",
      "color": "#FF6B6B",
      "icon": "broom"
    },
    {
      "id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "category_name": "School Work",
      "color": "#4ECDC4",
      "icon": "book"
    }
  ]
}
```

---

### Frontend Implementation (`flutter_app/lib/pages/tasks_screen.dart`)

#### Task Display UI
**Features:**
- List of all tasks
- Filter by status (Pending, In Progress, Completed)
- Search by task name
- Sort by due date
- Show point rewards

**Key Functions:**
- `_fetchTasks()` - Load tasks from backend
- `_markTaskComplete()` - Mark task as completed
- `_updateTaskStatus()` - Change task status
- `_showTaskDetails()` - Display full task info

---

### Gamification Flow

**When Task is Marked Complete:**
```
1. Child clicks "Complete" on task
2. Optional: Upload proof image
3. Send to backend
4. Backend adds points to Point Wallet
5. Record in task_history
6. Parent receives notification
7. Parent can approve/reject
8. If approved: Points confirmed
9. Show celebration animation
10. Update point count on screen
```

---

---

## 4. Points & Rewards System

### Overview
This module manages the points economy where members earn points from task completion and redeem them for rewards.

### Key Features
- Point wallet for each member
- Point history tracking
- Wishlist management
- Redeem rewards for points
- Transaction history
- Point transfer between members

### Database Models

#### `point_walletModel`
Stores point balance for each member.

**Fields:**
- `member_id` (ObjectId) - Reference to member
- `family_id` (ObjectId) - Family reference
- `current_points` (Number) - Current balance
- `lifetime_points` (Number) - Total earned
- `last_updated` (Date) - Last update timestamp

---

#### `point_historyModel`
Tracks all point transactions.

**Fields:**
- `member_id` (ObjectId) - Member receiving/spending points
- `family_id` (ObjectId) - Family reference
- `transaction_type` (String) - "earned", "redeemed", "transferred"
- `amount` (Number) - Points value
- `reason` (String) - Why points changed (e.g., "Completed: Clean Bedroom")
- `related_task` (ObjectId) - Related task ID (if from task)
- `related_reward` (ObjectId) - Related reward ID (if redeemed)
- `timestamp` (Date) - Transaction date
- `notes` (String) - Additional info

---

#### `wishlistModel`
Stores reward items that members want.

**Fields:**
- `reward_name` (String) - Item name
- `description` (String) - Item details
- `points_required` (Number) - Cost in points
- `member_id` (ObjectId) - Member who wants it
- `family_id` (ObjectId) - Family reference
- `image_url` (String) - Item image
- `category` (ObjectId) - Reward category
- `priority` (String) - "Low", "Medium", "High"
- `dateAdded` (Date) - When added to wishlist
- `status` (String) - "Available", "Pending", "Redeemed"

---

#### `redeemModel`
Records completed reward redemptions.

**Fields:**
- `member_id` (ObjectId) - Who redeemed
- `family_id` (ObjectId) - Family reference
- `reward_id` (ObjectId) - Reward redeemed
- `points_spent` (Number) - Points used
- `redemption_date` (Date) - When redeemed
- `status` (String) - "Pending Approval", "Approved", "Received"
- `notes` (String) - Additional notes

---

### API Endpoints

#### 1. **GET `/api/point-wallet`** - Get Point Wallet
**Purpose:** Display member's current point balance

**Response:**
```json
{
  "wallet": {
    "member_id": "65b6f9d0e2f3c4d5e6f7g8h9",
    "current_points": 250,
    "lifetime_points": 500,
    "last_updated": "2026-04-20T10:30:00Z"
  }
}
```

**Backend Flow:**
1. Verify JWT
2. Get member_id from token
3. Query point_wallet where family_id = current
4. Return current balance and statistics

---

#### 2. **GET `/api/point-history`** - Get Transaction History
**Query Parameters:**
```
GET /api/point-history?limit=20&skip=0&transaction_type=earned
```

**Response:**
```json
{
  "history": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "transaction_type": "earned",
      "amount": 50,
      "reason": "Completed: Clean Bedroom",
      "timestamp": "2026-04-20T10:00:00Z"
    },
    {
      "id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "transaction_type": "redeemed",
      "amount": 100,
      "reason": "Redeemed: Movie Night",
      "timestamp": "2026-04-19T15:30:00Z"
    }
  ]
}
```

---

#### 3. **GET `/api/wishlist`** - Get Wishlist Items
**Response:**
```json
{
  "wishlist": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "reward_name": "Movie Night",
      "description": "Watch movie with family",
      "points_required": 100,
      "image_url": "https://...",
      "priority": "High",
      "status": "Available"
    }
  ]
}
```

**Backend Flow:**
1. Verify JWT
2. Query wishlist for current member
3. Filter by family_id
4. Sort by priority and date added
5. Return items

---

#### 4. **POST `/api/wishlist`** - Add Wishlist Item
**Request Body:**
```json
{
  "reward_name": "Gaming Console",
  "description": "PlayStation 5",
  "points_required": 500,
  "image_url": "https://...",
  "priority": "High"
}
```

**Backend Flow:**
1. Verify JWT
2. Create wishlist document
3. Set member_id and family_id
4. Return created item

---

#### 5. **POST `/api/redeem`** - Redeem Reward
**Request Body:**
```json
{
  "reward_id": "64a5f8c9e1f2b3c4d5e6f7g8"
}
```

**Backend Flow:**
1. Verify JWT
2. Get member's current points
3. Get reward cost
4. If points >= cost:
   - Create redeem record
   - Deduct points from wallet
   - Record transaction in point_history
   - Send notification to parent
   - Return success
5. Else:
   - Return error: "Insufficient points"

---

### Frontend Implementation (`flutter_app/lib/pages/rewards_screen.dart`)

#### Points Display Widget
**Shows:**
- Current point balance (large)
- Lifetime earned points
- Recent transactions (last 5)
- Earning/spending trend chart

**Flow:**
```
1. Load page
2. Fetch current wallet balance
3. Display in large text
4. Fetch transaction history
5. Show in list format
6. Display chart of earned vs redeemed
```

---

#### Wishlist Management UI
**Features:**
- Display all wishlist items
- Show point requirements
- Add new items
- Remove items
- Redeem items
- Show progress bar toward goal

**Redeem Flow:**
```
1. User clicks "Redeem" button on item
2. Confirm redemption dialog
3. If confirmed:
   - Show loading
   - Call /api/redeem endpoint
   - If success:
     - Show celebration animation
     - Update point balance
     - Navigate to "Pending Approval" screen
   - If error:
     - Show error message
```

---

---

## 5. Budget Module

### Overview
The budget module helps families track expenses, manage budgets, plan for future events, and maintain financial records.

### Key Features
- Track daily expenses by category
- Set monthly budget goals
- View spending analytics and charts
- Plan future events with costs
- Emergency fund tracking
- Expense reports

### Database Models

#### `budgetModel`
Main budget configuration.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `monthly_budget` (Number) - Total monthly budget
- `currency` (String) - Currency code (USD, EUR, etc.)
- `fiscal_year_start` (String) - Month when fiscal year starts
- `created_date` (Date) - Budget created date
- `updated_date` (Date) - Last update

---

#### `ExpenseModel`
Individual expense records.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `category` (String) - Expense category (Food, Transport, Utilities, etc.)
- `amount` (Number) - Expense amount
- `description` (String) - Expense details
- `date` (Date) - When expense occurred
- `paid_by` (ObjectId) - Member who paid
- `receipt_url` (String) - Receipt image
- `tags` (Array) - Optional tags for filtering
- `notes` (String) - Additional notes

---

#### `futureEventModel`
Planned expenses for upcoming events.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `event_name` (String) - Event title
- `estimated_cost` (Number) - Planned cost
- `actual_cost` (Number) - Actual cost (after event)
- `event_date` (Date) - When event occurs
- `category` (String) - Type of event
- `description` (String) - Event details
- `status` (String) - "Planning", "In Progress", "Completed"
- `assigned_to` (ObjectId) - Assigned planner
- `emergency_fund` (Boolean) - Is this for emergency fund?

---

### API Endpoints

#### 1. **POST `/api/budget/expense`** - Add Expense
**Request Body:**
```json
{
  "category": "Groceries",
  "amount": 75.50,
  "description": "Weekly grocery shopping",
  "date": "2026-04-20",
  "paid_by": "65b6f9d0e2f3c4d5e6f7g8h9",
  "tags": ["food", "weekly"]
}
```

**Backend Flow:**
1. Verify JWT (Parent only)
2. Validate category
3. Create Expense document
4. Update budget summary
5. Check if over budget (alert if yes)
6. Return created expense

---

#### 2. **GET `/api/budget/expenses`** - Get All Expenses
**Query Parameters:**
```
GET /api/budget/expenses?category=Groceries&start_date=2026-04-01&end_date=2026-04-30
```

**Backend Flow:**
1. Verify JWT
2. Query expenses with filters
3. Get family_id from token
4. Filter by date range
5. Sort by date (newest first)
6. Return list

---

#### 3. **GET `/api/budget/analytics`** - Get Budget Analytics
**Purpose:** Display spending analysis and charts

**Response:**
```json
{
  "analytics": {
    "total_spent": 500.50,
    "total_budget": 1000,
    "percentage_used": 50.05,
    "by_category": {
      "Groceries": 250.50,
      "Transport": 150.00,
      "Entertainment": 100.00
    },
    "monthly_trend": [
      { "month": "March", "spent": 450 },
      { "month": "April", "spent": 500.50 }
    ],
    "alerts": [
      "Over budget for Entertainment (+$20)"
    ]
  }
}
```

**Backend Flow:**
1. Get expenses for current month
2. Sum by category
3. Calculate percentage of budget used
4. Generate trend data
5. Check for over-budget categories
6. Return analytics object

---

#### 4. **GET `/api/budget/future-events`** - Get Planned Events
**Response:**
```json
{
  "events": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "event_name": "Summer Vacation",
      "estimated_cost": 2000,
      "actual_cost": 0,
      "event_date": "2026-06-01",
      "status": "Planning"
    }
  ]
}
```

---

#### 5. **POST `/api/budget/future-events`** - Create Future Event
**Request Body:**
```json
{
  "event_name": "Birthday Party",
  "estimated_cost": 300,
  "event_date": "2026-05-15",
  "category": "Celebration",
  "description": "Birthday party for John"
}
```

**Backend Flow:**
1. Create FutureEvent document
2. Set status to "Planning"
3. Store estimated cost
4. Return created event

---

### Frontend Implementation (`flutter_app/lib/pages/budget/budget_dashboard_screen.dart`)

#### Budget Dashboard
**Displays:**
- Total budget vs spent (progress bar)
- Spending by category (pie chart)
- Recent expenses (list)
- Budget alerts (warnings)
- Quick add expense button

**Flow:**
```
1. Load dashboard
2. Fetch current month's budget
3. Sum all expenses
4. Calculate percentage
5. Display in progress bar
6. Fetch expenses by category
7. Create pie chart
8. Show last 5 expenses
9. Check for over-budget alerts
```

---

#### Budget Analytics Screen
**Shows:**
- Line chart of monthly spending trends
- Bar chart of spending by category
- Detailed statistics
- Export/print report option

---

---

## 6. Inventory & Food Management

### Overview
Manage family inventory, track items, plan meals, suggest recipes, and reduce food waste through leftover management.

### Key Features
- Track household inventory
- Add items with expiry dates
- Organize by categories
- Get low-stock alerts
- Plan meals
- Suggest recipes based on inventory
- Track leftovers and reduce waste

### Database Models

#### `inventoryModel`
Main inventory tracking.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `item_name` (String) - Item name
- `quantity` (Number) - Amount in stock
- `unit` (ObjectId) - Reference to Unit
- `category` (ObjectId) - Item category
- `expiry_date` (Date) - When item expires
- `purchase_date` (Date) - When purchased
- `location` (String) - Where stored
- `notes` (String) - Additional notes

---

#### `groceryListModel`
Shopping lists.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `list_name` (String) - List name
- `items` (Array) - Items to buy
- `date_created` (Date) - Creation date
- `status` (String) - "Active", "Completed"

---

#### `mealModel`
Planned meals.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `meal_name` (String) - Meal title
- `ingredients` (Array) - Required ingredients
- `date_planned` (Date) - When to cook
- `assigned_cook` (ObjectId) - Who's cooking
- `status` (String) - "Planned", "In Progress", "Completed"

---

#### `recipeModel`
Recipe storage.

**Fields:**
- `family_id` (ObjectId) - Family reference
- `recipe_name` (String) - Recipe title
- `ingredients` (Array) - Ingredients needed
- `steps` (Array) - Cooking steps
- `prep_time` (Number) - Minutes to prepare
- `cook_time` (Number) - Minutes to cook
- `servings` (Number) - Number of servings
- `difficulty` (String) - "Easy", "Medium", "Hard"

---

### API Endpoints

#### 1. **POST `/api/inventory`** - Add Item to Inventory
**Request Body:**
```json
{
  "item_name": "Milk",
  "quantity": 2,
  "unit": "Liters",
  "category": "Dairy",
  "expiry_date": "2026-04-30",
  "purchase_date": "2026-04-20"
}
```

---

#### 2. **GET `/api/inventory`** - Get Inventory Items
**Purpose:** Display all items in inventory

**Response:**
```json
{
  "items": [
    {
      "id": "64a5f8c9e1f2b3c4d5e6f7g8",
      "item_name": "Milk",
      "quantity": 2,
      "unit": "Liters",
      "expiry_date": "2026-04-30",
      "status": "OK"
    }
  ]
}
```

---

#### 3. **POST `/api/meals`** - Plan Meal
**Request Body:**
```json
{
  "meal_name": "Spaghetti Carbonara",
  "date_planned": "2026-04-22",
  "assigned_cook": "65b6f9d0e2f3c4d5e6f7g8h9"
}
```

---

#### 4. **GET `/api/meal-suggestions`** - Get Meal Suggestions
**Purpose:** AI-generated suggestions based on inventory

**Response:**
```json
{
  "suggestions": [
    {
      "meal_name": "Vegetable Stir Fry",
      "reason": "Based on items in inventory",
      "required_items": ["Carrots", "Broccoli", "Oil"],
      "missing_items": ["Soy Sauce"]
    }
  ]
}
```

---

---

## 7. Location & Map Features

### Overview
Track family member locations for safety, show family on map, and manage location sharing preferences.

### Key Features
- Real-time location tracking
- Family map view
- Location history
- Geofence alerts
- Location sharing preferences
- Emergency contact locations

### Database Models

#### `locationShareModel`
Location sharing settings.

**Fields:**
- `member_id` (ObjectId) - Member sharing location
- `family_id` (ObjectId) - Family reference
- `is_sharing` (Boolean) - Sharing enabled
- `last_shared` (Date) - Last location update
- `latitude` (Number) - Current latitude
- `longitude` (Number) - Current longitude
- `accuracy` (Number) - Location accuracy (meters)

---

#### `locationHistoryModel`
Historical location records.

**Fields:**
- `member_id` (ObjectId) - Member
- `family_id` (ObjectId) - Family reference
- `latitude` (Number)
- `longitude` (Number)
- `timestamp` (Date) - When recorded
- `location_name` (String) - Human-readable location
- `accuracy` (Number)

---

### API Endpoints

#### 1. **POST `/api/location/share`** - Update Location
**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 15
}
```

---

#### 2. **GET `/api/location/family-map`** - Get Family on Map
**Response:**
```json
{
  "members": [
    {
      "member_id": "65b6f9d0e2f3c4d5e6f7g8h9",
      "name": "John",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "last_updated": "2026-04-20T10:00:00Z"
    }
  ]
}
```

---

---

## 8. Settings & Profile Management

### Overview
Manage user profiles, preferences, language settings, notifications, and account settings.

### Key Features
- Profile switching (multi-profile)
- Language selection (English/Arabic)
- Dark mode
- Notification preferences
- Account settings
- Logout options

### Profile Switching System

**Saved Profiles Structure:**
```json
{
  "profiles": [
    {
      "profileKey": "profile_001",
      "email": "family@example.com",
      "familyId": "64a5f8c9e1f2b3c4d5e6f7g8",
      "username": "parent_user",
      "familyTitle": "Smith Family",
      "mail": "parent@example.com",
      "token": "jwt_token_here"
    }
  ],
  "activeProfileKey": "profile_001"
}
```

**Switch Profile Flow:**
```
1. User clicks profile icon
2. Show list of saved profiles
3. Click different profile
4. Load selected profile token from storage
5. Clear current user data
6. Set new user data
7. Refresh all app data for new user
8. Update UI to show new user
```

---

### Language Support

**Supported Languages:**
- English (en)
- Arabic (ar)

**Implementation:**
- Stored in SharedPreferences as "app_locale"
- Read on app startup
- Controls text direction (LTR/RTL)
- Updates MaterialApp locale
- Triggers UI rebuild

**Language Toggle:**
Located in top-right of auth cards and in settings page

**Flow:**
```
1. User clicks EN/AR toggle
2. Call LocaleService.setLocale(Locale('ar'))
3. Save to SharedPreferences
4. Notify ValueListenable
5. MaterialApp rebuilds with new locale
6. All text switches to Arabic
7. UI direction changes to RTL
```

---

### Settings Screen Features

**Available Settings:**
1. **Language** - Select English or Arabic
2. **Notifications** - Enable/disable notifications
3. **Dark Mode** - Toggle dark theme
4. **Account Settings** - Change password, email
5. **Manage Accounts** - Add/remove/reorder saved profiles
6. **Logout Current** - Logout only this profile
7. **Logout All** - Logout from all devices

---

---

## 🔄 Complete App Flow

### New User Journey
```
1. User opens app
2. AuthBootstrapScreen checks for active session
3. If no session → Navigate to LoginPage
4. User enters email
5. Fetch families for email
6. User selects family
7. User enters password
8. Backend verifies credentials
9. JWT token returned
10. Check if first login
11. If first login → Show password setup
12. User sets new password
13. Navigate to HomePage
14. Load all family data
15. Display dashboard
```

---

### Returning User Journey
```
1. User opens app
2. AuthBootstrapScreen checks for active session
3. If session exists → Load profile from storage
4. Switch to saved profile
5. Load all user data
6. Navigate directly to HomePage
7. Show dashboard
```

---

### Task Completion Flow
```
1. Parent creates task
2. Task appears in child's tasks list
3. Child opens task details
4. Click "Complete Task"
5. Optional: Upload proof image
6. Submit completion
7. Backend records task completion
8. Calculate points reward
9. Add points to wallet
10. Record in point_history
11. Notification sent to parent
12. Parent reviews completion
13. Parent approves
14. Child receives points
15. Task moved to "Completed" status
```

---

### Reward Redemption Flow
```
1. Child views wishlist
2. Clicks on desired reward
3. System checks current points
4. If enough points → Allow redemption
5. Show confirmation dialog
6. Child confirms
7. Send to backend
8. Backend deducts points
9. Create redeem record
10. Send notification to parent
11. Parent receives approval request
12. Parent approves
13. Reward status changes to "Approved"
14. Child notified
15. Parent arranges delivery/reward
16. Reward status changed to "Received"
```

---

### Budget Tracking Flow
```
1. Parent adds expense
2. Enter category, amount, date
3. Submit to backend
4. Backend records expense
5. Budget percentage updated
6. Check if over budget
7. If over → Show warning
8. Display in expense list
9. Update analytics
10. Create pie chart
11. Show spending by category
12. Export report option available
```

---

## 📊 Data Dependencies & Relationships

**User → Tasks:**
- Child receives assigned tasks
- Parent creates and assigns tasks

**User → Points:**
- Each member has point wallet
- Points earned from task completion
- Points spent on rewards

**Task → Points:**
- Task completion triggers point award
- Points tied to task reward value

**Member → Budget:**
- Can record who paid for expense
- Can assign cooking duties

**Inventory → Meals:**
- Meal suggestions based on inventory
- Recipe ingredients matched to inventory

**Location → Map:**
- Member location displayed on family map
- Location history tracked

---

---

## 🔒 Security Features

### Data Validation
- Input validation on all endpoints
- Sanitize strings to prevent injection
- Validate data types

### Authorization
- JWT token verification on protected routes
- Role-based access control (Parent vs Child)
- Family scoping on all queries

### Data Privacy
- All data scoped by family_id
- Members can only see own data
- Parents can see all family member data

### Password Security
- BCrypt hashing with 10 salt rounds
- Passwords never logged
- Timing-safe comparison

---

---

**End of Documentation**
