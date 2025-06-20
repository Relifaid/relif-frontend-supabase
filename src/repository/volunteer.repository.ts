import { supabase } from "@/config/supabase";
import { UpdateVoluntaryRequest, VoluntarySchema, CreateVoluntaryRequest } from "@/types/voluntary.types";
import { AxiosResponse } from "axios";
import { OrganizationSchema } from "@/types/organization.types";

// Helper function to transform database volunteer to VoluntarySchema
function transformVolunteer(dbVolunteer: any): VoluntarySchema {
    return {
        id: dbVolunteer.id,
        organization_id: dbVolunteer.organization_id,
        full_name: dbVolunteer.full_name,
        email: dbVolunteer.email || '',
        gender: dbVolunteer.gender || '',
        documents: dbVolunteer.documents || [],
        birthdate: dbVolunteer.birthdate || '',
        phones: dbVolunteer.phones || [],
        address: dbVolunteer.address || {},
        status: dbVolunteer.status || 'active',
        segments: dbVolunteer.segments || [],
        medical_information: dbVolunteer.medical_information || {},
        emergency_contacts: dbVolunteer.emergency_contacts || [],
        created_at: dbVolunteer.created_at,
        updated_at: dbVolunteer.updated_at,
        notes: dbVolunteer.notes || ''
    };
}

// Organization-level volunteer functions (moved from organization.repository.ts)
export async function getVoluntariesByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: VoluntarySchema[] }>> {
    try {
        console.log("👥 Fetching volunteers for organization:", orgId, { offset, limit, search });
        
        let query = supabase
            .from('voluntary_people')
            .select('*', { count: 'exact' })
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,notes.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformVolunteer) || [];
        
        console.log("✅ Volunteers fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: VoluntarySchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching volunteers:", {
            error: error.message,
            orgId,
            offset,
            limit,
            search
        });
        throw error;
    }
}

export async function getVolunteerStats(orgId: string): Promise<any> {
    try {
        console.log("📊 Fetching volunteer stats for org:", orgId);
        
        const { data: volunteers, error } = await supabase
            .from('voluntary_people')
            .select('id, status')
            .eq('organization_id', orgId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const stats = {
            total_volunteers: volunteers.length,
            active_volunteers: volunteers.filter(v => v.status === 'active').length,
            pending_volunteers: volunteers.filter(v => v.status === 'pending').length,
            inactive_volunteers: volunteers.filter(v => v.status === 'inactive').length,
        };
        
        console.log("✅ Volunteer stats calculated:", stats);
        return stats;
        
    } catch (error: any) {
        console.error("❌ Error calculating volunteer stats:", {
            error: error.message,
            orgId
        });
        return {
            total_volunteers: 0,
            active_volunteers: 0,
            pending_volunteers: 0,
            inactive_volunteers: 0
        };
    }
}

export async function createVolunteer(orgId: string, data: CreateVoluntaryRequest): Promise<AxiosResponse<VoluntarySchema>> {
    try {
        console.log("🏗️ Creating volunteer for organization:", orgId, "with data:", data);
        
        const volunteerData = {
            organization_id: orgId,
            full_name: data.full_name,
            email: data.email,
            gender: data.gender,
            documents: data.documents,
            birthdate: data.birthdate,
            phones: data.phones,
            address: data.address,
            status: 'active', // Default status
            segments: data.segments,
            medical_information: data.medical_information,
            emergency_contacts: data.emergency_contacts,
            notes: data.notes
        };
        
        const { data: createdVolunteer, error } = await supabase
            .from('voluntary_people')
            .insert(volunteerData)
            .select('*')
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedVolunteer = transformVolunteer(createdVolunteer);
        
        console.log("✅ Volunteer created successfully:", transformedVolunteer);
        return {
            data: transformedVolunteer,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse<VoluntarySchema>;
        
    } catch (error: any) {
        console.error("❌ Error creating volunteer:", {
            error: error.message,
            orgId,
            volunteerData: data
        });
        throw error;
    }
}

// Individual volunteer CRUD functions
export async function getVolunteerById(
    volunteerId: string
): Promise<AxiosResponse<VoluntarySchema>> {
    try {
        console.log("👤 Fetching volunteer by ID:", volunteerId);
        
        const { data, error } = await supabase
            .from('voluntary_people')
            .select('*')
            .eq('id', volunteerId)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedVolunteer = transformVolunteer(data);
        
        console.log("✅ Volunteer fetched successfully:", transformedVolunteer);
        return {
            data: transformedVolunteer,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<VoluntarySchema>;
        
    } catch (error: any) {
        console.error("❌ Error fetching volunteer:", {
            error: error.message,
            volunteerId
        });
        throw error;
    }
}

export async function updateVolunteer(
    volunteerId: string,
    data: UpdateVoluntaryRequest
): Promise<AxiosResponse<VoluntarySchema>> {
    try {
        console.log("📝 Updating volunteer:", volunteerId, "with data:", data);
        
        const { data: updatedVolunteer, error } = await supabase
            .from('voluntary_people')
            .update({
                full_name: data.full_name,
                email: data.email,
                gender: data.gender,
                documents: data.documents,
                birthdate: data.birthdate,
                phones: data.phones,
                address: data.address,
                segments: data.segments,
                medical_information: data.medical_information,
                emergency_contacts: data.emergency_contacts,
                notes: data.notes
            })
            .eq('id', volunteerId)
            .select('*')
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedVolunteer = transformVolunteer(updatedVolunteer);
        
        console.log("✅ Volunteer updated successfully:", transformedVolunteer);
        return {
            data: transformedVolunteer,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<VoluntarySchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating volunteer:", {
            error: error.message,
            volunteerId,
            updateData: data
        });
        throw error;
    }
}

export async function deleteVolunteer(volunteerId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting volunteer:", volunteerId);
        
        const { error } = await supabase
            .from('voluntary_people')
            .delete()
            .eq('id', volunteerId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Volunteer deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting volunteer:", {
            error: error.message,
            volunteerId
        });
        throw error;
    }
}

// Volunteer status management functions
export async function updateVolunteerStatus(
    volunteerId: string, 
    status: 'active' | 'pending' | 'inactive'
): Promise<AxiosResponse<VoluntarySchema>> {
    try {
        console.log("🔄 Updating volunteer status:", volunteerId, "to:", status);
        
        const { data: updatedVolunteer, error } = await supabase
            .from('voluntary_people')
            .update({ status })
            .eq('id', volunteerId)
            .select('*')
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedVolunteer = transformVolunteer(updatedVolunteer);
        
        console.log("✅ Volunteer status updated successfully:", transformedVolunteer);
        return {
            data: transformedVolunteer,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<VoluntarySchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating volunteer status:", {
            error: error.message,
            volunteerId,
            status
        });
        throw error;
    }
}
