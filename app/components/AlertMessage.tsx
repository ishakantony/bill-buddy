import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface AlertMessageProps {
  title?: string
  message: string
  variant?: 'default' | 'destructive'
  className?: string
}

export function AlertMessage({
  title,
  message,
  variant = 'destructive',
  className = '',
}: AlertMessageProps) {
  return (
    <Alert variant={variant} className={`mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
        <div>
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
