'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storage } from '@/lib/storage'
import { Group } from '@/types'
import Link from 'next/link'

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])

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

  if (groups.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No groups created yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Groups</h2>
      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-4 border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.members.length} members
                </p>
              </div>
              <Link href={`/groups/${group.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
