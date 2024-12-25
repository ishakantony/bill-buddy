# 💰 Bill Buddy

A modern expense sharing application built with Next.js, TailwindCSS, and shadcn-ui.

## ✨ Features

### 👥 User Management
- ✅ Create new users with name and email
- ✅ View all registered users
- ✅ Persistent user data using local storage

### 👥 Group Management
- ✅ Create groups with multiple users
- ✅ Add users to existing groups
- ✅ View group details and members
- ✅ Manage group expenses

### 💸 Expense Management
- ✅ Add expenses to groups
- ✅ Single payer support for each expense
- ✅ Flexible member selection for expense sharing
- ✅ Three split types:
  - 🔄 Equal split amongst selected users
  - 💱 Custom amount split
  - 📊 Percentage-based split

### 💵 Balance & Settlement
- ✅ Real-time balance calculation
- ✅ View who owes and who gets back money
- ✅ Detailed expense history
- ✅ Per-group balance tracking

### 🔍 Validation & Error Handling
- ✅ Input validation for all forms
- ✅ Amount validation for custom splits
- ✅ Percentage validation (must sum to 100%)
- ✅ Minimum 2 users requirement for groups

## 🛠️ Technical Stack

- ⚡ **Next.js** - React framework
- 🎨 **TailwindCSS** - Styling
- 🧩 **shadcn-ui** - UI components
- 💾 **Local Storage** - Data persistence
- 🧪 **Jest & React Testing Library** - Unit testing

## 🚀 Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

```bash
pnpm test
```

## 💡 Usage Tips

1. Start by creating at least two users
2. Create a group and add users to it
3. Add expenses to the group:
   - Select who paid
   - Choose split type (equal, custom, or percentage)
   - Select members involved in the expense
4. View balances to see who owes whom
