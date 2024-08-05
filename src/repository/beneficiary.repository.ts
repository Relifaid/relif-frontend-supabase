import { client } from "@/lib/axios-client";
import {
    BeneficiaryAllocationSchema,
    BeneficiarySchema,
    UpdateBeneficiaryRequest,
} from "@/types/beneficiary.types";
import { AxiosResponse } from "axios";

const PREFIX = "beneficiaries";

export async function getBeneficiaryById(
    beneficiaryId: string
): Promise<AxiosResponse<BeneficiarySchema>> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}`,
        method: "GET",
    });
}

export async function updateBeneficiary(
    beneficiaryId: string,
    data: UpdateBeneficiaryRequest
): Promise<AxiosResponse> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}`,
        method: "PUT",
        data,
    });
}

export async function deleteBeneficiary(beneficiaryId: string): Promise<AxiosResponse> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}`,
        method: "DELETE",
    });
}

export async function allocateBeneficiary(
    beneficiaryId: string,
    housingId: string,
    roomId: string
): Promise<AxiosResponse> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}/allocate`,
        method: "POST",
        data: {
            housing_id: housingId,
            room_id: roomId,
        },
    });
}

export async function reallocateBeneficiary(
    beneficiaryId: string,
    housingId: string,
    roomId: string
): Promise<AxiosResponse> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}/reallocate`,
        method: "POST",
        data: {
            housing_id: housingId,
            room_id: roomId,
        },
    });
}

export async function getAllocationByBeneficiaryId(
    beneficiaryId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: BeneficiaryAllocationSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${beneficiaryId}/allocations?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}
