import { render, screen, fireEvent, within } from '@testing-library/react'
import { GroupDetails } from '../group-details'
import { storage, calculateBalances } from '../../../lib/storage'
import { Group, User, Expense } from '@/types'
import { notFound } from 'next/navigation'

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    getGroup: jest.fn(),
    getUsers: jest.fn(),
  },
  calculateBalances: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('GroupDetails', () => {
  const mockUsers: User[] = [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' },
  ]

  const mockExpenses: Expense[] = [
    {
      id: '1',
      groupId: 'group1',
      description: 'Dinner',
      amount: 100,
      paidBy: '1',
      date: '2023-01-01T00:00:00.000Z',
      splits: [
        { userId: '1', amount: 50, type: 'equal', value: 0.5 },
        { userId: '2', amount: 50, type: 'equal', value: 0.5 },
      ],
    },
    {
      id: '2',
      groupId: 'group1',
      description: 'Movie',
      amount: 60,
      paidBy: '2',
      date: '2023-01-02T00:00:00.000Z',
      splits: [
        { userId: '1', amount: 30, type: 'equal', value: 0.5 },
        { userId: '2', amount: 30, type: 'equal', value: 0.5 },
      ],
    },
  ]

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    members: mockUsers,
    expenses: mockExpenses,
  }

  const mockBalances = [
    { userId: '1', amount: 20 }, // Paid 100, owes 80
    { userId: '2', amount: -20 }, // Paid 60, owes 80
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(storage.getGroup as jest.Mock).mockReturnValue(mockGroup)
    ;(calculateBalances as jest.Mock).mockReturnValue(mockBalances)
  })

  it('renders group details correctly', () => {
    render(<GroupDetails groupId="group1" />)

    // Check group name is displayed
    expect(screen.getByText('Test Group')).toBeInTheDocument()

    // Check "Add Expense" button exists
    expect(
      screen.getByRole('button', { name: /add expense/i })
    ).toBeInTheDocument()
  })

  it('displays balances correctly', () => {
    render(<GroupDetails groupId="group1" />)

    // Check balances section
    const balancesDiv = screen.getByTestId('balances')

    expect(within(balancesDiv).getByText('Balances')).toBeInTheDocument()
    expect(within(balancesDiv).getByText('John')).toBeInTheDocument()
    expect(
      within(balancesDiv).getByText('Gets back $20.00')
    ).toBeInTheDocument()
    expect(within(balancesDiv).getByText('Jane')).toBeInTheDocument()
    expect(within(balancesDiv).getByText('Owes $20.00')).toBeInTheDocument()
  })

  it('displays expenses correctly', () => {
    render(<GroupDetails groupId="group1" />)

    // Check expenses section
    expect(screen.getByText('Expenses')).toBeInTheDocument()

    // Check first expense
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText(/paid by: john/i)).toBeInTheDocument()

    // Check second expense
    expect(screen.getByText('Movie')).toBeInTheDocument()
    expect(screen.getByText('$60.00')).toBeInTheDocument()
    expect(screen.getByText(/paid by: jane/i)).toBeInTheDocument()
  })

  it('shows expense splits correctly', () => {
    render(<GroupDetails groupId="group1" />)

    const expensesDiv = screen.getByTestId('expenses')

    // Check splits are displayed for expenses
    mockExpenses.forEach((expense) => {
      const expenseDiv = within(expensesDiv).getByTestId(expense.id)

      expense.splits.forEach((split) => {
        const member = mockUsers.find((u) => u.id === split.userId)

        const splitDiv = within(expenseDiv).getByTestId(`split-${split.userId}`)

        expect(within(splitDiv).getByText(member!.name)).toBeInTheDocument()
        expect(
          within(splitDiv).getByText(`$${split.amount.toFixed(2)}`)
        ).toBeInTheDocument()
      })
    })
  })

  it('shows "no expenses" message when there are no expenses', () => {
    const groupWithNoExpenses = { ...mockGroup, expenses: [] }
    ;(storage.getGroup as jest.Mock).mockReturnValue(groupWithNoExpenses)

    render(<GroupDetails groupId="group1" />)

    expect(screen.getByText(/no expenses added yet/i)).toBeInTheDocument()
  })

  it('opens expense dialog when add expense button is clicked', () => {
    render(<GroupDetails groupId="group1" />)

    const addButton = screen.getByRole('button', { name: /add expense/i })
    fireEvent.click(addButton)

    // Check if dialog content is shown
    expect(screen.getByText(/add new expense/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('calls notFound when group does not exist', () => {
    ;(storage.getGroup as jest.Mock).mockReturnValue(null)

    render(<GroupDetails groupId="nonexistent" />)

    expect(notFound).toHaveBeenCalled()
  })

  it('renders back button and navigates to groups page when clicked', () => {
    // Create mock router instance
    const mockPush = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
    })
    
    render(<GroupDetails groupId="group1" />)
    
    const backButton = screen.getByLabelText('Back to group list')
    expect(backButton).toBeInTheDocument()
    
    fireEvent.click(backButton)
    expect(mockPush).toHaveBeenCalledWith('/groups')
  })
})
