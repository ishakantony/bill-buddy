'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserForm } from './components/UserForm'
import { UserList } from './components/UserList'
import { GroupForm } from './components/GroupForm'
import { GroupList } from './components/GroupList'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Bill Buddy</h1>

      <Tabs defaultValue="users" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <UserForm />
          <UserList />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-4">
          <GroupForm />
          <GroupList />
        </TabsContent>
      </Tabs>
    </main>
  )
}
