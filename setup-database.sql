-- ============================================================================
-- RELIF HUMANITARIAN PLATFORM - DATABASE SCHEMA SETUP
-- ============================================================================
-- This script creates the complete database schema for the Relif platform
-- Run this in your Supabase SQL Editor to set up all tables and policies
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- User and Organization Types
CREATE TYPE user_platform_role AS ENUM ('NO_ORG', 'ORG_MEMBER', 'ORG_ADMIN', 'RELIF_MEMBER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'UNVERIFIED');
CREATE TYPE organization_type AS ENUM ('MANAGER', 'COORDINATOR');
CREATE TYPE organization_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'ACCEPTED', 'REJECTED', 'ARCHIVED');

-- Beneficiary and Case Types
CREATE TYPE beneficiary_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
CREATE TYPE case_status AS ENUM ('IN_PROGRESS', 'PENDING', 'ON_HOLD', 'CLOSED', 'CANCELLED');
CREATE TYPE case_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE case_urgency AS ENUM ('IMMEDIATE', 'WITHIN_WEEK', 'WITHIN_MONTH', 'FLEXIBLE');

-- System Types
CREATE TYPE allocation_type AS ENUM ('ENTRANCE', 'REALLOCATION');
CREATE TYPE location_type AS ENUM ('HOUSING', 'ORGANIZATION');
CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Service types for humanitarian cases (62 types)
CREATE TYPE service_type AS ENUM (
  'CHILD_PROTECTION_CASE_MANAGEMENT', 'GBV_CASE_MANAGEMENT', 'GENERAL_PROTECTION_SERVICES',
  'SEXUAL_VIOLENCE_RESPONSE', 'INTIMATE_PARTNER_VIOLENCE_SUPPORT', 'HUMAN_TRAFFICKING_RESPONSE',
  'FAMILY_SEPARATION_REUNIFICATION', 'UASC_SERVICES', 'MHPSS', 'LEGAL_AID_ASSISTANCE',
  'CIVIL_DOCUMENTATION_SUPPORT', 'EMERGENCY_SHELTER_HOUSING', 'NFI_DISTRIBUTION',
  'FOOD_SECURITY_NUTRITION', 'CVA', 'WASH', 'HEALTHCARE_SERVICES', 'EMERGENCY_MEDICAL_CARE',
  'SEXUAL_REPRODUCTIVE_HEALTH', 'DISABILITY_SUPPORT_SERVICES', 'EMERGENCY_EVACUATION',
  'SEARCH_RESCUE_COORDINATION', 'RAPID_ASSESSMENT_NEEDS_ANALYSIS', 'EMERGENCY_REGISTRATION',
  'EMERGENCY_TRANSPORTATION', 'EMERGENCY_COMMUNICATION_SERVICES', 'EMERGENCY_EDUCATION_SERVICES',
  'CHILD_FRIENDLY_SPACES', 'SKILLS_TRAINING_VOCATIONAL_EDUCATION', 'LITERACY_PROGRAMS',
  'AWARENESS_PREVENTION_CAMPAIGNS', 'LIVELIHOOD_SUPPORT_PROGRAMS', 'MICROFINANCE_CREDIT_SERVICES',
  'JOB_PLACEMENT_EMPLOYMENT_SERVICES', 'AGRICULTURAL_SUPPORT', 'BUSINESS_DEVELOPMENT_SUPPORT',
  'REFUGEE_SERVICES', 'IDP_SERVICES', 'RETURNEE_REINTEGRATION_SERVICES', 'HOST_COMMUNITY_SUPPORT',
  'ELDERLY_CARE_SERVICES', 'SERVICES_FOR_PERSONS_WITH_DISABILITIES', 'CASE_REFERRAL_TRANSFER',
  'INTER_AGENCY_COORDINATION', 'SERVICE_MAPPING_INFORMATION', 'FOLLOW_UP_MONITORING',
  'CASE_CLOSURE_TRANSITION', 'BIRTH_REGISTRATION', 'IDENTITY_DOCUMENTATION', 'LEGAL_COUNSELING',
  'COURT_SUPPORT_ACCOMPANIMENT', 'DETENTION_MONITORING', 'ADVOCACY_SERVICES', 'PRIMARY_HEALTHCARE',
  'CLINICAL_MANAGEMENT_RAPE', 'HIV_AIDS_PREVENTION_TREATMENT', 'TUBERCULOSIS_TREATMENT',
  'MALNUTRITION_TREATMENT', 'VACCINATION_PROGRAMS', 'EMERGENCY_SURGERY',
  'CAMP_COORDINATION_MANAGEMENT', 'MINE_ACTION_SERVICES', 'PEACEKEEPING_PEACEBUILDING',
  'LOGISTICS_TELECOMMUNICATIONS', 'INFORMATION_MANAGEMENT', 'COMMUNITY_MOBILIZATION',
  'WINTERIZATION_SUPPORT'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  areas_of_work TEXT[] DEFAULT '{}',
  address JSONB DEFAULT '{}',
  type organization_type NOT NULL DEFAULT 'COORDINATOR',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status organization_status NOT NULL DEFAULT 'ACTIVE',
  access_granted_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT NOT NULL UNIQUE,
  phones TEXT[] DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT,
  platform_role user_platform_role NOT NULL DEFAULT 'NO_ORG',
  status user_status NOT NULL DEFAULT 'UNVERIFIED',
  preferences JSONB DEFAULT '{"language": "en", "timezone": "UTC"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housing table
CREATE TABLE housing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status organization_status NOT NULL DEFAULT 'ACTIVE',
  total_vacancies INTEGER DEFAULT 0,
  total_rooms INTEGER DEFAULT 0,
  occupied_vacancies INTEGER DEFAULT 0,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housing rooms table
CREATE TABLE housing_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  housing_id UUID NOT NULL REFERENCES housing(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  occupied INTEGER DEFAULT 0,
  status organization_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beneficiaries table
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  image_url TEXT,
  documents JSONB DEFAULT '[]',
  birthdate DATE,
  phones TEXT[] DEFAULT '{}',
  civil_status TEXT,
  spoken_languages TEXT[] DEFAULT '{}',
  education TEXT,
  gender TEXT,
  occupation TEXT,
  address JSONB DEFAULT '{}',
  status beneficiary_status NOT NULL DEFAULT 'ACTIVE',
  current_housing_id UUID REFERENCES housing(id) ON DELETE SET NULL,
  current_room_id UUID REFERENCES housing_rooms(id) ON DELETE SET NULL,
  current_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  medical_information JSONB DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status case_status NOT NULL DEFAULT 'IN_PROGRESS',
  priority case_priority NOT NULL DEFAULT 'MEDIUM',
  urgency_level case_urgency NOT NULL DEFAULT 'FLEXIBLE',
  service_types service_type[] DEFAULT '{}',
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration TEXT,
  budget_allocated DECIMAL(12,2),
  tags TEXT[] DEFAULT '{}',
  notes_count INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case notes table
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case documents table
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_url TEXT NOT NULL,
  description TEXT,
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Product types table
CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_type TEXT,
  total_in_storage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  from_type location_type NOT NULL,
  from_name TEXT,
  from_id TEXT,
  product_type_id UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voluntary people table
CREATE TABLE voluntary_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  gender TEXT,
  documents JSONB DEFAULT '[]',
  birthdate DATE,
  phones TEXT[] DEFAULT '{}',
  address JSONB DEFAULT '{}',
  status beneficiary_status NOT NULL DEFAULT 'ACTIVE',
  segments TEXT[] DEFAULT '{}',
  medical_information JSONB DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-images', 'profile-images', true),
  ('beneficiary-documents', 'beneficiary-documents', false),
  ('case-documents', 'case-documents', false),
  ('organization-assets', 'organization-assets', true),
  ('housing-images', 'housing-images', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_people ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT platform_role = 'RELIF_MEMBER'
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT USING (
  id = get_user_organization_id() OR is_platform_admin()
);

CREATE POLICY "Platform admins can manage organizations" ON organizations FOR ALL USING (
  is_platform_admin()
);

-- Users policies
CREATE POLICY "Users can view org members" ON users FOR SELECT USING (
  organization_id = get_user_organization_id() OR is_platform_admin()
);

CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (
  id = auth.uid()
);

-- Beneficiaries policies
CREATE POLICY "Organization members can view beneficiaries" ON beneficiaries FOR SELECT USING (
  current_organization_id = get_user_organization_id() OR is_platform_admin()
);

CREATE POLICY "Organization members can manage beneficiaries" ON beneficiaries FOR ALL USING (
  current_organization_id = get_user_organization_id() OR is_platform_admin()
);

-- Cases policies
CREATE POLICY "Organization members can view cases" ON cases FOR SELECT USING (
  organization_id = get_user_organization_id() OR is_platform_admin()
);

CREATE POLICY "Organization members can manage cases" ON cases FOR ALL USING (
  organization_id = get_user_organization_id() OR is_platform_admin()
);

-- Case notes policies
CREATE POLICY "Case notes follow case access" ON case_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM cases 
    WHERE cases.id = case_notes.case_id 
    AND (cases.organization_id = get_user_organization_id() OR is_platform_admin())
  )
);

CREATE POLICY "Organization members can manage case notes" ON case_notes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM cases 
    WHERE cases.id = case_notes.case_id 
    AND (cases.organization_id = get_user_organization_id() OR is_platform_admin())
  )
);

-- Apply similar policies to other tables...
-- (Housing, case_documents, product_types, donations, voluntary_people)

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_str TEXT;
  sequence_num INTEGER;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM cases
  WHERE case_number LIKE 'CASE-' || year_str || '-%';
  
  new_number := 'CASE-' || year_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number_trigger BEFORE INSERT ON cases
  FOR EACH ROW EXECUTE FUNCTION set_case_number();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert sample organization
-- INSERT INTO organizations (name, description, type) VALUES 
--   ('Humanitarian Aid Organization', 'Sample organization for testing', 'COORDINATOR');

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================

-- Verify setup
SELECT 'Database schema setup completed successfully!' as status; 