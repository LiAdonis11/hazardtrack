import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { apiGetNotifications, apiMarkNotificationRead } from '../lib/api'
import { useAuth } from './AuthContext'

interface Notification {
  id: number
  title: string
  body: string
  is_read: number
  created_at: string
  report_id?: number
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refreshing: boolean
  onRefresh: () => Promise<void>
  refreshNotifications: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

interface NotificationsProviderProps {
  children: ReactNode
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token } = useAuth()

  const refreshNotifications = async () => {
    if (!token) return
    try {
      const res = await apiGetNotifications(token)
      if (res?.status === 'success') {
        // Filter to show only unread notifications
        const allNotifications = res.notifications || []
        const unreadNotifications = allNotifications.filter((n: Notification) => n.is_read === 0)
        setNotifications(unreadNotifications)
      } else {
        console.error('Failed to fetch notifications:', res?.message || 'Unknown error')
      }
    } catch (error: any) {
      console.error('Error refreshing notifications:', error)
      // Prevent infinite loops by not retrying on 500 errors
      if (error.message?.includes('500')) {
        console.warn('Server error detected, stopping auto-refresh to prevent loops')
        return
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshNotifications()
  }

  const markAsRead = async (id: number) => {
    if (!token) return
    try {
      const res = await apiMarkNotificationRead(token, id)
      if (res?.status === 'success') {
        // Remove the notification from the list since it's now read
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => n.is_read === 0).length

  useEffect(() => {
    if (token) {
      refreshNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(refreshNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [token])

  // Listen for notification received events
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('notificationReceived', () => {
      console.log('Notification received event triggered, refreshing notifications')
      refreshNotifications()
    })

    return () => {
      subscription.remove()
    }
  }, [token])

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshing,
      onRefresh,
      refreshNotifications,
      markAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}
