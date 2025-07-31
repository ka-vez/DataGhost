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
      console.log('Setting up assets subscription for user:', user.id)
      fetchAssets()
      
      // Set up real-time subscription for immediate updates
      const channel = supabase
        .channel(`digital_assets_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'digital_assets',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time subscription event:', payload.eventType, payload)
            if (payload.eventType === 'INSERT') {
              console.log('Adding asset to state via subscription:', payload.new)
              setAssets(prev => {
                // Check if asset already exists to prevent duplicates
                const exists = prev.some(asset => asset.id === payload.new.id)
                if (exists) {
                  console.log('Asset already exists, skipping duplicate')
                  return prev
                }
                return [payload.new as DigitalAsset, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              console.log('Updating asset via subscription:', payload.new)
              setAssets(prev => prev.map(asset => 
                asset.id === payload.new.id ? payload.new as DigitalAsset : asset
              ))
            } else if (payload.eventType === 'DELETE') {
              console.log('Deleting asset via subscription:', payload.old)
              setAssets(prev => prev.filter(asset => asset.id !== payload.old.id))
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
        })

      return () => {
        console.log('Cleaning up assets subscription')
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
      console.log('addAsset called with:', asset)
      const { data, error } = await supabase
        .from('digital_assets')
        .insert([{ ...asset, user_id: user!.id }])
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      console.log('Asset inserted successfully:', data)
      
      // Add to state immediately for responsive UI
      setAssets(prev => [data, ...prev])
      
      // Also trigger a refetch after a delay to ensure consistency
      setTimeout(() => {
        console.log('Triggering refetch to ensure consistency')
        fetchAssets()
      }, 1000)
      
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

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      // Ensure we have exactly one updated row
      if (!data || data.length === 0) {
        throw new Error('No asset found with the given ID')
      }
      
      if (data.length > 1) {
        throw new Error('Multiple assets found with the same ID')
      }
      
      const updatedAsset = data[0]
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset))
      return updatedAsset
    } catch (error) {
      console.error('Error updating asset:', error)
      throw error
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      // Get the asset data before deletion for activity tracking
      const assetToDelete = assets.find(asset => asset.id === id)
      
      const { error } = await supabase
        .from('digital_assets')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setAssets(prev => prev.filter(asset => asset.id !== id))
      
      // Track deletion in localStorage for activity tracking
      if (assetToDelete) {
        const deletedAssets = JSON.parse(localStorage.getItem('deletedAssets') || '[]')
        const deletionRecord = {
          id: assetToDelete.id,
          platform_name: assetToDelete.platform_name,
          action: assetToDelete.action,
          deleted_at: new Date().toISOString()
        }
        deletedAssets.unshift(deletionRecord)
        // Keep only last 10 deletions
        localStorage.setItem('deletedAssets', JSON.stringify(deletedAssets.slice(0, 10)))
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('deletedAssetsUpdated'))
      }
      
      return assetToDelete
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