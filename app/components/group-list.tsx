'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storage } from '@/lib/storage'
import { Group } from '@/types'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { GroupForm } from './group-form'
import { ExpenseForm } from './expense-form'

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [open, setOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState<string | null>(
    null
  )

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
    const updatedGroups = storage.getGroups()
    setGroups(updatedGroups)
    setExpenseDialogOpen(null)
  }

  if (groups.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Groups</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <GroupForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-center text-gray-500">No groups created yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Groups</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <GroupForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-4 border">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link
                    href={`/groups/${group.id}`}
                    aria-label={`View details for group ${group.name}`}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Dialog
                    open={expenseDialogOpen === group.id}
                    onOpenChange={(open) =>
                      setExpenseDialogOpen(open ? group.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full">
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                      </DialogHeader>
                      <ExpenseForm
                        group={group}
                        onExpenseAdded={handleExpenseAdded}
                        onSuccess={() => setExpenseDialogOpen(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
