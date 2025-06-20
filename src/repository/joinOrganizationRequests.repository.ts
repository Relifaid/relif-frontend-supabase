import { apiClient } from "@/lib/supabase-client";
import { JoinOrganizationRequestSchema } from "@/types/requests.types";
import { AxiosResponse } from "axios";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function findOrganizationRequests(
    orgId: string
): Promise<AxiosResponse<JoinOrganizationRequestSchema[]>> {
    const { data, error } = await (await apiClient.query('organization_join_requests'))
        .select('*, user:users(*)')
        .eq('organization_id', orgId);

    if (error) throw error;
    return toAxiosResponse(data || []);
}

export async function acceptJoinRequest(requestId: string): Promise<AxiosResponse<void>> {
    // This would likely be a call to an edge function to handle the logic
    // of adding a user to an organization, updating their role, and deleting the request.
    await apiClient.callEdgeFunction('accept-join-request', {
        method: 'POST',
        body: { requestId }
    });
    return toAxiosResponse(undefined);
}

export async function rejectJoinRequest(requestId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('organization_join_requests'))
        .update({ status: 'REJECTED' })
        .eq('id', requestId);

    if (error) throw error;
    return toAxiosResponse(undefined);
}
