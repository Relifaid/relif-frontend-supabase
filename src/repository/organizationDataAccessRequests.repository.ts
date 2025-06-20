import { apiClient } from "@/lib/supabase-client";
import { OrganizationDataAccessRequestSchema } from "@/types/organization.types";
import { AxiosResponse } from "axios";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function findDataAccessRequests(
    targetOrgId: string
): Promise<AxiosResponse<OrganizationDataAccessRequestSchema[]>> {
    const { data, error } = await (await apiClient.query('organization_data_access_requests'))
        .select('*, requesting_organization:organizations!requesting_organization_id(*)')
        .eq('target_organization_id', targetOrgId);
        
    if (error) throw error;
    return toAxiosResponse(data || []);
}

export async function acceptDataAccessRequest(requestId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('organization_data_access_requests'))
        .update({ status: 'GRANTED' })
        .eq('id', requestId);
        
    if (error) throw error;
    return toAxiosResponse(undefined);
}

export async function rejectDataAccessRequest(requestId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('organization_data_access_requests'))
        .update({ status: 'REJECTED' })
        .eq('id', requestId);
        
    if (error) throw error;
    return toAxiosResponse(undefined);
}
