import { render, screen, fireEvent } from '@testing-library/react'
import { GroupList } from '../GroupList'
import { storage } from '../../../lib/storage'
import { Group } from '@/types'

interface LinkProps {
  href: string
  [key: string]: string | number | boolean | undefined // Allow additional props like `aria-label`
}

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    getGroups: jest.fn(),
    getUsers: jest.fn(),
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockedLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    props: LinkProps
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockedLink.displayName = 'Link'
  return MockedLink
})

describe('GroupList', () => {
  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Vacation Group',
      members: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ],
      expenses: [],
    },
    {
      id: '2',
      name: 'Dinner Club',
      members: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '3', name: 'Bob', email: 'bob@example.com' },
        { id: '3', name: 'Isaac', email: 'isaac@example.com' },
      ],
      expenses: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no groups exist', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue([])

    render(<GroupList />)

    expect(screen.getByText('Groups')).toBeInTheDocument()
    expect(screen.getByText(/no groups created yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add group/i })
    ).toBeInTheDocument()
  })

  it('renders group list correctly', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    render(<GroupList />)

    // Check header and add button
    expect(screen.getByText('Groups')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add group/i })
    ).toBeInTheDocument()

    // Check if groups are displayed
    mockGroups.forEach((group) => {
      expect(screen.getByText(group.name)).toBeInTheDocument()
      expect(
        screen.getByText(`${group.members.length} members`)
      ).toBeInTheDocument()

      // Check for action buttons
      const groupCard = screen.getByText(group.name).closest('.border')
      expect(groupCard).toContainElement(
        screen.getAllByRole('button', { name: /view details/i })[
          mockGroups.indexOf(group)
        ]
      )
      expect(groupCard).toContainElement(
        screen.getAllByRole('button', { name: /add expense/i })[
          mockGroups.indexOf(group)
        ]
      )
    })
  })

  it('opens group dialog when add group button is clicked', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue([])
    ;(storage.getUsers as jest.Mock).mockReturnValue([])

    render(<GroupList />)

    const addButton = screen.getByRole('button', { name: /add group/i })
    fireEvent.click(addButton)

    // Check if dialog content is shown
    expect(screen.getByText(/create new group/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
    expect(screen.getByText(/members/i)).toBeInTheDocument()
  })

  it('opens expense dialog when add expense button is clicked', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    render(<GroupList />)

    const addExpenseButtons = screen.getAllByRole('button', {
      name: /add expense/i,
    })
    fireEvent.click(addExpenseButtons[0])

    // Check if expense dialog content is shown
    expect(screen.getByText(/add new expense/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('updates when storage changes', () => {
    // Start with empty list
    ;(storage.getGroups as jest.Mock).mockReturnValue([])

    const { rerender } = render(<GroupList />)
    expect(screen.getByText(/no groups created yet/i)).toBeInTheDocument()

    // Update mock to return groups
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    // Dispatch storage change event
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: 'bill-buddy-groups' },
      })
    )

    // Force a rerender to handle the event
    rerender(<GroupList />)

    // Check if groups are now displayed
    mockGroups.forEach((group) => {
      expect(screen.getByText(group.name)).toBeInTheDocument()
    })
  })

  it('renders view details links correctly', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    render(<GroupList />)

    mockGroups.forEach((group) => {
      const link = screen.getByRole('link', {
        name: `View details for group ${group.name}`,
      })
      expect(link).toHaveAttribute('href', `/groups/${group.id}`)
    })
  })

  it('positions add group button correctly in header', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    render(<GroupList />)

    const header = screen.getByText('Groups').parentElement
    expect(header).toHaveClass('flex', 'justify-between', 'items-center')

    const addButton = screen.getByRole('button', { name: /add group/i })
    expect(header).toContainElement(addButton)
  })

  it('maintains dialog states correctly', () => {
    ;(storage.getGroups as jest.Mock).mockReturnValue(mockGroups)

    render(<GroupList />)

    // Test group dialog
    const addGroupButton = screen.getByRole('button', { name: /add group/i })
    fireEvent.click(addGroupButton)
    expect(screen.getByText(/create new group/i)).toBeInTheDocument()

    let closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(screen.queryByText(/create new group/i)).not.toBeInTheDocument()

    // Test expense dialog
    const addExpenseButton = screen.getAllByRole('button', {
      name: /add expense/i,
    })[0]
    fireEvent.click(addExpenseButton)
    expect(screen.getByText(/add new expense/i)).toBeInTheDocument()

    closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(screen.queryByText(/add new expense/i)).not.toBeInTheDocument()
  })
})
