import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  last_sign_in: string
  is_admin: boolean
}

export interface UserStats {
  total_users: number
  active_users_24h: number
  active_users_7d: number
  active_users_30d: number
  daily_active_users: number
  monthly_active_users: number
  events_created_30d: number
  ai_interactions: number
}
