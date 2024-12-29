'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded login
    router.push('/users')
  }

  return (
    <div className="flex items-center justify-center grow">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}