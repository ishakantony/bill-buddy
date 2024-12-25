import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { storage } from '@/lib/storage'
import { Group } from '@/types'

export function GroupForm() {
  const [name, setName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const users = storage.getUsers()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || selectedMembers.length < 2) return

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      members: users.filter((user) => selectedMembers.includes(user.id)),
      expenses: [],
    }

    storage.addGroup(newGroup)
    setName('')
    setSelectedMembers([])
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
          <Label htmlFor="name">Group Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Members (select at least 2)</Label>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => handleMemberSelect(user.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`user-${user.id}`} className="text-sm">
                  {user.name} ({user.email})
                </label>
              </div>
            ))}
          </div>
        </div>

        {users.length < 2 && (
          <p className="text-sm text-red-500">
            Add at least 2 users before creating a group
          </p>
        )}

        <Button
          type="submit"
          disabled={users.length < 2 || selectedMembers.length < 2}
        >
          Create Group
        </Button>
      </form>
    </Card>
  )
}
