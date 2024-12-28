'use client'

import { storage, calculateBalances } from '@/lib/storage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExpenseForm } from './expense-form'
import { Group } from '@/types'
import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function GroupDetails({ groupId }: { groupId: string }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Load initial group
    const initialGroup = storage.getGroup(groupId)
    if (!initialGroup) {
      notFound()
    }
    setGroup(initialGroup)

    // Setup storage event listener to update group when changed
    const handleStorageChange = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === 'bill-buddy-groups') {
        const updatedGroup = storage.getGroup(groupId)
        if (updatedGroup) {
          setGroup(updatedGroup)
        }
      }
    }

    window.addEventListener(
      'localStorageChange',
      handleStorageChange as EventListener
    )
    return () =>
      window.removeEventListener(
        'localStorageChange',
        handleStorageChange as EventListener
      )
  }, [groupId])

  if (!group) {
    return null // Initial loading state
  }

  const handleExpenseAdded = () => {
    const updatedGroup = storage.getGroup(groupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
    }
  }

  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/groups')}
            aria-label="Back to group list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Expense</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-new-expense-dialog-description">
              <DialogHeader>
                <DialogTitle id="add-new-expense-dialog-description">
                  Add New Expense
                </DialogTitle>
              </DialogHeader>
              <ExpenseForm
                group={group}
                onExpenseAdded={handleExpenseAdded}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <div data-testid="balances">
            <h4 className="font-medium mb-2">Balances</h4>
            <div className="space-y-2">
              {calculateBalances(group).map((balance) => {
                const member = group.members.find(
                  (m) => m.id === balance.userId
                )
                if (!member) return null
                return (
                  <div
                    key={balance.userId}
                    className="flex justify-between text-sm"
                  >
                    <span>{member.name}</span>
                    <span
                      className={
                        balance.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {balance.amount >= 0 ? 'Gets back' : 'Owes'} $
                      {Math.abs(balance.amount).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div data-testid="expenses">
            <h4 className="font-medium mb-2">Expenses</h4>
            {group.expenses.length === 0 ? (
              <p className="text-center text-gray-500">No expenses added yet</p>
            ) : (
              <div className="space-y-2">
                {group.expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="p-3"
                    data-testid={expense.id}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{expense.description}</span>
                      <span>${expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Paid by:{' '}
                      {group.members.find((m) => m.id === expense.paidBy)?.name}
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Split:</div>
                      {expense.splits.map((split) => {
                        const member = group.members.find(
                          (m) => m.id === split.userId
                        )
                        return (
                          <div
                            key={split.userId}
                            className="flex justify-between"
                            data-testid={`split-${split.userId}`}
                          >
                            <span>{member?.name}</span>
                            <span>
                              ${split.amount.toFixed(2)}
                              {split.type === 'percentage' &&
                                ` (${split.value}%)`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
