import { GroupDetails } from '@/app/components/group-details'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function GroupPage({ params }: Props) {
  return <GroupDetails groupId={params.id} />
}
