import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storage } from '@/lib/storage'
import { User } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserForm } from './user-form'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Load initial users
    setUsers(storage.getUsers())

    // Setup storage event listener to update users when changed
    const handleStorageChange = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === 'bill-buddy-users') {
        setUsers(storage.getUsers())
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

  if (users.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-new-user-dialog-description">
              <DialogHeader>
                <DialogTitle id="add-new-user-dialog-description">
                  Add New User
                </DialogTitle>
              </DialogHeader>
              <UserForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-center text-gray-500">No users added yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <UserForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-3 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
