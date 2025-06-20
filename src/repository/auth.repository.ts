import { apiClient } from "@/lib/supabase-client";
import {
    SignUpAdminByInviteRequest,
    SignUpByInviteRequest,
    SignUpRequest,
} from "@/types/auth.types";
import { UserSchema } from "@/types/user.types";
import { AxiosResponse } from "axios";
import { User, Session } from "@supabase/supabase-js";

const PREFIX = "auth";

export async function signIn(email: string, password: string): Promise<{user: User, session: Session}> {
    // Use Supabase authentication (no fallback)
    const { user, session } = await apiClient.signIn(email, password);
    
    if (!user || !session) throw new Error("Authentication failed - no user or session received");

    // Store token for compatibility
    localStorage.setItem("r_to", session.access_token);
    return { user, session };
}

export async function signOut(): Promise<void> {
    // Use Supabase sign out (no fallback)
    await apiClient.signOut();
    // Clear token
    localStorage.removeItem("r_to");
}

export async function signUp(data: SignUpRequest): Promise<string> {
    // Use Supabase sign up (no fallback)
    const signUpData = data as any;
    const { user, session } = await apiClient.signUp(signUpData.email, signUpData.password, {
        data: {
            first_name: signUpData.first_name,
            last_name: signUpData.last_name,
            phones: signUpData.phones,
            role: signUpData.role,
            preferences: signUpData.preferences,
        }
    });
    
    if (session?.access_token) {
        localStorage.setItem("r_to", session.access_token);
        return session.access_token;
    }
    
    throw new Error("Sign up failed - no session token received");
}

export async function orgSignUp(data: SignUpByInviteRequest): Promise<string> {
    // For organization sign up, call custom Edge Function
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
    
    throw new Error("Organization sign up failed - no session token received");
}

export async function adminSignUp(data: SignUpAdminByInviteRequest): Promise<string> {
    // For admin sign up, call custom Edge Function
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
    
    throw new Error("Admin sign up failed - no session token received");
}

export async function getMe(): Promise<AxiosResponse<UserSchema>> {
    // Use Supabase user (no fallback)
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
}
