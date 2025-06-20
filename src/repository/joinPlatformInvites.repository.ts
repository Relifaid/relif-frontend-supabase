import { apiClient } from "@/lib/supabase-client";
import { JoinPlatformInviteSchema } from "@/types/requests.types";
import { AxiosResponse } from "axios";

const PREFIX = "join-platform-invites";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function findJoinPlatformInvitesByOrganizationId(
    orgId: string
): Promise<AxiosResponse<JoinPlatformInviteSchema[]>> {
    const { data, error } = await (await apiClient.query('platform_invites'))
        .select('*')
        .eq('organization_id', orgId);

    if (error) throw error;
    return toAxiosResponse(data || []);
}

export async function acceptJoinPlatformInvite(
    inviteId: string
): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('platform_invites'))
        .update({ status: 'ACCEPTED' })
        .eq('id', inviteId);

    if (error) throw error;
    return toAxiosResponse(undefined);
}
