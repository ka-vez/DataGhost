import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('Environment variables:', {
  supabaseUrl: supabaseUrl ? 'present' : 'missing',
  supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
  allEnvVars: import.meta.env
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables:
    VITE_SUPABASE_URL: ${supabaseUrl ? 'present' : 'missing'}
    VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'present' : 'missing'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      digital_assets: {
        Row: {
          id: string
          user_id: string
          platform_name: string
          action: 'Delete' | 'Transfer' | 'Archive'
          recipient_email: string | null
          time_delay: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_name: string
          action: 'Delete' | 'Transfer' | 'Archive'
          recipient_email?: string | null
          time_delay?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_name?: string
          action?: 'Delete' | 'Transfer' | 'Archive'
          recipient_email?: string | null
          time_delay?: string
          created_at?: string
          updated_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          last_checkin_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_checkin_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_checkin_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}