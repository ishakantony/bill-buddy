import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseForm } from '../ExpenseForm'
import { storage } from '../../../lib/storage'
import { Group } from '../../../types'

// Mock the storage module
jest.mock('../../../lib/storage', () => ({
  storage: {
    addExpenseToGroup: jest.fn(),
  },
}))

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => mockUUID,
})

describe('ExpenseForm', () => {
  const mockGroup: Group = {
    id: '1',
    name: 'Test Group',
    members: [
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
      { id: '3', name: 'Bob', email: 'bob@example.com' },
    ],
    expenses: [],
  }

  const mockOnExpenseAdded = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByText(/paid by/i)).toBeInTheDocument()
    expect(screen.getByText(/split type/i)).toBeInTheDocument()
    expect(screen.getByText(/split between/i)).toBeInTheDocument()
    mockGroup.members.forEach((member) => {
      expect(
        screen.getByLabelText(new RegExp(`${member.name}`, 'i'))
      ).toBeInTheDocument()
    })
  })

  it('handles equal split submission correctly', () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '90' },
    })

    // Select who paid
    const paidByButton = screen.getByRole('combobox', {
      name: 'Select who paid',
    })
    fireEvent.click(paidByButton)
    const johnOption = screen.getByRole('option', { name: 'John' })
    fireEvent.click(johnOption)

    // Select members to split between
    const memberCheckboxes = mockGroup.members.map((member) =>
      screen.getByRole('checkbox', { name: new RegExp(member.name, 'i') })
    )
    memberCheckboxes.forEach((checkbox) => {
      fireEvent.click(checkbox)
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    // Check if storage.addExpenseToGroup was called with correct data
    expect(storage.addExpenseToGroup).toHaveBeenCalledWith(
      mockGroup.id,
      expect.objectContaining({
        description: 'Dinner',
        amount: 90,
        paidBy: '1',
        splits: [
          { userId: '1', amount: 30, type: 'equal', value: 1 / 3 },
          { userId: '2', amount: 30, type: 'equal', value: 1 / 3 },
          { userId: '3', amount: 30, type: 'equal', value: 1 / 3 },
        ],
      })
    )

    expect(mockOnExpenseAdded).toHaveBeenCalled()
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('handles custom split submission correctly', async () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill basic info
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' },
    })
    // Select who paid
    const paidByButton = screen.getByRole('combobox', {
      name: 'Select who paid',
    })
    fireEvent.click(paidByButton)
    const johnOption = screen.getByRole('option', { name: 'John' })
    fireEvent.click(johnOption)

    // Change to custom split
    const splitTypeButton = screen.getByRole('combobox', {
      name: 'Split Type',
    })
    fireEvent.click(splitTypeButton)
    const customOption = screen.getByRole('option', { name: 'Custom Amounts' })
    fireEvent.click(customOption)

    // Select members and set custom amounts
    const members = mockGroup.members
    members.forEach((member) => {
      const checkbox = screen.getByRole('checkbox', {
        name: new RegExp(member.name, 'i'),
      })
      fireEvent.click(checkbox)
    })

    // Set custom amounts that sum to total
    const customAmounts = [50, 30, 20]
    members.forEach((member, index) => {
      const amountInput = screen.getByRole('spinbutton', {
        name: new RegExp(`Amount for ${member.name}`, 'i'),
      })
      fireEvent.change(amountInput, { target: { value: customAmounts[index] } })
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(storage.addExpenseToGroup).toHaveBeenCalledWith(
      mockGroup.id,
      expect.objectContaining({
        description: 'Dinner',
        amount: 100,
        paidBy: '1',
        splits: [
          { userId: '1', amount: 50, type: 'custom', value: 50 },
          { userId: '2', amount: 30, type: 'custom', value: 30 },
          { userId: '3', amount: 20, type: 'custom', value: 20 },
        ],
      })
    )
  })

  it('handles percentage split submission correctly', () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill basic info
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' },
    })
    // Select who paid
    const paidByButton = screen.getByRole('combobox', {
      name: 'Select who paid',
    })
    fireEvent.click(paidByButton)
    const johnOption = screen.getByRole('option', { name: 'John' })
    fireEvent.click(johnOption)

    // Change to percentage split
    const splitTypeButton = screen.getByRole('combobox', {
      name: 'Split Type',
    })
    fireEvent.click(splitTypeButton)
    const percentageOption = screen.getByRole('option', {
      name: 'Percentage Split',
    })
    fireEvent.click(percentageOption)

    // Select members and set percentages
    const members = mockGroup.members
    members.forEach((member) => {
      const checkbox = screen.getByRole('checkbox', {
        name: new RegExp(member.name, 'i'),
      })
      fireEvent.click(checkbox)
    })

    // Set percentages that sum to 100%
    const percentages = [50, 30, 20]
    members.forEach((member, index) => {
      const percentageInput = screen.getByRole('spinbutton', {
        name: new RegExp(`Percentage for ${member.name}`, 'i'),
      })
      fireEvent.change(percentageInput, {
        target: { value: percentages[index] },
      })
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(storage.addExpenseToGroup).toHaveBeenCalledWith(
      mockGroup.id,
      expect.objectContaining({
        description: 'Dinner',
        amount: 100,
        paidBy: '1',
        splits: [
          { userId: '1', amount: 50, type: 'percentage', value: 50 },
          { userId: '2', amount: 30, type: 'percentage', value: 30 },
          { userId: '3', amount: 20, type: 'percentage', value: 20 },
        ],
      })
    )
  })

  it('validates custom amounts sum up to total', () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill basic info with total of 100
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' },
    })
    // Select who paid
    const paidByButton = screen.getByRole('combobox', {
      name: 'Select who paid',
    })
    fireEvent.click(paidByButton)
    const johnOption = screen.getByRole('option', { name: 'John' })
    fireEvent.click(johnOption)

    // Change to custom split
    const splitTypeButton = screen.getByRole('combobox', {
      name: 'Split Type',
    })
    fireEvent.click(splitTypeButton)
    const customOption = screen.getByRole('option', { name: 'Custom Amounts' })
    fireEvent.click(customOption)

    // Select members and set invalid custom amounts (sum to 90 instead of 100)
    const members = mockGroup.members
    members.forEach((member) => {
      const checkbox = screen.getByRole('checkbox', {
        name: new RegExp(member.name, 'i'),
      })
      fireEvent.click(checkbox)
    })

    const customAmounts = [40, 30, 20] // Sums to 90
    members.forEach((member, index) => {
      const amountInput = screen.getByRole('spinbutton', {
        name: new RegExp(`Amount for ${member.name}`, 'i'),
      })
      fireEvent.change(amountInput, { target: { value: customAmounts[index] } })
    })

    // Try to submit the form
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    // Check error message is shown
    expect(
      screen.getByText(/must sum up to the total expense amount/i)
    ).toBeInTheDocument()
    expect(storage.addExpenseToGroup).not.toHaveBeenCalled()
  })

  it('validates percentages sum up to 100', () => {
    render(
      <ExpenseForm
        group={mockGroup}
        onExpenseAdded={mockOnExpenseAdded}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill basic info
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' },
    })
    // Select who paid
    const paidByButton = screen.getByRole('combobox', {
      name: 'Select who paid',
    })
    fireEvent.click(paidByButton)
    const johnOption = screen.getByRole('option', { name: 'John' })
    fireEvent.click(johnOption)

    // Change to percentage split
    const splitTypeButton = screen.getByRole('combobox', {
      name: 'Split Type',
    })
    fireEvent.click(splitTypeButton)
    const percentageOption = screen.getByRole('option', {
      name: 'Percentage Split',
    })
    fireEvent.click(percentageOption)

    // Select members and set invalid percentages (sum to 90% instead of 100%)
    const members = mockGroup.members
    members.forEach((member) => {
      const checkbox = screen.getByRole('checkbox', {
        name: new RegExp(member.name, 'i'),
      })
      fireEvent.click(checkbox)
    })

    const percentages = [40, 30, 20] // Sums to 90%
    members.forEach((member, index) => {
      const percentageInput = screen.getByRole('spinbutton', {
        name: new RegExp(`Percentage for ${member.name}`, 'i'),
      })
      fireEvent.change(percentageInput, {
        target: { value: percentages[index] },
      })
    })

    // Try to submit the form
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    // Check error message is shown
    expect(
      screen.getByText(/percentages must sum up to 100%/i)
    ).toBeInTheDocument()
    expect(storage.addExpenseToGroup).not.toHaveBeenCalled()
  })
})
