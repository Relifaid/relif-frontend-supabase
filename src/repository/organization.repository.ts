import { apiClient } from "@/lib/supabase-client";
import {
    CreateOrganizationRequest,
    OrganizationSchema,
    UpdateOrganizationRequest,
} from "@/types/organization.types";
import type { AxiosResponse } from "axios";

const PREFIX = "organizations";

export async function createOrganization(
    data: CreateOrganizationRequest
): Promise<AxiosResponse<OrganizationSchema>> {
    console.log("🏢 Creating organization via Supabase:", data);
    
    // Get current user session
    const session = await apiClient.getSession();
    if (!session?.user) {
        throw new Error("User not authenticated");
    }
    
    const { data: organizationData, error } = await (await apiClient.query('organizations'))
        .insert({
            name: data.name,
            description: data.description,
            ...(data as any).type && { type: (data as any).type },
            ...(data as any).address && { address: (data as any).address },
            ...(data as any).phones && { phones: (data as any).phones },
            ...(data as any).email && { email: (data as any).email },
            ...(data as any).website && { website: (data as any).website },
            ...(data as any).logo_url && { logo_url: (data as any).logo_url },
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    
    console.log("✅ Organization created successfully via Supabase");
    
    return {
        data: organizationData as OrganizationSchema,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
    } as AxiosResponse<OrganizationSchema>;
}

export async function findOrganizationByID(
    orgId: string
): Promise<AxiosResponse<OrganizationSchema>> {
    console.log("🏢 Fetching organization via Supabase:", orgId);
    
    const { data, error } = await (await apiClient.query('organizations'))
        .select('*')
        .eq('id', orgId)
        .single();
    
    if (error) throw error;
    
    console.log("✅ Organization fetched successfully via Supabase");
    
    return {
        data: data as OrganizationSchema,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
    } as AxiosResponse<OrganizationSchema>;
}

export async function updateOrganization(
    orgId: string,
    data: UpdateOrganizationRequest
): Promise<void> {
    console.log("✏️ Updating organization via Supabase:", orgId);
    
    const { error } = await (await apiClient.query('organizations'))
        .update({
            name: data.name,
            description: data.description,
            ...(data as any).type && { type: (data as any).type },
            ...(data as any).address && { address: (data as any).address },
            ...(data as any).phones && { phones: (data as any).phones },
            ...(data as any).email && { email: (data as any).email },
            ...(data as any).website && { website: (data as any).website },
            ...(data as any).logo_url && { logo_url: (data as any).logo_url },
            updated_at: new Date().toISOString()
        })
        .eq('id', orgId);
    
    if (error) throw error;
    
    console.log("✅ Organization updated successfully via Supabase");
}

export async function findAllOrganizations(
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: OrganizationSchema[] }>> {
    console.log("🏢 Fetching all organizations via Supabase:", { offset, limit });
    
    const { data, error, count } = await (await apiClient.query('organizations'))
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log("✅ Organizations fetched successfully via Supabase:", { count, dataLength: data?.length });
    
    return {
        data: { 
            count: count || 0, 
            data: (data || []) as OrganizationSchema[] 
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
    } as AxiosResponse<{ count: number; data: OrganizationSchema[] }>;
}

export async function desativateOrganization(orgId: string): Promise<void> {
    console.log("❌ Deactivating organization via Supabase:", orgId);
    
    const { error } = await (await apiClient.query('organizations'))
        .update({
            status: 'INACTIVE',
            updated_at: new Date().toISOString()
        })
        .eq('id', orgId);
    
    if (error) throw error;
    
    console.log("✅ Organization deactivated successfully via Supabase");
}

export async function reactivateOrganization(orgId: string): Promise<void> {
    console.log("✅ Reactivating organization via Supabase:", orgId);
    
    const { error } = await (await apiClient.query('organizations'))
        .update({
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
        })
        .eq('id', orgId);
    
    if (error) throw error;
    
    console.log("✅ Organization reactivated successfully via Supabase");
}

// Re-exported functions from dedicated repositories (these are now pure Supabase)
export {
    findUsersByOrganizationId
} from './user.repository';

export {
    findHousingsByOrganizationId,
    getHousingStats
} from './housing.repository';

export {
    getVoluntariesByOrganizationID,
    createVolunteer,
    getVolunteerStats
} from './volunteer.repository';

export {
    getProductsByOrganizationID,
    createProduct,
    getInventoryStats
} from './inventory.repository';

export {
    getCasesByOrganizationID,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    getCaseStats,
    getCaseNotes,
    createCaseNote,
    updateCaseNote,
    deleteCaseNote,
    getCaseDocuments,
    generateCaseDocumentUploadLink,
    generateCaseDocumentDownloadLink,
    createCaseDocument,
    updateCaseDocument,
    deleteCaseDocument,
    extractFileKeyFromS3Url
} from './case.repository';

// Beneficiary functions - pure Supabase
export async function getBeneficiariesByOrganizationID(
    organizationId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: any[] }>> {
    console.log("👥 Fetching beneficiaries via Supabase:", { organizationId, offset, limit, search });
    
    let query = (await apiClient.query('beneficiaries'))
        .select(`
            *,
            current_housing:housing(id, name, address),
            current_room:housing_rooms(id, name, capacity)
        `, { count: 'exact' })
        .eq('organization_id', organizationId);
    
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log("✅ Beneficiaries fetched successfully via Supabase:", { count, dataLength: data?.length });
    
    return {
        data: { 
            count: count || 0, 
            data: data || [] 
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
    } as AxiosResponse<{ count: number; data: any[] }>;
}

export async function createBeneficiary(
    organizationId: string,
    data: any
): Promise<AxiosResponse<any>> {
    console.log("👤 Creating beneficiary via Supabase:", organizationId);
    
    const { data: beneficiaryData, error } = await (await apiClient.query('beneficiaries'))
        .insert({
            organization_id: organizationId,
            full_name: data.full_name,
            email: data.email,
            phones: data.phones,
            birthdate: data.birthdate,
            gender: data.gender,
            civil_status: data.civil_status,
            spoken_languages: data.spoken_languages,
            education: data.education,
            occupation: data.occupation,
            address: data.address,
            medical_information: data.medical_information,
            emergency_contacts: data.emergency_contacts,
            notes: data.notes,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    
    console.log("✅ Beneficiary created successfully via Supabase");
    
    return {
        data: beneficiaryData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
    } as AxiosResponse<any>;
}

export async function getBeneficiaryStats(orgId: string): Promise<any> {
    console.log("📊 Calculating beneficiary stats via Supabase:", orgId);
    
    try {
        const { data: beneficiaries, error } = await (await apiClient.query('beneficiaries'))
            .select('status')
            .eq('organization_id', orgId);
        
        if (error) throw error;
        
        const stats = {
            total_beneficiaries: beneficiaries?.length || 0,
            active_beneficiaries: beneficiaries?.filter(b => b.status === 'ACTIVE').length || 0,
            pending_beneficiaries: beneficiaries?.filter(b => b.status === 'PENDING').length || 0,
            inactive_beneficiaries: beneficiaries?.filter(b => b.status === 'INACTIVE').length || 0,
        };
        
        console.log("✅ Beneficiary stats calculated successfully via Supabase:", stats);
        return stats;
    } catch (error) {
        console.error("Failed to calculate beneficiary stats:", error);
        return {
            total_beneficiaries: 0,
            active_beneficiaries: 0,
            pending_beneficiaries: 0,
            inactive_beneficiaries: 0
        };
    }
}

// Legacy functions that may not be needed (commented out)
// These were calling old Go backend and may not be necessary for Supabase version
/*
export async function findJoinInvitesByOrganizationId(...) { ... }
export async function findJoinRequestsByOrganizationId(...) { ... }
export async function findDataAccessRequestsByOrganizationId(...) { ... }
export async function findUpdateOrganizationTypeRequestsByOrganizationId(...) { ... }
export async function findJoinPlatformInvitesByOrganizationId(...) { ... }
export async function createJoinOrganizationRequest(...) { ... }
export async function createDataAccessRequest(...) { ... }
export async function getDataAccessGrants(...) { ... }
*/








