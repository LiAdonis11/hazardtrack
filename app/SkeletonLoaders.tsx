
import { motion } from 'framer-motion'

// Base Skeleton Component
function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  )
}

// Report Card Skeleton
export function ReportCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-5 w-32" />
          <SkeletonBase className="h-4 w-48" />
        </div>
        <SkeletonBase className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-8 w-20" />
        <SkeletonBase className="h-4 w-32 ml-auto" />
      </div>
    </div>
  )
}

// Report List Skeleton
export function ReportListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <ReportCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonBase className="h-3 w-16" />
              <SkeletonBase className="h-6 w-12" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted p-3 border-b border-border">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonBase key={i} className="h-4" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-3"
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, j) => (
                <SkeletonBase key={j} className="h-4" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="space-y-3">
        <SkeletonBase className="h-5 w-32" />
        <div className="h-64 flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-1 skeleton rounded-t-lg"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar and name */}
      <div className="flex flex-col items-center gap-3">
        <SkeletonBase className="w-24 h-24 rounded-full" />
        <div className="space-y-2 flex flex-col items-center">
          <SkeletonBase className="h-6 w-40" />
          <SkeletonBase className="h-4 w-32" />
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <SkeletonBase className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonBase className="h-4 w-24" />
                <SkeletonBase className="h-3 w-40" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Map Skeleton
export function MapSkeleton() {
  return (
    <div className="relative bg-card border border-border rounded-xl overflow-hidden" style={{ height: '400px' }}>
      <SkeletonBase className="w-full h-full rounded-none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-2"
        >
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-10 w-full" />
        </motion.div>
      ))}
      <SkeletonBase className="h-10 w-full mt-6" />
    </div>
  )
}

// Details Screen Skeleton
export function DetailsScreenSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-48" />
        <div className="flex gap-2">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Image */}
      <SkeletonBase className="h-48 w-full" />

      {/* Content sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
        >
          <SkeletonBase className="h-5 w-32" />
          <div className="space-y-2">
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
            <SkeletonBase className="h-4 w-4/6" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Simple Loading Spinner
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full`}
    />
  )
}

// Centered Loading State
export function CenteredLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Shimmer effect for images
export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`}>
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  )
}
