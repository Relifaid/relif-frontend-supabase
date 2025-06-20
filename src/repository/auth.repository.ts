import { client } from "@/lib/axios-client";
import { apiClient } from "@/lib/supabase-client";
import {
    SignUpAdminByInviteRequest,
    SignUpByInviteRequest,
    SignUpRequest,
} from "@/types/auth.types";
import { UserSchema } from "@/types/user.types";
import { AxiosResponse } from "axios";

const PREFIX = "auth";

export async function signIn(email: string, password: string): Promise<string> {
    try {
        // Try Supabase authentication first
        const { user, session } = await apiClient.signIn(email, password);
        
        if (session?.access_token) {
            // Store token for legacy compatibility
            localStorage.setItem("r_to", session.access_token);
            return session.access_token;
        }
        
        throw new Error("No session token received");
    } catch (supabaseError) {
        console.warn("Supabase auth failed, trying legacy:", supabaseError);
        
        // Fallback to legacy authentication
        const { headers } = await client.request({
            url: `${PREFIX}/sign-in`,
            method: "POST",
            data: { email, password },
        });

        return headers.token;
    }
}

export async function signOut(): Promise<void> {
    try {
        // Try Supabase sign out first
        await apiClient.signOut();
        // Clear legacy token
        localStorage.removeItem("r_to");
    } catch (supabaseError) {
        console.warn("Supabase sign out failed, trying legacy:", supabaseError);
        
        // Fallback to legacy sign out
        await client.request({
            url: `${PREFIX}/sign-out`,
            method: "DELETE",
        });
    }
}

export async function signUp(data: SignUpRequest): Promise<string> {
    try {
        // Try Supabase sign up first
        // Cast data to any to work around type issues with CreateUserRequest
        const signUpData = data as any;
        const { user, session } = await apiClient.signUp(signUpData.email, signUpData.password, {
            data: {
                first_name: signUpData.first_name,
                last_name: signUpData.last_name,
                phones: signUpData.phones,
                role: signUpData.role,
                preferences: signUpData.preferences,
                // Add other user metadata as needed
            }
        });
        
        if (session?.access_token) {
            localStorage.setItem("r_to", session.access_token);
            return session.access_token;
        }
        
        throw new Error("No session token received");
    } catch (supabaseError) {
        console.warn("Supabase sign up failed, trying legacy:", supabaseError);
        
        // Fallback to legacy sign up
        const { headers } = await client.request({
            url: `${PREFIX}/sign-up`,
            method: "POST",
            data: { ...data },
        });

        return headers.token;
    }
}

export async function orgSignUp(data: SignUpByInviteRequest): Promise<string> {
    try {
        // For organization sign up, we might need to call a custom Edge Function
        const result = await apiClient.callEdgeFunction('auth', {
            method: 'POST',
            body: {
                action: 'org-sign-up',
                ...data
            }
        });
        
        if (result.session?.access_token) {
            localStorage.setItem("r_to", result.session.access_token);
            return result.session.access_token;
        }
        
        throw new Error("No session token received");
    } catch (supabaseError) {
        console.warn("Supabase org sign up failed, trying legacy:", supabaseError);
        
        // Fallback to legacy
        const { headers } = await client.request({
            url: `${PREFIX}/org-sign-up`,
            method: "POST",
            data,
        });

        return headers.token;
    }
}

export async function adminSignUp(data: SignUpAdminByInviteRequest): Promise<string> {
    try {
        // For admin sign up, we might need to call a custom Edge Function
        const result = await apiClient.callEdgeFunction('auth', {
            method: 'POST',
            body: {
                action: 'admin-sign-up',
                ...data
            }
        });
        
        if (result.session?.access_token) {
            localStorage.setItem("r_to", result.session.access_token);
            return result.session.access_token;
        }
        
        throw new Error("No session token received");
    } catch (supabaseError) {
        console.warn("Supabase admin sign up failed, trying legacy:", supabaseError);
        
        // Fallback to legacy
        const { headers } = await client.request({
            url: `${PREFIX}/admin-sign-up`,
            method: "POST",
            data,
        });

        return headers.token;
    }
}

export async function getMe(): Promise<AxiosResponse<UserSchema>> {
    try {
        // Try Supabase user first
        const user = await apiClient.getUser();
        
        if (user) {
            // Transform Supabase user to match your UserSchema
            const userData: UserSchema = {
                id: user.id,
                email: user.email || '',
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                phones: user.user_metadata?.phones || [],
                role: user.user_metadata?.role || '',
                platform_role: "ORG_MEMBER", // You might need to determine this from user metadata
                status: "active", // Default status
                preferences: user.user_metadata?.preferences || { language: "en", timezone: "UTC" },
                created_at: user.created_at || '',
                updated_at: user.updated_at || '',
                organization_id: user.user_metadata?.organization_id || null,
                organization: user.user_metadata?.organization || {} as any,
                // You might need to fetch additional user data from your users table
            };
            
            // Return in the same format as axios response
            return {
                data: userData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as AxiosResponse<UserSchema>;
        }
        
        throw new Error("No user found");
    } catch (supabaseError) {
        console.warn("Supabase getMe failed, trying legacy:", supabaseError);
        
        // Fallback to legacy
        return client.request({
            url: `${PREFIX}/me`,
            method: "GET",
        });
    }
}
