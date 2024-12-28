import { render, screen, fireEvent } from '@testing-library/react'
import { UserForm } from '../user-form'
import { storage } from '../../../lib/storage'

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    addUser: jest.fn(),
    getUsers: jest.fn(),
  },
}))

// Mock Math.random and Date.now for consistent ID generation in tests
const mockRandom = jest
  .spyOn(Math, 'random')
  .mockImplementation(() => 0.123456789)
const mockDate = jest.spyOn(Date, 'now').mockImplementation(() => 1234567890)

describe('UserForm', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Restore original implementations
    mockRandom.mockRestore()
    mockDate.mockRestore()
  })

  it('renders form fields correctly', () => {
    render(<UserForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add user/i })
    ).toBeInTheDocument()
  })

  it('handles form submission correctly', () => {
    render(<UserForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /add user/i })

    // Fill in the form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Check if storage.addUser was called with correct data
    expect(storage.addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
      })
    )

    // Check if form was reset
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('does not submit if fields are empty', () => {
    render(<UserForm />)

    const submitButton = screen.getByRole('button', { name: /add user/i })

    // Try to submit empty form
    fireEvent.click(submitButton)

    // Check if storage.addUser was not called
    expect(storage.addUser).not.toHaveBeenCalled()
  })
})
