import { apiClient } from "@/lib/supabase-client";
import { JoinOrganizationInviteSchema } from "@/types/requests.types";
import { AxiosResponse } from "axios";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function createOrganizationInvite(
    orgId: string,
    invitedEmail: string,
    role: string
): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('organization_invites'))
        .insert({
            organization_id: orgId,
            email: invitedEmail,
            role: role,
            status: 'PENDING'
        });

    if (error) throw error;
    return toAxiosResponse(undefined);
}

export async function findOrganizationInvites(
    orgId: string
): Promise<AxiosResponse<JoinOrganizationInviteSchema[]>> {
    const { data, error } = await (await apiClient.query('organization_invites'))
        .select('*')
        .eq('organization_id', orgId);

    if (error) throw error;
    return toAxiosResponse(data || []);
}

export async function cancelOrganizationInvite(inviteId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('organization_invites'))
        .update({ status: 'CANCELED' })
        .eq('id', inviteId);

    if (error) throw error;
    return toAxiosResponse(undefined);
}
