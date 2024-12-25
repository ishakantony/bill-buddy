import { render, screen, fireEvent } from '@testing-library/react'
import { UserList } from '../UserList'
import { storage } from '../../../lib/storage'
import { User } from '@/types'

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    getUsers: jest.fn(),
  },
}))

describe('UserList', () => {
  const mockUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no users exist', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue([])

    render(<UserList />)

    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText(/no users added yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add user/i })
    ).toBeInTheDocument()
  })

  it('renders user list correctly', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue(mockUsers)

    render(<UserList />)

    // Check header and add button
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add user/i })
    ).toBeInTheDocument()

    // Check if users are displayed
    mockUsers.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument()
      expect(screen.getByText(user.email)).toBeInTheDocument()
    })
  })

  it('opens user dialog when add user button is clicked', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue([])

    render(<UserList />)

    const addButton = screen.getByRole('button', { name: /add user/i })
    fireEvent.click(addButton)

    // Check if dialog content is shown
    expect(screen.getByText(/add new user/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('updates when storage changes', () => {
    // Start with empty list
    ;(storage.getUsers as jest.Mock).mockReturnValue([])

    const { rerender } = render(<UserList />)
    expect(screen.getByText(/no users added yet/i)).toBeInTheDocument()

    // Update mock to return users
    ;(storage.getUsers as jest.Mock).mockReturnValue(mockUsers)

    // Dispatch storage change event
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: 'bill-buddy-users' },
      })
    )

    // Force a rerender to handle the event
    rerender(<UserList />)

    // Check if users are now displayed
    mockUsers.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument()
      expect(screen.getByText(user.email)).toBeInTheDocument()
    })
  })

  it('maintains dialog state correctly', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue(mockUsers)

    render(<UserList />)

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add user/i })
    fireEvent.click(addButton)
    expect(screen.getByText(/add new user/i)).toBeInTheDocument()

    // Close dialog using close button
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    // Dialog content should not be visible
    expect(screen.queryByText(/add new user/i)).not.toBeInTheDocument()
  })

  it('positions add user button correctly in header', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue(mockUsers)

    render(<UserList />)

    const header = screen.getByText('Users').parentElement
    expect(header).toHaveClass('flex', 'justify-between', 'items-center')

    const addButton = screen.getByRole('button', { name: /add user/i })
    expect(header).toContainElement(addButton)
  })
})
