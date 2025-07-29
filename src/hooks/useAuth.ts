import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth timeout - setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        console.error('Error getting session:', error)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // If it's a table doesn't exist error, that's okay - just continue without profile
        if (error.message.includes('relation "user_profiles" does not exist')) {
          console.warn('user_profiles table does not exist yet - continuing without profile')
          setUserProfile(null)
        } else {
          throw error
        }
      } else {
        setUserProfile(data || null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username
        }
      }
    })
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('User already registered') || 
          error.message.includes('already been registered') ||
          error.message.includes('already exists')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }
      if (error.message.includes('email_address_invalid')) {
        throw new Error('Please enter a valid email address.')
      }
      if (error.message.includes('password')) {
        throw new Error('Password must be at least 6 characters long.')
      }
      if (error.message.includes('signup_disabled')) {
        throw new Error('Account creation is currently disabled. Please try again later.')
      }
      throw new Error(error.message || 'Failed to create account. Please try again.')
    }

    // Create user profile after successful signup
    if (data.user) {
      try {
        // Wait a moment for the auth to fully process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ id: data.user.id, username }])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't throw here as the user is already created
          // We'll handle profile creation in the auth state change
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('invalid_credentials') ||
          error.message.includes('Email not confirmed')) {
        throw new Error('The email or password you entered is incorrect. Please check your credentials and try again.')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      }
      if (error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait a moment before trying again.')
      }
      throw new Error(error.message || 'Failed to sign in. Please try again.')
    }

    // If sign in successful but no profile exists, create one
    if (data.user && !userProfile) {
      try {
        // Try to fetch existing profile first
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingProfile) {
          // Create profile with username from user metadata or email fallback
          const defaultUsername = data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User'
          await supabase
            .from('user_profiles')
            .insert([{ id: data.user.id, username: defaultUsername }])
        }
      } catch (profileError) {
        console.error('Error handling user profile:', profileError)
      }
    }
  }

  const signOut = async () => {
    // Immediately clear the user state for instant UI feedback
    setUser(null)
    setUserProfile(null)
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, keep the user state cleared
      // as the local session should be cleared regardless
    }
  }

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  }
}