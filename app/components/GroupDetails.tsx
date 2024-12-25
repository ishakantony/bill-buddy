'use client'

import { storage, calculateBalances } from '@/lib/storage'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from '@/app/components/ExpenseForm'
import { Group } from '@/types'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'

export function GroupDetails({ groupId }: { groupId: string }) {
  const [group, setGroup] = useState<Group | null>(null)

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

  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">{group.name}</h1>

        <Tabs defaultValue="expenses" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <ExpenseForm group={group} onExpenseAdded={handleExpenseAdded} />

            {group.expenses.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Expenses:</h4>
                <div className="space-y-2">
                  {group.expenses.map((expense) => (
                    <Card key={expense.id} className="p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {expense.description}
                        </span>
                        <span>${expense.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid by:{' '}
                        {
                          group.members.find((m) => m.id === expense.paidBy)
                            ?.name
                        }
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances">
            <div className="mt-4">
              <h4 className="font-medium mb-2">Balances:</h4>
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
                          balance.amount >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
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
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
