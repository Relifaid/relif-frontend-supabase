import { supabase } from "@/config/supabase";
import { BeneficiarySchema } from "@/types/beneficiary.types";
import { CreateHousingRequest, HousingSchema, UpdateHousingRequest } from "@/types/housing.types";
import { CreateSpaceRequest, SpaceSchema } from "@/types/space.types";
import { AxiosResponse } from "axios";

// Helper function to transform database housing to HousingSchema
function transformHousing(dbHousing: any): HousingSchema {
    return {
        id: dbHousing.id,
        organization_id: dbHousing.organization_id,
        name: dbHousing.name,
        status: dbHousing.status,
        address: dbHousing.address || {},
        occupied_vacancies: dbHousing.occupied_vacancies || 0,
        total_vacancies: dbHousing.total_vacancies || 0,
        total_rooms: dbHousing.total_rooms || 0,
        created_at: dbHousing.created_at,
        updated_at: dbHousing.updated_at
    };
}

// Helper function to transform database space to SpaceSchema
function transformSpace(dbSpace: any): SpaceSchema {
    return {
        id: dbSpace.id,
        housing_id: dbSpace.housing_id,
        name: dbSpace.name,
        total_vacancies: dbSpace.capacity || 0,
        occupied_vacancies: dbSpace.occupied || 0,
        status: dbSpace.status,
        created_at: dbSpace.created_at,
        updated_at: dbSpace.updated_at
    };
}

// Helper function to transform database beneficiary for housing context
function transformBeneficiaryForHousing(dbBeneficiary: any): BeneficiarySchema {
    return {
        id: dbBeneficiary.id,
        full_name: dbBeneficiary.full_name,
        email: dbBeneficiary.email,
        image_url: dbBeneficiary.image_url,
        documents: dbBeneficiary.documents || {},
        birthdate: dbBeneficiary.birthdate,
        phones: dbBeneficiary.phones || [],
        civil_status: dbBeneficiary.civil_status,
        spoken_languages: dbBeneficiary.spoken_languages || [],
        education: dbBeneficiary.education,
        gender: dbBeneficiary.gender,
        occupation: dbBeneficiary.occupation,
        address: dbBeneficiary.address || {},
        status: dbBeneficiary.status,
        current_housing_id: dbBeneficiary.current_housing_id,
        current_housing: {} as any, // TODO: Populate from relationship query
        current_room_id: dbBeneficiary.current_room_id,
        current_room: {} as any, // TODO: Populate from relationship query
        medical_information: dbBeneficiary.medical_information || {},
        emergency_contacts: dbBeneficiary.emergency_contacts || {},
        notes: dbBeneficiary.notes,
        created_at: dbBeneficiary.created_at,
        updated_at: dbBeneficiary.updated_at
    };
}

// Organization-level housing functions (moved from organization.repository.ts)
export async function findHousingsByOrganizationId(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: HousingSchema[] }>> {
    try {
        console.log("🏠 Fetching housing for organization:", orgId, { offset, limit, search });
        
        let query = supabase
            .from('housing')
            .select('*', { count: 'exact' })
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformHousing) || [];
        
        console.log("✅ Housing fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: HousingSchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching housing:", {
            error: error.message,
            orgId,
            offset,
            limit,
            search
        });
        throw error;
    }
}

export async function getHousingStats(orgId: string): Promise<any> {
    try {
        console.log("📊 Fetching housing stats for org:", orgId);
        
        const { data: housing, error } = await supabase
            .from('housing')
            .select('id, status, total_vacancies, occupied_vacancies')
            .eq('organization_id', orgId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const stats = {
            total_housing: housing.length,
            available_housing: housing.filter(h => h.status === 'ACTIVE' && (h.occupied_vacancies || 0) < (h.total_vacancies || 0)).length,
            occupied_housing: housing.filter(h => h.status === 'ACTIVE' && (h.occupied_vacancies || 0) === (h.total_vacancies || 0)).length,
            maintenance_housing: housing.filter(h => ['INACTIVE', 'PENDING'].includes(h.status)).length,
            total_capacity: housing.reduce((sum, h) => sum + (h.total_vacancies || 0), 0),
            total_occupied: housing.reduce((sum, h) => sum + (h.occupied_vacancies || 0), 0)
        };
        
        console.log("✅ Housing stats calculated:", stats);
        return stats;
        
    } catch (error: any) {
        console.error("❌ Error calculating housing stats:", {
            error: error.message,
            orgId
        });
        return {
            total_housing: 0,
            available_housing: 0,
            occupied_housing: 0,
            maintenance_housing: 0,
            total_capacity: 0,
            total_occupied: 0
        };
    }
}

// Individual housing CRUD functions
export async function createHousing(
    data: CreateHousingRequest
): Promise<AxiosResponse<HousingSchema>> {
    try {
        console.log("🏗️ Creating housing with data:", data);
        
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("User not authenticated");
        }
        
        // Get user's organization
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();
        
        if (!userData?.organization_id) {
            throw new Error("User organization not found");
        }
        
        const housingData = {
            organization_id: userData.organization_id,
            name: data.name,
            address: data.address,
            status: 'ACTIVE' as const,
            total_vacancies: 0,
            total_rooms: 0,
            occupied_vacancies: 0
        };
        
        const { data: createdHousing, error } = await supabase
            .from('housing')
            .insert(housingData)
            .select()
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedHousing = transformHousing(createdHousing);
        
        console.log("✅ Housing created successfully:", transformedHousing);
        return {
            data: transformedHousing,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse<HousingSchema>;
        
    } catch (error: any) {
        console.error("❌ Error creating housing:", {
            error: error.message,
            housingData: data
        });
        throw error;
    }
}

export async function getHousingById(housingId: string): Promise<AxiosResponse<HousingSchema>> {
    try {
        console.log("🏠 Fetching housing by ID:", housingId);
        
        const { data, error } = await supabase
            .from('housing')
            .select('*')
            .eq('id', housingId)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedHousing = transformHousing(data);
        
        console.log("✅ Housing fetched successfully:", transformedHousing);
        return {
            data: transformedHousing,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<HousingSchema>;
        
    } catch (error: any) {
        console.error("❌ Error fetching housing:", {
            error: error.message,
            housingId
        });
        throw error;
    }
}

export async function updateHousing(
    housingId: string,
    data: UpdateHousingRequest
): Promise<AxiosResponse<HousingSchema>> {
    try {
        console.log("📝 Updating housing:", housingId, "with data:", data);
        
        const { data: updatedHousing, error } = await supabase
            .from('housing')
            .update(data)
            .eq('id', housingId)
            .select()
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedHousing = transformHousing(updatedHousing);
        
        console.log("✅ Housing updated successfully:", transformedHousing);
        return {
            data: transformedHousing,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<HousingSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating housing:", {
            error: error.message,
            housingId,
            updateData: data
        });
        throw error;
    }
}

export async function deleteHousing(housingId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting housing:", housingId);
        
        const { error } = await supabase
            .from('housing')
            .delete()
            .eq('id', housingId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Housing deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting housing:", {
            error: error.message,
            housingId
        });
        throw error;
    }
}

// Housing rooms/spaces functions
export async function getSpacesByHousingId(
    housingId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: SpaceSchema[] }>> {
    try {
        console.log("🏠 Fetching spaces for housing:", housingId, { offset, limit });
        
        const { data, error, count } = await supabase
            .from('housing_rooms')
            .select('*', { count: 'exact' })
            .eq('housing_id', housingId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformSpace) || [];
        
        console.log("✅ Spaces fetched successfully:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: SpaceSchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching spaces:", {
            error: error.message,
            housingId,
            offset,
            limit
        });
        throw error;
    }
}

export async function getBeneficiariesByHousingId(
    housingId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: BeneficiarySchema[] }>> {
    try {
        console.log("👥 Fetching beneficiaries for housing:", housingId, { offset, limit, search });
        
        let query = supabase
            .from('beneficiaries')
            .select('*', { count: 'exact' })
            .eq('current_housing_id', housingId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformBeneficiaryForHousing) || [];
        
        console.log("✅ Beneficiaries fetched successfully:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: BeneficiarySchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching beneficiaries:", {
            error: error.message,
            housingId,
            offset,
            limit,
            search
        });
        throw error;
    }
}

export async function getAllocationsByHousingId(
    housingId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse> {
    try {
        console.log("📋 Fetching allocations for housing:", housingId, { offset, limit });
        
        // Note: This would need an allocations/movements table to be fully implemented
        // For now, returning beneficiaries with allocation info
        const { data, error, count } = await supabase
            .from('beneficiaries')
            .select(`
                id,
                full_name,
                current_housing_id,
                current_room_id,
                created_at,
                updated_at
            `, { count: 'exact' })
            .eq('current_housing_id', housingId)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Allocations fetched successfully:", {
            count: count || 0,
            dataLength: data?.length || 0
        });
        
        return {
            data: { count: count || 0, data: data || [] },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error fetching allocations:", {
            error: error.message,
            housingId,
            offset,
            limit
        });
        throw error;
    }
}

export async function createSpace(
    housingId: string,
    data: CreateSpaceRequest[]
): Promise<AxiosResponse> {
    try {
        console.log("🏗️ Creating spaces for housing:", housingId, "data:", data);
        
        const spacesData = data.map(space => ({
            housing_id: housingId,
            name: space.name,
            capacity: space.total_vacancies || 1,
            occupied: 0,
            status: 'ACTIVE' as const
        }));
        
        const { data: createdSpaces, error } = await supabase
            .from('housing_rooms')
            .insert(spacesData)
            .select();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        // Update housing total_rooms count
        const { error: updateError } = await supabase
            .from('housing')
            .update({ 
                total_rooms: createdSpaces.length,
                total_vacancies: spacesData.reduce((sum, space) => sum + (space.capacity || 1), 0)
            })
            .eq('id', housingId);
        
        if (updateError) {
            console.warn("⚠️ Error updating housing totals:", updateError);
        }
        
        console.log("✅ Spaces created successfully:", createdSpaces);
        return {
            data: createdSpaces,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error creating spaces:", {
            error: error.message,
            housingId,
            spacesData: data
        });
        throw error;
    }
}
