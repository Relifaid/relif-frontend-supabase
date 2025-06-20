import { apiClient } from "@/lib/supabase-client";
import { AxiosResponse } from "axios";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function createAdminInvite(invitedEmail: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('platform_admin_invites'))
        .insert({ email: invitedEmail, status: 'PENDING' });

    if (error) throw error;
    return toAxiosResponse(undefined);
}
