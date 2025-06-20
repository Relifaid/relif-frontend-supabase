import { apiClient } from "@/lib/supabase-client";
import { BeneficiaryAllocationSchema, BeneficiarySchema } from "@/types/beneficiary.types";
import { CreateSpaceRequest, SpaceSchema, UpdateSpaceRequest } from "@/types/space.types";
import { AxiosResponse } from "axios";

const PREFIX = "housing-rooms";

async function toAxiosResponse<T>(data: T): Promise<AxiosResponse<T>> {
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

export async function getSpaceById(spaceId: string): Promise<AxiosResponse<SpaceSchema>> {
    const { data, error } = await (await apiClient.query('housing_rooms'))
        .select('*')
        .eq('id', spaceId)
        .single();
    if (error) throw error;
    return toAxiosResponse(data);
}

export async function createSpace(housingId: string, spaceData: CreateSpaceRequest): Promise<AxiosResponse<SpaceSchema>> {
    const { data, error } = await (await apiClient.query('housing_rooms'))
        .insert({ housing_id: housingId, ...spaceData })
        .select()
        .single();
    if (error) throw error;
    return toAxiosResponse(data);
}

export async function updateSpace(spaceId: string, spaceData: UpdateSpaceRequest): Promise<AxiosResponse<SpaceSchema>> {
    const { data, error } = await (await apiClient.query('housing_rooms'))
        .update(spaceData)
        .eq('id', spaceId)
        .select()
        .single();
    if (error) throw error;
    return toAxiosResponse(data);
}

export async function deleteSpace(spaceId: string): Promise<AxiosResponse<void>> {
    const { error } = await (await apiClient.query('housing_rooms'))
        .delete()
        .eq('id', spaceId);
    if (error) throw error;
    return toAxiosResponse(undefined);
}

export async function getBeneficiariesBySpaceId(
    spaceId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: BeneficiarySchema[] }>> {
    const { data, error, count } = await (await apiClient.query('beneficiaries'))
        .select('*', { count: 'exact' })
        .eq('current_room_id', spaceId)
        .range(offset, offset + limit - 1);
        
    if (error) throw error;
    
    return toAxiosResponse({ count: count || 0, data: data || [] });
}

export async function getAllocationsBySpaceId(spaceId: string): Promise<AxiosResponse<BeneficiaryAllocationSchema[]>> {
    const { data, error } = await (await apiClient.query('beneficiary_allocations'))
        .select('*, beneficiary:beneficiaries(*), housing:housing(*), room:housing_rooms!inner(*), old_housing:housing!old_housing_id(*), old_room:housing_rooms!old_room_id(*)')
        .or(`room_id.eq.${spaceId},old_room_id.eq.${spaceId}`);

    if (error) throw error;
    
    return toAxiosResponse(data || []);
}
