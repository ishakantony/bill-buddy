import { User, Group, Expense } from '@/types'

const STORAGE_KEYS = {
  USERS: 'bill-buddy-users',
  GROUPS: 'bill-buddy-groups',
} as const

export const storage = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return []
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  },

  setUsers: (users: User[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  getGroups: (): Group[] => {
    if (typeof window === 'undefined') return []
    const groups = localStorage.getItem(STORAGE_KEYS.GROUPS)
    return groups ? JSON.parse(groups) : []
  },

  setGroups: (groups: Group[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups))
  },

  addUser: (user: User) => {
    const users = storage.getUsers()
    users.push(user)
    storage.setUsers(users)
  },

  addGroup: (group: Group) => {
    const groups = storage.getGroups()
    groups.push(group)
    storage.setGroups(groups)
  },

  updateGroup: (updatedGroup: Group) => {
    const groups = storage.getGroups()
    const index = groups.findIndex((g) => g.id === updatedGroup.id)
    if (index !== -1) {
      groups[index] = updatedGroup
      storage.setGroups(groups)
    }
  },

  addExpenseToGroup: (groupId: string, expense: Expense) => {
    const groups = storage.getGroups()
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      group.expenses.push(expense)
      storage.setGroups(groups)
    }
  },
}

export const calculateBalances = (group: Group) => {
  const balances = new Map<string, number>()

  // Initialize balances for all members
  group.members.forEach((member) => {
    balances.set(member.id, 0)
  })

  // Calculate balances for each expense
  group.expenses.forEach((expense) => {
    // Add the full amount to the payer's balance
    const currentPayerBalance = balances.get(expense.paidBy) || 0
    balances.set(expense.paidBy, currentPayerBalance + expense.amount)

    // Subtract each person's share from their balance
    expense.splits.forEach((split) => {
      const currentBalance = balances.get(split.userId) || 0
      balances.set(split.userId, currentBalance - split.amount)
    })
  })

  return Array.from(balances.entries()).map(([userId, amount]) => ({
    userId,
    amount,
  }))
}
