'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded signup
    router.push('/users')
  }

  return (
    <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}