import { client } from "@/lib/axios-client";
import { apiClient } from "@/lib/supabase-client";
import { BeneficiarySchema, CreateBeneficiaryRequest } from "@/types/beneficiary.types";
import { HousingSchema } from "@/types/housing.types";
import {
    CreateOrganizationRequest,
    OrganizationDataAccessRequestSchema,
    OrganizationDataAccessSchema,
    OrganizationSchema,
    UpdateOrganizationRequest,
} from "@/types/organization.types";
import { CreateProductRequest } from "@/types/product.types";
import {
    JoinOrganizationInviteSchema,
    JoinOrganizationRequestSchema,
    UpdateOrganizationTypeRequestSchema,
} from "@/types/requests.types";
import { UserSchema } from "@/types/user.types";
import { CreateVoluntaryRequest, VoluntarySchema } from "@/types/voluntary.types";
import type { AxiosResponse } from "axios";

const PREFIX = "organizations";

export async function createOrganization(
    data: CreateOrganizationRequest
): Promise<AxiosResponse<OrganizationSchema>> {
    return client.request({
        url: `${PREFIX}`,
        method: "POST",
        data,
    });
}

export async function findOrganizationByID(
    orgId: string
): Promise<AxiosResponse<OrganizationSchema>> {
    return client.request({
        url: `${PREFIX}/${orgId}`,
        method: "GET",
    });
}

export async function updateOrganization(
    orgId: string,
    data: UpdateOrganizationRequest
): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}`,
        method: "PUT",
        data,
    });
}

export async function findAllOrganizations(
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: OrganizationSchema[] }>> {
    return client.request({
        url: `${PREFIX}?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

// User Management API Functions - Re-exported from user repository
export {
    findUsersByOrganizationId
} from './user.repository';

export async function findJoinInvitesByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: JoinOrganizationInviteSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/join-invites?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

export async function findJoinRequestsByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: JoinOrganizationRequestSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/join-requests?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

export async function findDataAccessRequestsByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: OrganizationDataAccessRequestSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/targeted-data-access-requests?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

export async function findUpdateOrganizationTypeRequestsByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: UpdateOrganizationTypeRequestSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/update-organization-type-requests?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

// Housing Management API Functions - Re-exported from housing repository
export {
    findHousingsByOrganizationId,
    getHousingStats
} from './housing.repository';

export async function findJoinPlatformInvitesByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: OrganizationDataAccessSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/join-platform-invites?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

export async function getBeneficiariesByOrganizationID(
    organizationId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: BeneficiarySchema[] }>> {
    return client.request({
        url: `${PREFIX}/${organizationId}/beneficiaries?offset=${offset}&limit=${limit}&search=${search}`,
        method: "GET",
    });
}

export async function createBeneficiary(
    organizationId: string,
    data: CreateBeneficiaryRequest
): Promise<AxiosResponse<BeneficiarySchema>> {
    return client.request({
        url: `${PREFIX}/${organizationId}/beneficiaries`,
        method: "POST",
        data,
    });
}

// Volunteer Management API Functions - Re-exported from volunteer repository
export {
    getVoluntariesByOrganizationID,
    createVolunteer,
    getVolunteerStats
} from './volunteer.repository';

export async function createJoinOrganizationRequest(orgId: string): Promise<AxiosResponse> {
    return client.request({
        url: `${PREFIX}/${orgId}/join-organization-requests`,
        method: "POST",
    });
}

export async function createDataAccessRequest(orgId: string): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}/request-organization-data-access`,
        method: "POST",
    });
}

export async function getDataAccessGrants(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: OrganizationSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/data-access-grants?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

export async function desativateOrganization(orgId: string): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}`,
        method: "DELETE",
    });
}

export async function reactivateOrganization(orgId: string): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}/reactivate`,
        method: "PUT",
    });
}

// Inventory Management API Functions - Re-exported from inventory repository
export {
    getProductsByOrganizationID,
    createProduct,
    getInventoryStats
} from './inventory.repository';

// Case Management API Functions - Re-exported from case repository
export {
    getCasesByOrganizationID,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    getCaseStats,
    getCaseNotes,
    createCaseNote,
    updateCaseNote,
    deleteCaseNote,
    getCaseDocuments,
    generateCaseDocumentUploadLink,
    generateCaseDocumentDownloadLink,
    createCaseDocument,
    updateCaseDocument,
    deleteCaseDocument,
    extractFileKeyFromS3Url
} from './case.repository';



export async function getBeneficiaryStats(orgId: string): Promise<any> {
    try {
        console.log("📊 Fetching beneficiary stats for org:", orgId);
        const response = await client.request({
            url: `${PREFIX}/${orgId}/beneficiaries/stats`,
            method: "GET",
        });
        console.log("✅ Beneficiary stats fetched successfully:", response.data);
        return response.data;
    } catch (statsError: any) {
        console.warn("📊 Beneficiary stats endpoint failed, calculating from data:", statsError.message);
        try {
            const beneficiariesResponse = await getBeneficiariesByOrganizationID(orgId, 0, 9999, "");
            const beneficiaries = beneficiariesResponse.data?.data || [];
            
            const stats = {
                total_beneficiaries: beneficiaries.length,
                active_beneficiaries: beneficiaries.filter((b: any) => b.status === 'ACTIVE').length,
                pending_beneficiaries: beneficiaries.filter((b: any) => b.status === 'PENDING').length,
                inactive_beneficiaries: beneficiaries.filter((b: any) => b.status === 'INACTIVE').length,
            };
            
            console.log("✅ Calculated beneficiary stats from data:", stats);
            return stats;
        } catch (fallbackError: any) {
            console.error("📊 Fallback for beneficiary stats failed:", fallbackError.message);
            return {
                total_beneficiaries: 0, active_beneficiaries: 0, pending_beneficiaries: 0, inactive_beneficiaries: 0
            };
        }
    }
}








