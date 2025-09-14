import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl', 
  lg: 'max-w-7xl',
  xl: 'max-w-8xl',
  full: 'max-w-none'
}

const paddingClasses = {
  none: 'px-0 py-0',
  sm: 'px-4 py-4',
  md: 'px-6 py-6',
  lg: 'px-8 py-8'
}

export function PageContainer({ 
  children, 
  className,
  size = 'lg',
  padding = 'md'
}: PageContainerProps) {
  return (
    <div className={cn(
      'container mx-auto',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Composants spécialisés pour différents types de pages
export function PageHeader({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={cn('mb-8', className)}>
      {children}
    </div>
  )
}

export function PageContent({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

export function PageSection({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {children}
    </section>
  )
}
