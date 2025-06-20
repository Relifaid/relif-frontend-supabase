import { supabase, SupabaseConfig } from '@/config/supabase'
import { client as legacyClient } from './axios-client'
import type { AxiosResponse } from 'axios'

/**
 * Hybrid API Client - Supports both Supabase and Legacy endpoints
 * Gradually migrates endpoints from legacy to Supabase
 */
class HybridApiClient {
  private supabase = supabase
  private legacyClient = legacyClient
  
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
   * Fallback to legacy API (for endpoints not yet migrated)
   */
  async legacyRequest(endpoint: string, options: any = {}) {
    return this.legacyClient.request({
      url: endpoint,
      ...options
    })
  }

  /**
   * Smart request - tries Supabase first, falls back to legacy
   */
  async smartRequest(endpoint: string, options: any = {}, preferSupabase = false) {
    if (preferSupabase) {
      try {
        // Try Supabase Edge Function first
        const functionName = this.mapEndpointToFunction(endpoint)
        if (functionName) {
          return await this.callEdgeFunction(functionName, {
            method: options.method,
            body: options.data,
            headers: options.headers
          })
        }
      } catch (error) {
        console.warn(`Supabase request failed for ${endpoint}, falling back to legacy:`, error)
      }
    }

    // Fallback to legacy
    return this.legacyRequest(endpoint, options)
  }

  /**
   * Map legacy endpoints to Supabase Edge Function names
   */
  private mapEndpointToFunction(endpoint: string): string | null {
    const mapping: Record<string, string> = {
      'auth/sign-in': 'auth',
      'auth/sign-up': 'auth', 
      'auth/me': 'auth',
      'cases': 'cases',
      'beneficiaries': 'beneficiaries',
      'organizations': 'organizations',
      'users': 'users',
      'email': 'email'
    }

    for (const [pattern, func] of Object.entries(mapping)) {
      if (endpoint.includes(pattern)) {
        return func
      }
    }

    return null
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
export const apiClient = new HybridApiClient()
export default apiClient 