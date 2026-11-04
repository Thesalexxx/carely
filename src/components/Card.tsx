import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-xl shadow-soft border border-gray-200 p-6', className)}
        {...props}
      >
        {title && (
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            {title}
          </h2>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }