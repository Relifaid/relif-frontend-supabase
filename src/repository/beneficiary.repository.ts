import { client } from "@/lib/axios-client";
import { apiClient } from "@/lib/supabase-client";
import {
    BeneficiaryAllocationSchema,
    BeneficiarySchema,
    DonateProductToBeneficiaryRequest,
    Donation,
    UpdateBeneficiaryRequest,
} from "@/types/beneficiary.types";
import type { Beneficiary } from "@/types/database.types";
import { AxiosResponse } from "axios";

const PREFIX = "beneficiaries";

export async function getBeneficiaryById(
    beneficiaryId: string
): Promise<AxiosResponse<BeneficiarySchema>> {
    try {
        console.log("👤 Fetching beneficiary via Supabase:", beneficiaryId);
        
        // Try Supabase first - get beneficiary with related data
        const { data, error } = await (await apiClient.query('beneficiaries'))
            .select(`
                *,
                current_housing:housing(id, name),
                current_room:housing_rooms(id, name),
                current_organization:organizations(id, name)
            `)
            .eq('id', beneficiaryId)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            throw new Error("Beneficiary not found");
        }
        
        console.log("✅ Beneficiary fetched successfully via Supabase");
        
        // Transform Supabase data to match legacy format
        const transformedData: BeneficiarySchema = {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            image_url: data.image_url,
            documents: data.documents as any || [],
            birthdate: data.birthdate || '',
            phones: data.phones || [],
            civil_status: data.civil_status || '',
            spoken_languages: data.spoken_languages || [],
            education: data.education || '',
            gender: data.gender || '',
            occupation: data.occupation || '',
            address: data.address as any || {},
            status: data.status,
            current_housing_id: data.current_housing_id || '',
            current_room_id: data.current_room_id || '',
            medical_information: data.medical_information as any || {},
            emergency_contacts: data.emergency_contacts as any || [],
            notes: data.notes || '',
            created_at: data.created_at || '',
            updated_at: data.updated_at || '',
            // Add legacy format fields
            current_housing: data.current_housing as any || {},
            current_room: data.current_room as any || {},
        };
        
        return {
            data: transformedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<BeneficiarySchema>;
        
    } catch (supabaseError) {
        console.warn("Supabase getBeneficiaryById failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}`,
            method: "GET",
        });
    }
}

export async function updateBeneficiary(
    beneficiaryId: string,
    data: UpdateBeneficiaryRequest
): Promise<AxiosResponse> {
    try {
        console.log("✏️ Updating beneficiary via Supabase:", beneficiaryId);
        
        // Try Supabase first
        const { data: updatedData, error } = await (await apiClient.query('beneficiaries'))
            .update({
                full_name: data.full_name,
                email: data.email,
                image_url: data.image_url,
                documents: data.documents,
                birthdate: data.birthdate,
                phones: data.phones,
                civil_status: data.civil_status,
                spoken_languages: data.spoken_languages,
                education: data.education,
                gender: data.gender,
                occupation: data.occupation,
                address: data.address,
                medical_information: data.medical_information,
                emergency_contacts: data.emergency_contacts,
                notes: data.notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', beneficiaryId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log("✅ Beneficiary updated successfully via Supabase");
        
        return {
            data: updatedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (supabaseError) {
        console.warn("Supabase updateBeneficiary failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}`,
            method: "PUT",
            data,
        });
    }
}

export async function generateProfileImageUploadLink(
    fileType: string
): Promise<AxiosResponse<{ link: string }>> {
    try {
        console.log("📸 Generating profile image upload via Supabase Storage:", fileType);
        
        // Get current user session for authentication
        const session = await apiClient.getSession();
        if (!session?.user) {
            throw new Error("User not authenticated");
        }
        
        // Generate unique file name with timestamp
        const timestamp = Date.now();
        const fileExtension = fileType.split('/')[1] || 'jpg';
        const fileName = `${session.user.id}_${timestamp}.${fileExtension}`;
        const filePath = `profiles/${fileName}`;
        
        // Generate presigned URL for upload using Supabase Storage
        const data = await apiClient.createSignedUploadUrl('profile-images', filePath, {
            upsert: true
        });
        
        console.log("✅ Profile image upload URL generated successfully via Supabase Storage");
        
        return {
            data: { link: data.signedUrl },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ link: string }>;
        
    } catch (supabaseError) {
        console.warn("Supabase Storage generateProfileImageUploadLink failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/generate-profile-image-upload-link`,
            method: "POST",
            data: {
                file_type: fileType,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

export async function deleteBeneficiary(beneficiaryId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting beneficiary via Supabase:", beneficiaryId);
        
        // Try Supabase first
        const { error } = await (await apiClient.query('beneficiaries'))
            .delete()
            .eq('id', beneficiaryId);
        
        if (error) throw error;
        
        console.log("✅ Beneficiary deleted successfully via Supabase");
        
        return {
            data: { success: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (supabaseError) {
        console.warn("Supabase deleteBeneficiary failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}`,
            method: "DELETE",
        });
    }
}

export async function allocateBeneficiary(
    beneficiaryId: string,
    housingId: string,
    roomId: string
): Promise<AxiosResponse> {
    try {
        console.log("🏠 Allocating beneficiary via Supabase:", beneficiaryId, { housingId, roomId });
        
        // Try Supabase first - update beneficiary housing allocation
        const { data: updatedData, error } = await (await apiClient.query('beneficiaries'))
            .update({
                current_housing_id: housingId,
                current_room_id: roomId,
                updated_at: new Date().toISOString()
            })
            .eq('id', beneficiaryId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log("✅ Beneficiary allocated successfully via Supabase");
        
        return {
            data: updatedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (supabaseError) {
        console.warn("Supabase allocateBeneficiary failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/allocate`,
            method: "POST",
            data: {
                housing_id: housingId,
                room_id: roomId,
            },
        });
    }
}

export async function reallocateBeneficiary(
    beneficiaryId: string,
    housingId: string,
    roomId: string,
    exitReason: string
): Promise<AxiosResponse> {
    try {
        console.log("🔄 Reallocating beneficiary via Supabase:", beneficiaryId, { housingId, roomId, exitReason });
        
        // Try Supabase first - update beneficiary housing allocation
        const { data: updatedData, error } = await (await apiClient.query('beneficiaries'))
            .update({
                current_housing_id: housingId,
                current_room_id: roomId,
                updated_at: new Date().toISOString()
            })
            .eq('id', beneficiaryId)
            .select()
            .single();
        
        if (error) throw error;
        
        // TODO: Create allocation history record with exit_reason
        // This would require a separate beneficiary_allocations table
        
        console.log("✅ Beneficiary reallocated successfully via Supabase");
        
        return {
            data: updatedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (supabaseError) {
        console.warn("Supabase reallocateBeneficiary failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/reallocate`,
            method: "POST",
            data: {
                housing_id: housingId,
                room_id: roomId,
                exit_reason: exitReason,
            },
        });
    }
}

export async function getDonationsByBeneficiaryId(
    beneficiaryId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: Donation[] }>> {
    try {
        console.log("🎁 Fetching donations via Supabase:", beneficiaryId, { offset, limit });
        
        // Try Supabase first - get donations with related data
        const { data, error, count } = await (await apiClient.query('donations'))
            .select(`
                *,
                beneficiary:beneficiaries(*),
                product_type:product_types(*)
            `, { count: 'exact' })
            .eq('beneficiary_id', beneficiaryId)
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("✅ Donations fetched successfully via Supabase:", { count, dataLength: data?.length });
        
        // Transform Supabase data to match legacy format
        const transformedData = data?.map(donation => ({
            id: donation.id,
            organization_id: donation.organization_id,
            beneficiary_id: donation.beneficiary_id,
            beneficiary: donation.beneficiary as any,
            from: {
                type: donation.from_type,
                name: donation.from_name || '',
                id: donation.from_id || ''
            },
            product_type_id: donation.product_type_id,
            product_type: donation.product_type as any,
            quantity: donation.quantity,
            created_at: donation.created_at || ''
        })) || [];
        
        return {
            data: { 
                count: count || 0, 
                data: transformedData 
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: Donation[] }>;
        
    } catch (supabaseError) {
        console.warn("Supabase getDonationsByBeneficiaryId failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/donations?offset=${offset}&limit=${limit}`,
            method: "GET",
        });
    }
}

export async function donateProductToBeneficiary(
    beneficiaryId: string,
    data: DonateProductToBeneficiaryRequest
): Promise<void> {
    try {
        console.log("🎁 Creating donation via Supabase:", beneficiaryId, data);
        
        // Get current user's organization ID
        const session = await apiClient.getSession();
        if (!session?.user) {
            throw new Error("User not authenticated");
        }
        
        // Get user's organization
        const { data: userData, error: userError } = await (await apiClient.query('users'))
            .select('organization_id')
            .eq('id', session.user.id)
            .single();
        
        if (userError) throw userError;
        
        // Try Supabase first - create donation
        const { error } = await (await apiClient.query('donations'))
            .insert({
                organization_id: userData.organization_id,
                beneficiary_id: beneficiaryId,
                from_type: data.from.type,
                from_id: data.from.id,
                product_type_id: data.product_type_id,
                quantity: data.quantity,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        console.log("✅ Donation created successfully via Supabase");
        
    } catch (supabaseError) {
        console.warn("Supabase donateProductToBeneficiary failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/donations`,
            method: "POST",
            data,
        });
    }
}

export async function getAllocationByBeneficiaryId(
    beneficiaryId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: BeneficiaryAllocationSchema[] }>> {
    try {
        console.log("📊 Fetching allocation history via Supabase:", beneficiaryId, { offset, limit });
        
        // Get current beneficiary data with housing relationships
        const { data: beneficiary, error } = await (await apiClient.query('beneficiaries'))
            .select(`
                id,
                current_housing_id,
                current_room_id,
                created_at,
                updated_at,
                current_housing:housing(id, name, address),
                current_room:housing_rooms(id, name, capacity)
            `)
            .eq('id', beneficiaryId)
            .single();
        
        if (error) throw error;
        
        // For now, create a simple allocation record based on current state
        // TODO: When proper allocation history table is available, query that instead
        const allocationData: BeneficiaryAllocationSchema[] = [];
        
        if (beneficiary.current_housing_id && beneficiary.current_room_id) {
            allocationData.push({
                id: `${beneficiaryId}-current`,
                beneficiary_id: beneficiaryId,
                old_housing: {} as any, // Would need proper history tracking
                old_housing_id: '',
                old_room: {} as any,
                old_room_id: '',
                housing: beneficiary.current_housing as any || {},
                housing_id: beneficiary.current_housing_id,
                room: beneficiary.current_room as any || {},
                room_id: beneficiary.current_room_id,
                type: 'ENTRANCE', // Assuming current allocation is entrance type
                auditor_id: '', // Would need to track who made the allocation
                created_at: beneficiary.updated_at || beneficiary.created_at || '',
                exit_date: '',
                exit_reason: ''
            });
        }
        
        console.log("✅ Allocation history fetched successfully via Supabase:", {
            count: allocationData.length,
            beneficiaryId
        });
        
        return {
            data: { 
                count: allocationData.length, 
                data: allocationData 
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: BeneficiaryAllocationSchema[] }>;
        
    } catch (supabaseError) {
        console.warn("Supabase getAllocationByBeneficiaryId failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/allocations?offset=${offset}&limit=${limit}`,
            method: "GET",
        });
    }
}

export async function updateBeneficiaryStatus(
    beneficiaryId: string,
    status: "ACTIVE" | "INACTIVE" | "PENDING" | "ARCHIVED"
): Promise<AxiosResponse> {
    try {
        console.log("📊 Updating beneficiary status via Supabase:", beneficiaryId, status);
        
        // Try Supabase first
        const { data: updatedData, error } = await (await apiClient.query('beneficiaries'))
            .update({
                status: status as any,
                updated_at: new Date().toISOString()
            })
            .eq('id', beneficiaryId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log("✅ Beneficiary status updated successfully via Supabase");
        
        return {
            data: updatedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (supabaseError) {
        console.warn("Supabase updateBeneficiaryStatus failed, using legacy:", supabaseError);
        
        // Fallback to legacy API
        return client.request({
            url: `${PREFIX}/${beneficiaryId}/status`,
            method: "PUT",
            data: { status },
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
