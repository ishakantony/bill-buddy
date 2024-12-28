import { render, screen, fireEvent, act } from '@testing-library/react'
import { GroupForm } from '../group-form'
import { storage } from '../../../lib/storage'

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    addGroup: jest.fn(),
    getUsers: jest.fn(),
  },
}))

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
Object.defineProperty(global.crypto, 'randomUUID', {
  configurable: true,
  value: jest.fn().mockReturnValue(mockUUID),
})

describe('GroupForm', () => {
  const mockUsers = [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' },
    { id: '3', name: 'Bob', email: 'bob@example.com' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(storage.getUsers as jest.Mock).mockReturnValue(mockUsers)
  })

  it('renders form fields correctly', () => {
    render(<GroupForm />)

    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
    expect(screen.getByText(/members/i)).toBeInTheDocument()
    mockUsers.forEach((user) => {
      expect(
        screen.getByLabelText(
          new RegExp(`${user.name} \\(${user.email}\\)`, 'i')
        )
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /create group/i })
    ).toBeInTheDocument()
  })

  it('handles form submission correctly', async () => {
    const onSuccess = jest.fn()
    render(<GroupForm onSuccess={onSuccess} />)

    const nameInput = screen.getByLabelText(/group name/i)
    const memberCheckboxes = mockUsers.slice(0, 2).map((user) =>
      screen.getByRole('checkbox', {
        name: new RegExp(`${user.name}.*${user.email}`, 'i'),
      })
    )
    const submitButton = screen.getByRole('button', { name: /create group/i })

    // Fill in the form
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Group' } })
      memberCheckboxes.forEach((checkbox) => {
        fireEvent.click(checkbox)
      })
    })

    // Submit the form
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Check if storage.addGroup was called with correct data
    expect(storage.addGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockUUID,
        name: 'Test Group',
        members: expect.arrayContaining([
          expect.objectContaining({ id: '1' }),
          expect.objectContaining({ id: '2' }),
        ]),
        expenses: [],
      })
    )

    // Check if onSuccess callback was called
    expect(onSuccess).toHaveBeenCalled()

    // Check if form was reset
    expect(nameInput).toHaveValue('')
    memberCheckboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked()
    })
  })

  it('does not submit if name is empty', async () => {
    render(<GroupForm />)

    const memberCheckboxes = mockUsers.slice(0, 2).map((user) =>
      screen.getByRole('checkbox', {
        name: new RegExp(`${user.name}.*${user.email}`, 'i'),
      })
    )
    const submitButton = screen.getByRole('button', { name: /create group/i })

    // Select members but leave name empty
    await act(async () => {
      memberCheckboxes.forEach((checkbox) => {
        fireEvent.click(checkbox)
      })
    })

    // Try to submit
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Check if storage.addGroup was not called
    expect(storage.addGroup).not.toHaveBeenCalled()
  })

  it('does not submit if less than 2 members selected', async () => {
    render(<GroupForm />)

    const nameInput = screen.getByLabelText(/group name/i)
    const memberCheckbox = screen.getByRole('checkbox', {
      name: new RegExp(`${mockUsers[0].name}.*${mockUsers[0].email}`, 'i'),
    })
    const submitButton = screen.getByRole('button', { name: /create group/i })

    // Fill name and select only one member
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Group' } })
      fireEvent.click(memberCheckbox)
    })

    // Try to submit
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Check if storage.addGroup was not called
    expect(storage.addGroup).not.toHaveBeenCalled()
  })

  it('disables submit button when less than 2 users exist', () => {
    ;(storage.getUsers as jest.Mock).mockReturnValue([mockUsers[0]])
    render(<GroupForm />)

    const submitButton = screen.getByRole('button', { name: /create group/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/add at least 2 users/i)).toBeInTheDocument()
  })
})
