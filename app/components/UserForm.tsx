import { useState, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { storage } from '@/lib/storage'
import { User } from '@/types'

// Helper function for generating IDs that works in both browser and test environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

interface UserFormProps {
  onSuccess?: () => void
}

export function UserForm({ onSuccess }: UserFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name || !email) return

    const newUser: User = {
      id: generateId(),
      name,
      email,
    }

    storage.addUser(newUser)
    setName('')
    setEmail('')
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="Enter your name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="Enter your email"
          required
        />
      </div>
      <Button type="submit">Add User</Button>
    </form>
  )
}
