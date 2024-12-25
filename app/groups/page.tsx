'use client'

import { GroupForm } from '../components/GroupForm'
import { GroupList } from '../components/GroupList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

export default function GroupsPage() {
  const router = useRouter()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Bill Buddy</h1>

      <Tabs
        defaultValue="groups"
        className="max-w-3xl mx-auto"
        onValueChange={(value) => {
          if (value === 'users') {
            router.push('/users')
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4 mt-4">
          <GroupForm />
          <GroupList />
        </TabsContent>
      </Tabs>
    </main>
  )
}
