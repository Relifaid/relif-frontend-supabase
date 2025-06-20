import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with typed database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Supabase configuration
export const SupabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  functionsUrl: `${supabaseUrl}/functions/v1`,
  storageUrl: `${supabaseUrl}/storage/v1`,
}

// Database types are now imported from @/types/database.types 