import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { storage } from '@/lib/storage'
import { User } from '@/types'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])

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
        <p className="text-center text-gray-500">No users added yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Users</h2>
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
