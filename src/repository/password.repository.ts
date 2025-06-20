import { apiClient } from "@/lib/supabase-client";

const PREFIX = "password";

export async function requestPasswordChange(email: string): Promise<void> {
    console.log("🔐 Sending password reset email via Supabase:", email);
    await apiClient.resetPassword(email);
    console.log("✅ Password reset email sent successfully via Supabase");
}

export async function updateUserPassword(password: string): Promise<void> {
    console.log("🔐 Recovering password via Supabase");
    await apiClient.updatePassword(password);
    console.log("✅ Password recovered successfully via Supabase");
}
