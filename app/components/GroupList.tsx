import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storage, calculateBalances } from '@/lib/storage'
import { Group } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExpenseForm } from './ExpenseForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    // Load initial groups
    setGroups(storage.getGroups())

    // Setup storage event listener to update groups when changed
    const handleStorageChange = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === 'bill-buddy-groups') {
        setGroups(storage.getGroups())
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
  }, [])

  const handleExpenseAdded = () => {
    setGroups(storage.getGroups())
  }

  const renderBalances = (group: Group) => {
    const balances = calculateBalances(group)
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Balances:</h4>
        <div className="space-y-2">
          {balances.map((balance) => {
            const member = group.members.find((m) => m.id === balance.userId)
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
    )
  }

  if (groups.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No groups created yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Groups</h2>
      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-4 border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.members.length} members
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{group.name}</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="expenses" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expenses">Expenses</TabsTrigger>
                      <TabsTrigger value="balances">Balances</TabsTrigger>
                    </TabsList>

                    <TabsContent value="expenses" className="space-y-4">
                      <ExpenseForm
                        group={group}
                        onExpenseAdded={handleExpenseAdded}
                      />

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
                                    group.members.find(
                                      (m) => m.id === expense.paidBy
                                    )?.name
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
                      {renderBalances(group)}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
