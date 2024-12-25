import { storage, calculateBalances } from '../storage'
import { Group, User, Expense } from '@/types'

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should handle users storage operations', () => {
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    }

    storage.addUser(user)
    const users = storage.getUsers()

    expect(users).toHaveLength(1)
    expect(users[0]).toEqual(user)
  })

  it('should handle groups storage operations', () => {
    const group: Group = {
      id: '1',
      name: 'Test Group',
      members: [],
      expenses: [],
    }

    storage.addGroup(group)
    const groups = storage.getGroups()

    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual(group)
  })
})

describe('calculateBalances', () => {
  it('should calculate correct balances for equal splits', () => {
    const users: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ]

    const expense: Expense = {
      id: '1',
      groupId: '1',
      description: 'Dinner',
      amount: 100,
      paidBy: '1',
      date: new Date().toISOString(),
      splits: [
        { userId: '1', amount: 50, type: 'equal', value: 0.5 },
        { userId: '2', amount: 50, type: 'equal', value: 0.5 },
      ],
    }

    const group: Group = {
      id: '1',
      name: 'Test Group',
      members: users,
      expenses: [expense],
    }

    const balances = calculateBalances(group)

    // Alice paid 100 but only owes 50, so she should be owed 50
    expect(balances.find((b) => b.userId === '1')?.amount).toBe(50)
    // Bob owes 50
    expect(balances.find((b) => b.userId === '2')?.amount).toBe(-50)
  })
})
