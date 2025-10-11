import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, CheckCircle, X } from 'lucide-react'

type Report = any

interface Notification {
  id: string
  type: 'new-report' | 'status-update' | 'priority-change'
  title: string
  message: string
  report?: Report
  timestamp: Date
  read: boolean
}

interface NotificationSystemProps {
  userType: 'bfp' | 'admin'
}

export function NotificationSystem({ userType }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to show notification (for demo)
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'new-report',
          title: 'New Hazard Report',
          message: `Fire hazard reported at ${['Barangay 1', 'Barangay 2', 'Barangay 3'][Math.floor(Math.random() * 3)]}`,
          timestamp: new Date(),
          read: false
        }
        
        setNotifications(prev => [newNotification, ...prev])
        setCurrentNotification(newNotification)
        setShowNotification(true)

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setShowNotification(false)
    if (currentNotification) {
      setNotifications(prev =>
        prev.map(n => n.id === currentNotification.id ? { ...n, read: true } : n)
      )
    }
  }

  return (
    <>
      <AnimatePresence>
        {showNotification && currentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-primary/5 border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: 2
                    }}
                  >
                    {currentNotification.type === 'new-report' && (
                      <div className="p-2 bg-primary rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    {currentNotification.type === 'status-update' && (
                      <div className="p-2 bg-success rounded-lg">
                        <CheckCircle className="w-5 h-5 text-success-foreground" />
                      </div>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-foreground">{currentNotification.title}</h4>
                      <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {currentNotification.message}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {currentNotification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Animated progress bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-1 bg-primary mt-3 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification indicator badge */}
      <NotificationBadge count={notifications.filter(n => !n.read).length} />
    </>
  )
}

function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed top-4 right-4 z-40"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
      >
        <span>{count > 9 ? '9+' : count}</span>
      </motion.div>
    </motion.div>
  )
}

// Inline notification component for lists
interface InlineNotificationProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onDismiss?: () => void
}

export function InlineNotification({ message, type = 'info', onDismiss }: InlineNotificationProps) {
  const colors = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-3 rounded-lg border ${colors[type]} flex items-center justify-between gap-2`}
    >
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:bg-black/5 rounded">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}

// Pulse indicator for new items
export function NewItemPulse() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
    />
  )
}
