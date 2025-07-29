import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface CheckinData {
  id: string
  last_checkin_at: string
  created_at: string
  updated_at: string
}

export function useCheckins() {
  const [checkin, setCheckin] = useState<CheckinData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCheckin()
    }
  }, [user])

  const fetchCheckin = async () => {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user!.id)
        .order('last_checkin_at', { ascending: false })
        .limit(1)

      if (error) {
        throw error
      }
      
      setCheckin(data && data.length > 0 ? data[0] : null)
    } catch (error) {
      console.error('Error fetching checkin:', error)
    } finally {
      setLoading(false)
    }
  }

  const performCheckin = async () => {
    try {
      const now = new Date().toISOString()
      
      if (checkin) {
        const { data, error } = await supabase
          .from('checkins')
          .update({ last_checkin_at: now })
          .eq('id', checkin.id)
          .select()
          .single()

        if (error) throw error
        setCheckin(data)
      } else {
        const { data, error } = await supabase
          .from('checkins')
          .insert([{ user_id: user!.id, last_checkin_at: now }])
          .select()
          .single()

        if (error) throw error
        setCheckin(data)
      }
    } catch (error) {
      console.error('Error performing checkin:', error)
      throw error
    }
  }

  const getStatus = () => {
    if (!checkin) return 'never'
    
    const lastCheckin = new Date(checkin.last_checkin_at)
    const now = new Date()
    const diffDays = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24)
    
    // Consider "triggered" if no checkin in 7 days (1 week)
    return diffDays > 7 ? 'triggered' : 'alive'
  }

  const getTimeUntilTrigger = () => {
    if (!checkin) return null
    
    const lastCheckin = new Date(checkin.last_checkin_at)
    const now = new Date()
    const triggerDate = new Date(lastCheckin.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days from last checkin
    const diffMs = triggerDate.getTime() - now.getTime()
    
    if (diffMs <= 0) return null // Already triggered
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    }
  }

  const getNextCheckinDate = () => {
    if (!checkin) return null
    
    const lastCheckin = new Date(checkin.last_checkin_at)
    const nextCheckin = new Date(lastCheckin.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days from last checkin
    
    return nextCheckin.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return {
    checkin,
    loading,
    performCheckin,
    getStatus,
    getTimeUntilTrigger,
    getNextCheckinDate,
    refetch: fetchCheckin
  }
}