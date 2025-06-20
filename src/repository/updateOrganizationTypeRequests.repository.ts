import { apiClient } from "@/lib/supabase-client";
import { UpdateOrganizationTypeRequestSchema } from "@/types/requests.types";
import { AxiosResponse } from "axios";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function findUpdateOrganizationTypeRequests(
    orgId: string
): Promise<AxiosResponse<UpdateOrganizationTypeRequestSchema[]>> {
    const { data, error } = await (await apiClient.query('update_organization_type_requests'))
        .select('*, organization:organizations(*), requested_by:users(*)')
        .eq('organization_id', orgId);

    if (error) throw error;
    return toAxiosResponse(data || []);
}

export async function acceptRequest(requestId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('update_organization_type_requests'))
        .update({ status: 'APPROVED' })
        .eq('id', requestId);

    if (error) throw error;
    return toAxiosResponse(undefined);
}

export async function rejectRequest(requestId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('update_organization_type_requests'))
        .update({ status: 'REJECTED' })
        .eq('id', requestId);

    if (error) throw error;
    return toAxiosResponse(undefined);
}

export async function createRequest(
    orgId: string,
    newType: string
): Promise<AxiosResponse<void>> {
    const user = await apiClient.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await (await apiClient.query('update_organization_type_requests'))
        .insert({
            organization_id: orgId,
            requested_by_id: user.id,
            new_type: newType,
            status: 'PENDING'
        });

    if (error) throw error;
    return toAxiosResponse(undefined);
}
