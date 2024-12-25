export interface User {
  id: string
  name: string
  email: string
}

export interface Group {
  id: string
  name: string
  members: User[]
  expenses: Expense[]
}

export interface Expense {
  id: string
  groupId: string
  description: string
  amount: number
  paidBy: string // userId
  date: string
  splits: Split[]
}

export interface Split {
  userId: string
  amount: number
  type: 'equal' | 'custom' | 'percentage'
  value: number // For equal this is 1/n, for custom this is the amount, for percentage this is the percentage
}

export interface Balance {
  userId: string
  amount: number // Positive means they are owed money, negative means they owe money
}
