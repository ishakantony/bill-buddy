import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { storage } from '@/lib/storage'
import { Group, Expense, Split } from '@/types'

interface ExpenseFormProps {
  group: Group
  onExpenseAdded: () => void
}

export function ExpenseForm({ group, onExpenseAdded }: ExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>(
    'equal'
  )
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [percentages, setPercentages] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || !paidBy || selectedMembers.length === 0)
      return

    const totalAmount = parseFloat(amount)
    if (isNaN(totalAmount)) return

    let splits: Split[] = []

    switch (splitType) {
      case 'equal': {
        const splitAmount = totalAmount / selectedMembers.length
        splits = selectedMembers.map((memberId) => ({
          userId: memberId,
          amount: splitAmount,
          type: 'equal' as const,
          value: 1 / selectedMembers.length,
        }))
        break
      }
      case 'custom': {
        const customSplits = selectedMembers.map((memberId) => ({
          userId: memberId,
          amount: parseFloat(customAmounts[memberId] || '0'),
          type: 'custom' as const,
          value: parseFloat(customAmounts[memberId] || '0'),
        }))

        // Validate custom amounts sum up to total
        const customTotal = customSplits.reduce(
          (sum, split) => sum + split.amount,
          0
        )
        if (Math.abs(customTotal - totalAmount) > 0.01) {
          alert('Custom amounts must sum up to the total expense amount')
          return
        }

        splits = customSplits
        break
      }
      case 'percentage': {
        const percentageSplits = selectedMembers.map((memberId) => {
          const percentage = parseFloat(percentages[memberId] || '0')
          return {
            userId: memberId,
            amount: (totalAmount * percentage) / 100,
            type: 'percentage' as const,
            value: percentage,
          }
        })

        // Validate percentages sum up to 100
        const totalPercentage = percentageSplits.reduce(
          (sum, split) => sum + split.value,
          0
        )
        if (Math.abs(totalPercentage - 100) > 0.01) {
          alert('Percentages must sum up to 100%')
          return
        }

        splits = percentageSplits
        break
      }
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      groupId: group.id,
      description,
      amount: totalAmount,
      paidBy,
      date: new Date().toISOString(),
      splits,
    }

    storage.addExpenseToGroup(group.id, newExpense)
    onExpenseAdded()

    // Reset form
    setDescription('')
    setAmount('')
    setPaidBy('')
    setSplitType('equal')
    setSelectedMembers([])
    setCustomAmounts({})
    setPercentages({})
  }

  const handleMemberSelect = (userId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      }
      return [...prev, userId]
    })
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={paidBy} onValueChange={setPaidBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select who paid" />
            </SelectTrigger>
            <SelectContent>
              {group.members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Split Type</Label>
          <Select
            value={splitType}
            onValueChange={(value: 'equal' | 'custom' | 'percentage') =>
              setSplitType(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">Equal Split</SelectItem>
              <SelectItem value="custom">Custom Amounts</SelectItem>
              <SelectItem value="percentage">Percentage Split</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Split Between</Label>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`member-${member.id}`}
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleMemberSelect(member.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`member-${member.id}`} className="text-sm">
                  {member.name}
                </label>

                {splitType === 'custom' &&
                  selectedMembers.includes(member.id) && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customAmounts[member.id] || ''}
                      onChange={(e) =>
                        setCustomAmounts((prev) => ({
                          ...prev,
                          [member.id]: e.target.value,
                        }))
                      }
                      placeholder="Amount"
                      className="w-24 ml-2"
                    />
                  )}

                {splitType === 'percentage' &&
                  selectedMembers.includes(member.id) && (
                    <div className="flex items-center">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={percentages[member.id] || ''}
                        onChange={(e) =>
                          setPercentages((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                        placeholder="Percentage"
                        className="w-24 ml-2"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            !description || !amount || !paidBy || selectedMembers.length === 0
          }
        >
          Add Expense
        </Button>
      </form>
    </Card>
  )
}
