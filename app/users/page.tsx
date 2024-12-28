'use client'

import { UserList } from '../components/user-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Bill Buddy</h1>

      <Tabs
        defaultValue="users"
        className="max-w-3xl mx-auto"
        onValueChange={(value) => {
          if (value === 'groups') {
            router.push('/groups')
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <UserList />
        </TabsContent>
      </Tabs>
    </main>
  )
}
