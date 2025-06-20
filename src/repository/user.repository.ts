import { supabase } from "@/config/supabase";
import { UpdateUserRequest, UserSchema } from "@/types/user.types";
import { AxiosResponse } from "axios";
import { OrganizationSchema } from "@/types/organization.types";

// Helper function to transform database user to UserSchema
function transformUser(dbUser: any): UserSchema {
    return {
        id: dbUser.id,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        email: dbUser.email,
        phones: dbUser.phones || [],
        role: dbUser.role || '',
        platform_role: dbUser.platform_role || 'NO_ORG',
        status: dbUser.status || 'ACTIVE',
        preferences: dbUser.preferences || { language: 'en', timezone: 'UTC' },
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        organization_id: dbUser.organization_id,
        organization: dbUser.organizations || {} as OrganizationSchema
    };
}

// Organization-level user functions (moved from organization.repository.ts)
export async function findUsersByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ data: UserSchema[]; count: number }>> {
    try {
        console.log("👥 Fetching users for organization:", orgId, { offset, limit });
        
        const { data, error, count } = await supabase
            .from('users')
            .select(`
                *,
                organizations:organization_id(*)
            `, { count: 'exact' })
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformUser) || [];
        
        console.log("✅ Organization users fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { data: transformedData, count: count || 0 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ data: UserSchema[]; count: number }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching organization users:", {
            error: error.message,
            orgId,
            offset,
            limit
        });
        throw error;
    }
}

// Platform-level user functions
export async function getRelifUsers(
    offset: number,
    limit: number
): Promise<AxiosResponse<{ data: UserSchema[]; count: number }>> {
    try {
        console.log("🏢 Fetching Relif platform users:", { offset, limit });
        
        const { data, error, count } = await supabase
            .from('users')
            .select(`
                *,
                organizations:organization_id(*)
            `, { count: 'exact' })
            .eq('platform_role', 'RELIF_MEMBER')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformUser) || [];
        
        console.log("✅ Relif users fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { data: transformedData, count: count || 0 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ data: UserSchema[]; count: number }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching Relif users:", {
            error: error.message,
            offset,
            limit
        });
        throw error;
    }
}

// Individual user CRUD functions
export async function findUser(userId: string): Promise<AxiosResponse<UserSchema>> {
    try {
        console.log("👤 Fetching user by ID:", userId);
        
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedUser = transformUser(data);
        
        console.log("✅ User fetched successfully:", transformedUser);
        return {
            data: transformedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<UserSchema>;
        
    } catch (error: any) {
        console.error("❌ Error fetching user:", {
            error: error.message,
            userId
        });
        throw error;
    }
}

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<AxiosResponse<UserSchema>> {
    try {
        console.log("📝 Updating user:", userId, "with data:", data);
        
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phones: data.phones,
                role: data.role,
                platform_role: data.platform_role,
                preferences: data.preferences
            })
            .eq('id', userId)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedUser = transformUser(updatedUser);
        
        console.log("✅ User updated successfully:", transformedUser);
        return {
            data: transformedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<UserSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating user:", {
            error: error.message,
            userId,
            updateData: data
        });
        throw error;
    }
}

export async function reactiveUser(userId: string): Promise<AxiosResponse<UserSchema>> {
    try {
        console.log("🔄 Reactivating user:", userId);
        
        const { data: reactivatedUser, error } = await supabase
            .from('users')
            .update({ status: 'ACTIVE' })
            .eq('id', userId)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedUser = transformUser(reactivatedUser);
        
        console.log("✅ User reactivated successfully:", transformedUser);
        return {
            data: transformedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<UserSchema>;
        
    } catch (error: any) {
        console.error("❌ Error reactivating user:", {
            error: error.message,
            userId
        });
        throw error;
    }
}

export async function deleteUser(userId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting user:", userId);
        
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ User deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting user:", {
            error: error.message,
            userId
        });
        throw error;
    }
}

// User status management functions
export async function updateUserStatus(
    userId: string, 
    status: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED'
): Promise<AxiosResponse<UserSchema>> {
    try {
        console.log("🔄 Updating user status:", userId, "to:", status);
        
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedUser = transformUser(updatedUser);
        
        console.log("✅ User status updated successfully:", transformedUser);
        return {
            data: transformedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<UserSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating user status:", {
            error: error.message,
            userId,
            status
        });
        throw error;
    }
}

// User role management functions
export async function updateUserPlatformRole(
    userId: string,
    platformRole: 'ORG_MEMBER' | 'ORG_ADMIN' | 'NO_ORG' | 'RELIF_MEMBER'
): Promise<AxiosResponse<UserSchema>> {
    try {
        console.log("🎭 Updating user platform role:", userId, "to:", platformRole);
        
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ platform_role: platformRole })
            .eq('id', userId)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedUser = transformUser(updatedUser);
        
        console.log("✅ User platform role updated successfully:", transformedUser);
        return {
            data: transformedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<UserSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating user platform role:", {
            error: error.message,
            userId,
            platformRole
        });
        throw error;
    }
}

// User search and filtering functions
export async function searchUsers(
    searchTerm: string,
    organizationId?: string,
    platformRole?: string,
    offset: number = 0,
    limit: number = 20
): Promise<AxiosResponse<{ data: UserSchema[]; count: number }>> {
    try {
        console.log("🔍 Searching users:", { searchTerm, organizationId, platformRole, offset, limit });
        
        let query = supabase
            .from('users')
            .select(`
                *,
                organizations:organization_id(*)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        // Apply search filter
        if (searchTerm) {
            query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        // Apply organization filter
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        
        // Apply platform role filter
        if (platformRole) {
            query = query.eq('platform_role', platformRole);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformUser) || [];
        
        console.log("✅ User search completed successfully:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { data: transformedData, count: count || 0 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ data: UserSchema[]; count: number }>;
        
    } catch (error: any) {
        console.error("❌ Error searching users:", {
            error: error.message,
            searchTerm,
            organizationId,
            platformRole
        });
        throw error;
    }
}
