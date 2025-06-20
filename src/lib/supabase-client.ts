import { supabase, SupabaseConfig } from '@/config/supabase'

/**
 * Pure Supabase API Client
 */
class SupabaseApiClient {
  private supabase = supabase
  
  /**
   * Get current user session from Supabase
   */
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return session
  }

  /**
   * Get current user from Supabase
   */
  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * Make authenticated request to Supabase Edge Function
   */
  async callEdgeFunction(functionName: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
  } = {}) {
    const session = await this.getSession()
    
    const response = await fetch(`${SupabaseConfig.functionsUrl}/${functionName}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Direct Supabase database query with RLS
   */
  async query(table: string) {
    return this.supabase.from(table)
  }

  /**
   * Authentication methods using Supabase Auth
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async signUp(email: string, password: string, options?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options
    })
    
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recover-password`,
    });
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  /**
   * File upload to Supabase Storage
   */
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  }

  /**
   * Get public URL for uploaded file
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Generate presigned upload URL for direct file upload
   */
  async createSignedUploadUrl(bucket: string, path: string, options?: any) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, options)
    
    if (error) throw error
    return data
  }
}

// Export singleton instance
export const apiClient = new SupabaseApiClient()
export default apiClient 