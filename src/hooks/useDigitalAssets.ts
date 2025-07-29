import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface DigitalAsset {
  id: string
  platform_name: string
  action: 'Delete' | 'Transfer' | 'Archive'
  recipient_email: string | null
  time_delay: string
  created_at: string
  updated_at: string
  file_data?: string
  file_name?: string
  file_size?: string
  file_type?: string
  storage_path?: string
}

export function useDigitalAssets() {
  const [assets, setAssets] = useState<DigitalAsset[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAssets()
      
      // Set up real-time subscription for immediate updates
      const channel = supabase
        .channel('digital_assets_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'digital_assets',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setAssets(prev => [payload.new as DigitalAsset, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setAssets(prev => prev.map(asset => 
                asset.id === payload.new.id ? payload.new as DigitalAsset : asset
              ))
            } else if (payload.eventType === 'DELETE') {
              setAssets(prev => prev.filter(asset => asset.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAsset = async (asset: Omit<DigitalAsset, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('digital_assets')
        .insert([{ ...asset, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setAssets(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error adding asset:', error)
      throw error
    }
  }

  const updateAsset = async (id: string, updates: Partial<DigitalAsset>) => {
    try {
      const { data, error } = await supabase
        .from('digital_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAssets(prev => prev.map(asset => asset.id === id ? data : asset))
      return data
    } catch (error) {
      console.error('Error updating asset:', error)
      throw error
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('digital_assets')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAssets(prev => prev.filter(asset => asset.id !== id))
    } catch (error) {
      console.error('Error deleting asset:', error)
      throw error
    }
  }

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: fetchAssets
  }
}