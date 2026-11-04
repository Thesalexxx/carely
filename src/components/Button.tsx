import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'primary': 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
            'secondary': 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
            'outline': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
            'ghost': 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
          }[variant],
          {
            'sm': 'h-8 px-3 text-sm',
            'md': 'h-10 px-4 text-sm',
            'lg': 'h-12 px-6 text-base'
          }[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }