export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Organizations
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          logo: string | null
          areas_of_work: string[] | null
          address: Json | null
          type: 'MANAGER' | 'COORDINATOR'
          owner_id: string | null
          status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          access_granted_ids: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          name: string
          description?: string | null
          logo?: string | null
          areas_of_work?: string[] | null
          address?: Json | null
          type?: 'MANAGER' | 'COORDINATOR'
          owner_id?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          access_granted_ids?: string[] | null
        }
        Update: {
          name?: string
          description?: string | null
          logo?: string | null
          areas_of_work?: string[] | null
          address?: Json | null
          type?: 'MANAGER' | 'COORDINATOR'
          owner_id?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          access_granted_ids?: string[] | null
        }
      }
      
      // Users
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          full_name: string | null
          email: string
          phones: string[] | null
          organization_id: string | null
          role: string | null
          platform_role: 'NO_ORG' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'RELIF_MEMBER'
          status: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED'
          preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string // Must match auth.users.id
          first_name: string
          last_name: string
          email: string
          phones?: string[] | null
          organization_id?: string | null
          role?: string | null
          platform_role?: 'NO_ORG' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'RELIF_MEMBER'
          status?: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED'
          preferences?: Json | null
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string
          phones?: string[] | null
          organization_id?: string | null
          role?: string | null
          platform_role?: 'NO_ORG' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'RELIF_MEMBER'
          status?: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED'
          preferences?: Json | null
        }
      }
      
      // Beneficiaries
      beneficiaries: {
        Row: {
          id: string
          full_name: string
          email: string | null
          image_url: string | null
          documents: Json | null
          birthdate: string | null
          phones: string[] | null
          civil_status: string | null
          spoken_languages: string[] | null
          education: string | null
          gender: string | null
          occupation: string | null
          address: Json | null
          status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          current_housing_id: string | null
          current_room_id: string | null
          current_organization_id: string
          medical_information: Json | null
          emergency_contacts: Json | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          full_name: string
          email?: string | null
          image_url?: string | null
          documents?: Json | null
          birthdate?: string | null
          phones?: string[] | null
          civil_status?: string | null
          spoken_languages?: string[] | null
          education?: string | null
          gender?: string | null
          occupation?: string | null
          address?: Json | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          current_housing_id?: string | null
          current_room_id?: string | null
          current_organization_id: string
          medical_information?: Json | null
          emergency_contacts?: Json | null
          notes?: string | null
        }
        Update: {
          full_name?: string
          email?: string | null
          image_url?: string | null
          documents?: Json | null
          birthdate?: string | null
          phones?: string[] | null
          civil_status?: string | null
          spoken_languages?: string[] | null
          education?: string | null
          gender?: string | null
          occupation?: string | null
          address?: Json | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          current_housing_id?: string | null
          current_room_id?: string | null
          current_organization_id?: string
          medical_information?: Json | null
          emergency_contacts?: Json | null
          notes?: string | null
        }
      }
      
      // Cases
      cases: {
        Row: {
          id: string
          case_number: string
          title: string
          description: string | null
          status: 'IN_PROGRESS' | 'PENDING' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          urgency_level: 'IMMEDIATE' | 'WITHIN_WEEK' | 'WITHIN_MONTH' | 'FLEXIBLE'
          service_types: string[] | null
          beneficiary_id: string
          assigned_to_id: string | null
          due_date: string | null
          estimated_duration: string | null
          budget_allocated: number | null
          tags: string[] | null
          notes_count: number | null
          documents_count: number | null
          last_activity: string | null
          organization_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          case_number: string
          title: string
          description?: string | null
          status?: 'IN_PROGRESS' | 'PENDING' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          urgency_level?: 'IMMEDIATE' | 'WITHIN_WEEK' | 'WITHIN_MONTH' | 'FLEXIBLE'
          service_types?: string[] | null
          beneficiary_id: string
          assigned_to_id?: string | null
          due_date?: string | null
          estimated_duration?: string | null
          budget_allocated?: number | null
          tags?: string[] | null
          organization_id: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'IN_PROGRESS' | 'PENDING' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          urgency_level?: 'IMMEDIATE' | 'WITHIN_WEEK' | 'WITHIN_MONTH' | 'FLEXIBLE'
          service_types?: string[] | null
          assigned_to_id?: string | null
          due_date?: string | null
          estimated_duration?: string | null
          budget_allocated?: number | null
          tags?: string[] | null
        }
      }
      
      // Case Notes
      case_notes: {
        Row: {
          id: string
          case_id: string
          author_id: string
          content: string
          is_private: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          author_id: string
          content: string
          is_private?: boolean | null
        }
        Update: {
          content?: string
          is_private?: boolean | null
        }
      }
      
      // Case Documents
      case_documents: {
        Row: {
          id: string
          case_id: string
          uploaded_by_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          description: string | null
          is_confidential: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          uploaded_by_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          description?: string | null
          is_confidential?: boolean | null
        }
        Update: {
          file_name?: string
          description?: string | null
          is_confidential?: boolean | null
        }
      }
      
      // Housing
      housing: {
        Row: {
          id: string
          organization_id: string
          name: string
          status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          total_vacancies: number | null
          total_rooms: number | null
          occupied_vacancies: number | null
          address: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          organization_id: string
          name: string
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          total_vacancies?: number | null
          total_rooms?: number | null
          occupied_vacancies?: number | null
          address?: Json | null
        }
        Update: {
          name?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          total_vacancies?: number | null
          total_rooms?: number | null
          occupied_vacancies?: number | null
          address?: Json | null
        }
      }
      
      // Housing Rooms
      housing_rooms: {
        Row: {
          id: string
          housing_id: string
          name: string
          capacity: number
          occupied: number | null
          status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          housing_id: string
          name: string
          capacity?: number
          occupied?: number | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
        }
        Update: {
          name?: string
          capacity?: number
          occupied?: number | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
        }
      }

      // Product Types
      product_types: {
        Row: {
          id: string
          name: string
          description: string | null
          brand: string | null
          category: string | null
          organization_id: string
          unit_type: string | null
          total_in_storage: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          name: string
          description?: string | null
          brand?: string | null
          category?: string | null
          organization_id: string
          unit_type?: string | null
          total_in_storage?: number | null
        }
        Update: {
          name?: string
          description?: string | null
          brand?: string | null
          category?: string | null
          unit_type?: string | null
          total_in_storage?: number | null
        }
      }

      // Donations
      donations: {
        Row: {
          id: string
          organization_id: string
          beneficiary_id: string
          from_type: 'ORGANIZATION' | 'HOUSING'
          from_name: string | null
          from_id: string | null
          product_type_id: string
          quantity: number
          created_at: string | null
        }
        Insert: {
          organization_id: string
          beneficiary_id: string
          from_type: 'ORGANIZATION' | 'HOUSING'
          from_name?: string | null
          from_id?: string | null
          product_type_id: string
          quantity: number
        }
        Update: {
          from_type?: 'ORGANIZATION' | 'HOUSING'
          from_name?: string | null
          from_id?: string | null
          product_type_id?: string
          quantity?: number
        }
      }

      // Voluntary People
      voluntary_people: {
        Row: {
          id: string
          organization_id: string
          full_name: string
          email: string | null
          gender: string | null
          documents: Json | null
          birthdate: string | null
          phones: string[] | null
          address: Json | null
          status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          segments: string[] | null
          medical_information: Json | null
          emergency_contacts: Json | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          organization_id: string
          full_name: string
          email?: string | null
          gender?: string | null
          documents?: Json | null
          birthdate?: string | null
          phones?: string[] | null
          address?: Json | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          segments?: string[] | null
          medical_information?: Json | null
          emergency_contacts?: Json | null
          notes?: string | null
        }
        Update: {
          full_name?: string
          email?: string | null
          gender?: string | null
          documents?: Json | null
          birthdate?: string | null
          phones?: string[] | null
          address?: Json | null
          status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
          segments?: string[] | null
          medical_information?: Json | null
          emergency_contacts?: Json | null
          notes?: string | null
        }
      }
    }
    
    Enums: {
      // All 62 humanitarian service types
      service_type: 
        | 'CHILD_PROTECTION_CASE_MANAGEMENT'
        | 'GBV_CASE_MANAGEMENT'
        | 'GENERAL_PROTECTION_SERVICES'
        | 'SEXUAL_VIOLENCE_RESPONSE'
        | 'INTIMATE_PARTNER_VIOLENCE_SUPPORT'
        | 'HUMAN_TRAFFICKING_RESPONSE'
        | 'FAMILY_SEPARATION_REUNIFICATION'
        | 'UASC_SERVICES'
        | 'MHPSS'
        | 'LEGAL_AID_ASSISTANCE'
        | 'CIVIL_DOCUMENTATION_SUPPORT'
        | 'EMERGENCY_SHELTER_HOUSING'
        | 'NFI_DISTRIBUTION'
        | 'FOOD_SECURITY_NUTRITION'
        | 'CVA'
        | 'WASH'
        | 'HEALTHCARE_SERVICES'
        | 'EMERGENCY_MEDICAL_CARE'
        | 'SEXUAL_REPRODUCTIVE_HEALTH'
        | 'DISABILITY_SUPPORT_SERVICES'
        | 'EMERGENCY_EVACUATION'
        | 'SEARCH_RESCUE_COORDINATION'
        | 'RAPID_ASSESSMENT_NEEDS_ANALYSIS'
        | 'EMERGENCY_REGISTRATION'
        | 'EMERGENCY_TRANSPORTATION'
        | 'EMERGENCY_COMMUNICATION_SERVICES'
        | 'EMERGENCY_EDUCATION_SERVICES'
        | 'CHILD_FRIENDLY_SPACES'
        | 'SKILLS_TRAINING_VOCATIONAL_EDUCATION'
        | 'LITERACY_PROGRAMS'
        | 'AWARENESS_PREVENTION_CAMPAIGNS'
        | 'LIVELIHOOD_SUPPORT_PROGRAMS'
        | 'MICROFINANCE_CREDIT_SERVICES'
        | 'JOB_PLACEMENT_EMPLOYMENT_SERVICES'
        | 'AGRICULTURAL_SUPPORT'
        | 'BUSINESS_DEVELOPMENT_SUPPORT'
        | 'REFUGEE_SERVICES'
        | 'IDP_SERVICES'
        | 'RETURNEE_REINTEGRATION_SERVICES'
        | 'HOST_COMMUNITY_SUPPORT'
        | 'ELDERLY_CARE_SERVICES'
        | 'SERVICES_FOR_PERSONS_WITH_DISABILITIES'
        | 'CASE_REFERRAL_TRANSFER'
        | 'INTER_AGENCY_COORDINATION'
        | 'SERVICE_MAPPING_INFORMATION'
        | 'FOLLOW_UP_MONITORING'
        | 'CASE_CLOSURE_TRANSITION'
        | 'BIRTH_REGISTRATION'
        | 'IDENTITY_DOCUMENTATION'
        | 'LEGAL_COUNSELING'
        | 'COURT_SUPPORT_ACCOMPANIMENT'
        | 'DETENTION_MONITORING'
        | 'ADVOCACY_SERVICES'
        | 'PRIMARY_HEALTHCARE'
        | 'CLINICAL_MANAGEMENT_RAPE'
        | 'HIV_AIDS_PREVENTION_TREATMENT'
        | 'TUBERCULOSIS_TREATMENT'
        | 'MALNUTRITION_TREATMENT'
        | 'VACCINATION_PROGRAMS'
        | 'EMERGENCY_SURGERY'
        | 'CAMP_COORDINATION_MANAGEMENT'
        | 'MINE_ACTION_SERVICES'
        | 'PEACEKEEPING_PEACEBUILDING'
        | 'LOGISTICS_TELECOMMUNICATIONS'
        | 'INFORMATION_MANAGEMENT'
        | 'COMMUNITY_MOBILIZATION'
        | 'WINTERIZATION_SUPPORT'
      
      user_platform_role: 'NO_ORG' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'RELIF_MEMBER'
      user_status: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED'
      organization_type: 'MANAGER' | 'COORDINATOR'
      organization_status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
      beneficiary_status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
      case_status: 'IN_PROGRESS' | 'PENDING' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED'
      case_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      case_urgency: 'IMMEDIATE' | 'WITHIN_WEEK' | 'WITHIN_MONTH' | 'FLEXIBLE'
      allocation_type: 'ENTRANCE' | 'REALLOCATION'
      location_type: 'HOUSING' | 'ORGANIZATION'
      request_status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific type exports for common use
export type User = Tables<'users'>
export type Organization = Tables<'organizations'>
export type Beneficiary = Tables<'beneficiaries'>
export type Case = Tables<'cases'>
export type CaseNote = Tables<'case_notes'>
export type CaseDocument = Tables<'case_documents'>
export type Housing = Tables<'housing'>
export type HousingRoom = Tables<'housing_rooms'>
export type ServiceType = Enums<'service_type'>
export type UserPlatformRole = Enums<'user_platform_role'>
export type CaseStatus = Enums<'case_status'>
export type CasePriority = Enums<'case_priority'>

// Storage bucket constants
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  BENEFICIARY_DOCUMENTS: 'beneficiary-documents', 
  CASE_DOCUMENTS: 'case-documents',
  ORGANIZATION_ASSETS: 'organization-assets',
  HOUSING_IMAGES: 'housing-images'
} as const 