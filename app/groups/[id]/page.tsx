import { GroupDetails } from '@/app/components/GroupDetails'

export default function GroupPage({ params }: { params: { id: string } }) {
  return <GroupDetails groupId={params.id} />
}
