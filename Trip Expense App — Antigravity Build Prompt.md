Build a production-quality, modern mobile-first web application called **TripSplit** for managing shared expenses during group trips.

### 1. PRODUCT GOAL

TripSplit allows a group of people to create a trip, join the trip using an invite link/code, individually log in, add expenses, see who paid for what, automatically calculate balances, and settle all expenses fairly.

The initial use case is a group of 6 friends travelling together, but the architecture must support any number of members.

The application should feel like a polished modern startup product—not a basic CRUD application.

Prioritize:
- Excellent UI/UX
- Smooth animations
- Fast interactions
- Clear financial information
- Mobile-first design
- Real-time/shared data
- Simple navigation
- Beautiful empty states
- Excellent loading states
- Proper error handling

---

# 2. DESIGN DIRECTION

Create a premium travel + fintech visual style.

The UI should feel inspired by modern apps such as:
- Splitwise
- Revolut
- Airbnb
- Linear
- modern travel apps

Do NOT copy their UI directly.

Use:
- Large rounded cards
- Clean typography
- Generous spacing
- Soft shadows
- Subtle gradients
- Glass/blur effects only where appropriate
- Minimal borders
- Clear visual hierarchy
- Large readable amounts
- Beautiful icons
- Bottom navigation on mobile
- Sidebar/navigation on desktop

The interface must NOT look like an admin dashboard or spreadsheet.

Use a consistent design system for:
- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Buttons
- Cards
- Form controls
- Modals
- Toast notifications

---

# 3. ANIMATIONS

Animations are extremely important.

Make the application feel smooth and premium.

Use subtle animations for:

Page transitions:
- Fade + slight slide
- Around 200–350ms

Cards:
- Fade/slide in when loaded
- Slight hover elevation on desktop

Buttons:
- Small scale-down effect on click
- Smooth hover transition

Expense creation:
- Opening modal should animate
- Form fields should appear smoothly
- Successful expense creation should show a satisfying confirmation animation

Dashboard:
- Numbers should animate/count up when loaded
- Balance cards should smoothly appear
- Charts should animate when entering the screen

Expense list:
- Newly added expense should animate into the list
- Deleted expense should smoothly collapse/fade out

Navigation:
- Smooth active-tab transition
- Mobile bottom navigation should feel responsive

Use animations carefully.
Avoid excessive bouncing or distracting effects.

Respect `prefers-reduced-motion`.

---

# 4. AUTHENTICATION

Create individual accounts for every trip member.

Authentication should support:

- Sign up
- Login
- Logout
- Forgot password
- User profile
- Profile name
- Profile avatar

Each user must have their own account.

A user can belong to multiple trips.

Never store passwords directly in the database.

Use the authentication mechanism supported by the selected backend.

---

# 5. TRIP CREATION

After login, show the user's trips.

Dashboard:

"Your Trips"

Each trip card should show:

- Trip name
- Destination
- Trip dates
- Number of members
- Total expenses
- Current user balance

Example:

Trip to Goa
Goa, India
12–16 November
6 members
₹42,850 total

Button:

"+ Create Trip"

---

# 6. CREATE TRIP

Create Trip screen:

Fields:

Trip name
Destination
Start date
End date
Currency

Default currency:
INR (₹)

Allow other currencies later.

After creating the trip:

- Trip creator becomes admin
- Generate unique trip invite code
- Generate invite link
- Show "Invite Members"

Example:

Trip Code:
GOA6X9

Buttons:

Copy Code
Share Invite Link

---

# 7. JOIN TRIP

Users can join using:

- Invite code
OR
- Invite link

Join screen should display:

Trip name
Destination
Trip dates
Current members

Then:

"Join Trip"

Prevent duplicate membership.

---

# 8. TRIP MEMBERS

Create a Members screen.

Display every member as a beautiful avatar card.

Example:

Dharshan
You

Arun

Karthik

Vijay

Sanjay

Rahul

Each member should show:
- Avatar
- Name
- Total paid
- Current balance

Use clear colors/icons for:
- You are owed money
- You owe money
- Settled

---

# 9. ADD EXPENSE

This is the most important feature.

Create a beautiful "Add Expense" flow.

Fields:

Expense description
Amount
Category
Date
Paid by
Split between

Categories:

🍴 Food
🏨 Hotel
🚕 Transport
🎟️ Tickets
⛽ Fuel
🛍️ Shopping
🍹 Entertainment
📦 Other

Example:

Dinner
₹3,600

Paid by:
Dharshan

Split between:
✓ Dharshan
✓ Arun
✓ Karthik
✓ Vijay
✓ Sanjay
✓ Rahul

Automatically calculate:

₹3,600 ÷ 6 = ₹600 each

Dharshan paid ₹3,600
Dharshan's share = ₹600

Therefore Dharshan is owed ₹3,000.

---

# 10. SPLITTING OPTIONS

Support:

### Equal Split

Divide equally among selected members.

### Custom Amount

Example:

Dharshan ₹800
Arun ₹500
Karthik ₹700
Vijay ₹600
Sanjay ₹500
Rahul ₹500

Total must equal expense amount.

### Percentage Split

Example:

Dharshan 20%
Arun 20%
Karthik 15%
etc.

Validate percentages to equal 100%.

### Exclude Members

Allow certain members to be excluded from an expense.

---

# 11. EXPENSE CALCULATION ENGINE

Create a reliable expense calculation system.

For every expense calculate:

- Total amount
- Paid amount per user
- Share amount per user
- Net balance per user

Formula:

net balance = amount paid - user's share

Positive balance:
The user should receive money.

Negative balance:
The user owes money.

Example:

Dinner = ₹3,600

Dharshan paid ₹3,600.

6 people share equally.

Each person's share = ₹600.

Balances:

Dharshan +₹3,000
Arun -₹600
Karthik -₹600
Vijay -₹600
Sanjay -₹600
Rahul -₹600

---

# 12. SMART SETTLEMENT

Create a "Settle Up" screen.

Show:

"You are owed ₹2,400"

or

"You owe ₹1,200"

Then generate simplified settlement suggestions.

Example:

Arun → Dharshan ₹600
Karthik → Dharshan ₹600
Vijay → Dharshan ₹600
Sanjay → Dharshan ₹600

The algorithm should minimize unnecessary transactions where possible.

Do not simply show every raw expense.

Show the final net settlement between people.

---

# 13. SETTLEMENT TRACKING

Allow users to mark a settlement as paid.

Example:

Arun owes Dharshan ₹600

Button:

"Mark as Paid"

After payment:

✓ Settled

Record:
- payer
- receiver
- amount
- date
- status

Keep settlement history.

---

# 14. MAIN TRIP DASHBOARD

After opening a trip, show a beautiful dashboard.

Top:

Trip name
Destination
Dates

Large card:

Total Trip Expense

₹42,850

Then:

Your Balance

+₹2,450

Below:

You are owed
₹3,200

You owe
₹750

Then:

### Recent Expenses

Dinner
₹3,600
Paid by Dharshan

Hotel
₹12,000
Paid by Arun

Cab
₹850
Paid by Karthik

etc.

Then:

### Who Owes Whom

Arun → Dharshan ₹600
Karthik → Dharshan ₹450

---

# 15. ACTIVITY FEED

Create an activity timeline.

Examples:

Dharshan added Dinner
₹3,600

Arun added Hotel
₹12,000

Karthik settled ₹450 with Dharshan

Vijay joined the trip

Use avatars and timestamps.

Animate new activity items smoothly.

---

# 16. EXPENSE HISTORY

Create a dedicated Expenses screen.

Each expense card should show:

Icon
Description
Amount
Paid by
Date
Your share

Example:

🍴 Dinner
₹3,600

Paid by Dharshan

Your share:
₹600

Clicking opens full expense details.

Allow:
- Edit
- Delete

Only allow appropriate users/admins to modify expenses.

---

# 17. ANALYTICS

Create an Analytics screen.

Show:

Total spending

Spending by category:
Food
Hotel
Transport
Entertainment
Shopping
Other

Spending by person.

Use beautiful animated charts.

Examples:
- Donut chart for categories
- Bar chart for member spending

Charts must be responsive and mobile-friendly.

---

# 18. USER PROFILE

Profile screen:

Avatar
Name
Email

Statistics:

Trips
Total spent
Total settled

Settings:
- Currency
- Notifications
- Theme
- Logout

---

# 19. RESPONSIVE DESIGN

Mobile is the primary platform.

Design specifically for phone screens.

Mobile:

Top header
Content
Floating Add Expense button
Bottom navigation

Bottom navigation:

🏠 Home
💸 Expenses
📊 Analytics
👥 Members
⚙️ More

Desktop:

Sidebar navigation.

Ensure the application works beautifully at:
- 360px
- 390px
- 430px
- tablet
- desktop

---

# 20. DATABASE ARCHITECTURE

Create a proper relational data model.

Tables/entities:

Users
- id
- name
- email
- avatar
- created_at

Trips
- id
- name
- destination
- start_date
- end_date
- currency
- invite_code
- created_by
- created_at

TripMembers
- id
- trip_id
- user_id
- role
- joined_at

Expenses
- id
- trip_id
- description
- amount
- category
- paid_by
- date
- created_by
- created_at
- updated_at

ExpenseSplits
- id
- expense_id
- user_id
- amount
- percentage

Settlements
- id
- trip_id
- payer_id
- receiver_id
- amount
- status
- paid_at
- created_at

Activity
- id
- trip_id
- user_id
- type
- metadata
- created_at

Use proper foreign keys and indexes.

---

# 21. SECURITY

Users must only be able to access trips they belong to.

Implement proper authorization.

A user should NOT be able to:
- View another private trip
- Modify expenses in trips they don't belong to
- Modify another user's profile
- Manipulate balances directly

Balances must always be calculated from expenses and settlements.

Never trust balance values supplied by the client.

Validate all monetary calculations server-side.

Use decimal-safe money calculations.
Do NOT rely on floating-point arithmetic for financial values.

---

# 22. REAL-TIME EXPERIENCE

When one member adds an expense:

Other members currently viewing the trip should see it without manually refreshing.

Example:

Dharshan adds:
Dinner ₹3,600

Other members receive:

"New expense added"

and the expense appears smoothly in their feed.

If the selected backend supports real-time subscriptions, use them.

---

# 23. LOADING STATES

Never show a blank screen.

Create beautiful skeleton loaders for:

Dashboard
Expense list
Members
Analytics

Use smooth shimmer animations.

---

# 24. EMPTY STATES

Create useful empty states.

No trips:

"Your next adventure starts here."

Button:
Create your first trip

No expenses:

"No expenses yet"

"Add your first expense and we'll handle the math."

No settlements:

"Everyone is settled up 🎉"

---

# 25. ERROR HANDLING

Create friendly error messages.

Examples:

Invalid amount:
"Enter a valid amount."

Split mismatch:
"The split doesn't equal ₹3,600."

Network failure:
"Something went wrong. Check your connection and try again."

Unauthorized:
"You don't have permission to perform this action."

Never expose technical errors directly to users.

---

# 26. MICRO INTERACTIONS

Add polished micro-interactions:

- Button press feedback
- Toast notifications
- Copy invite code confirmation
- Swipe-friendly expense cards
- Smooth modal opening
- Confirmation dialogs for delete
- Animated checkmark after settlement
- Animated number counters
- Smooth tab transitions
- Hover states on desktop
- Touch-friendly controls on mobile

---

# 27. DARK MODE

Support light and dark themes.

Dark mode should be designed intentionally, not simply inverted.

Maintain excellent contrast and readability.

Remember user's theme preference.

---

# 28. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- ARIA where needed
- Sufficient color contrast
- Reduced motion support
- Touch targets at least approximately 44px

---

# 29. PERFORMANCE

Optimize for fast loading.

Use:
- Lazy loading where appropriate
- Optimized images
- Efficient database queries
- Pagination for expense history
- Debounced search
- Cached trip data where appropriate

Avoid unnecessary re-renders.

---

# 30. IMPORTANT UX PRINCIPLE

The user should understand their financial position within 3 seconds of opening a trip.

The most important information is:

1. Total trip spending
2. Your balance
3. Who owes you
4. Who you owe
5. Recent expenses
6. Settle Up

Make these visually dominant.

---

# 31. DEMO DATA

During development, create realistic demo data for a 6-person trip.

Trip:

"Goa Trip 2026"

Members:

Dharshan
Arun
Karthik
Vijay
Sanjay
Rahul

Example expenses:

Hotel — ₹12,000
Dinner — ₹3,600
Cab — ₹850
Breakfast — ₹1,200
Beach activities — ₹2,400
Fuel — ₹3,000

Use this data to make the dashboard look realistic during development.

Do not hardcode the demo data into production logic.

---

# 32. FINAL QUALITY BAR

Before considering the app complete:

Test:

- Registration
- Login
- Logout
- Create trip
- Join trip
- Invite members
- Add expense
- Equal split
- Custom split
- Percentage split
- Edit expense
- Delete expense
- Balance calculation
- Settlement calculation
- Mark settlement paid
- Activity feed
- Analytics
- Real-time updates
- Mobile responsiveness
- Dark mode
- Error states
- Empty states
- Loading states
- Authorization/security

Fix all console errors.

Do not leave placeholder buttons.

Every visible button should perform a real action.

Every form should have validation.

---

# 33. DEVELOPMENT APPROACH

Build the application incrementally.

First create:
1. Design system
2. Authentication
3. Trip creation/joining
4. Trip dashboard
5. Expense system
6. Calculation engine
7. Settlement system
8. Analytics
9. Real-time updates
10. Polish and animations

After implementing each major feature, test it before moving to the next.

Prioritize functionality first, then visual polish.

The final result should feel like a real production-ready product that six friends could actually use throughout an entire trip.