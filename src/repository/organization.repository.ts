import { client } from "@/lib/axios-client";
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
import { AxiosResponse } from "axios";
import { CaseSchema, CreateCasePayload, UpdateCasePayload } from "@/types/case.types";

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

export async function findUsersByOrganizationId(
    orgId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ data: UserSchema[]; count: number }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/users?offset=${offset}&limit=${limit}`,
        method: "GET",
    });
}

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

export async function findHousingsByOrganizationId(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: HousingSchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/housings?offset=${offset}&limit=${limit}&search=${search}`,
        method: "GET",
    });
}

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

export async function getVoluntariesByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: VoluntarySchema[] }>> {
    return client.request({
        url: `${PREFIX}/${orgId}/voluntary-people?offset=${offset}&limit=${limit}&search=${search}`,
        method: "GET",
    });
}

export async function createVolunteer(orgId: string, data: CreateVoluntaryRequest): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}/voluntary-people`,
        method: "POST",
        data,
    });
}

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

export async function getProductsByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<any>> {
    return client.request({
        url: `${PREFIX}/${orgId}/product-types?limit=${limit}&offset=${offset}&search=${search}`,
        method: "GET",
    });
}

export async function createProduct(orgId: string, data: CreateProductRequest): Promise<void> {
    return client.request({
        url: `${PREFIX}/${orgId}/product-types`,
        method: "POST",
        data,
    });
}

// Case Management API Functions
export async function getCasesByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: CaseSchema[] }>> {
    return client.request({
        url: `cases?organization_id=${orgId}&offset=${offset}&limit=${limit}&search=${search}`,
        method: "GET",
    });
}

export async function getCaseById(caseId: string): Promise<AxiosResponse<CaseSchema>> {
    return client.request({
        url: `cases/${caseId}`,
        method: "GET",
    });
}

export async function createCase(data: CreateCasePayload): Promise<AxiosResponse<CaseSchema>> {
    return client.request({
        url: `cases`,
        method: "POST",
        data,
    });
}

export async function updateCase(
    caseId: string,
    data: UpdateCasePayload
): Promise<AxiosResponse<CaseSchema>> {
    return client.request({
        url: `cases/${caseId}`,
        method: "PUT",
        data,
    });
}

export async function deleteCase(caseId: string): Promise<AxiosResponse> {
    return client.request({
        url: `cases/${caseId}`,
        method: "DELETE",
    });
}

export async function getCaseStats(orgId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📊 Fetching case stats for org:", orgId);
        const response = await client.request({
            url: `cases/stats?organization_id=${orgId}`,
            method: "GET",
        });
        console.log("✅ Case stats fetched successfully:", response.data);
        return response;
    } catch (error: any) {
        console.warn("📊 Case stats endpoint failed, using fallback data:", {
            error: error.message,
            status: error?.response?.status,
            orgId,
            url: `cases/stats?organization_id=${orgId}`
        });
        return {
            data: {
                total_cases: 0,
                open_cases: 0,
                overdue_cases: 0,
                closed_this_month: 0
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {}
        } as AxiosResponse<any>;
    }
}

// Enhanced Beneficiary Stats API Function with fallback
export async function getBeneficiaryStats(orgId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📊 Fetching beneficiary stats for org:", orgId);
        
        // Try the stats endpoint first
        try {
            const response = await client.request({
                url: `${PREFIX}/${orgId}/beneficiaries/stats`,
                method: "GET",
            });
            console.log("✅ Beneficiary stats fetched successfully:", response.data);
            return response;
        } catch (statsError: any) {
            console.warn("📊 Stats endpoint failed, calculating from data:", statsError.message);
            
            // Fallback: Get actual beneficiaries data and calculate stats
            const beneficiariesResponse = await getBeneficiariesByOrganizationID(orgId, 0, 9999, "");
            const beneficiaries = beneficiariesResponse.data.data || [];
            
            const stats = {
                total_beneficiaries: beneficiaries.length,
                active_beneficiaries: beneficiaries.filter(b => b.status === 'ACTIVE').length,
                pending_beneficiaries: beneficiaries.filter(b => b.status === 'PENDING').length,
                inactive_beneficiaries: beneficiaries.filter(b => b.status === 'INACTIVE').length,
            };
            
            console.log("✅ Calculated beneficiary stats from data:", stats);
            return {
                data: stats,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as AxiosResponse<any>;
        }
    } catch (error: any) {
        console.warn("📊 All beneficiary stats methods failed, using fallback data:", {
            error: error.message,
            status: error?.response?.status,
            orgId
        });
        return {
            data: {
                total_beneficiaries: 0,
                active_beneficiaries: 0,
                pending_beneficiaries: 0,
                inactive_beneficiaries: 0
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {}
        } as AxiosResponse<any>;
    }
}

// Enhanced Volunteer Stats API Function with fallback
export async function getVolunteerStats(orgId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📊 Fetching volunteer stats for org:", orgId);
        
        // Try the stats endpoint first
        try {
            const response = await client.request({
                url: `${PREFIX}/${orgId}/volunteers/stats`,
                method: "GET",
            });
            console.log("✅ Volunteer stats fetched successfully:", response.data);
            return response;
        } catch (statsError: any) {
            console.warn("📊 Volunteer stats endpoint failed, calculating from data:", statsError.message);
            
            // Fallback: Get actual volunteers data and calculate stats
            const volunteersResponse = await getVoluntariesByOrganizationID(orgId, 0, 9999, "");
            const volunteers = volunteersResponse.data.data || [];
            
            const stats = {
                total_volunteers: volunteers.length,
                active_volunteers: volunteers.filter(v => v.status === 'active').length,
                pending_volunteers: volunteers.filter(v => v.status === 'pending').length,
                inactive_volunteers: volunteers.filter(v => v.status === 'inactive').length,
            };
            
            console.log("✅ Calculated volunteer stats from data:", stats);
            return {
                data: stats,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as AxiosResponse<any>;
        }
    } catch (error: any) {
        console.warn("📊 All volunteer stats methods failed, using fallback data:", {
            error: error.message,
            status: error?.response?.status,
            orgId
        });
        return {
            data: {
                total_volunteers: 0,
                active_volunteers: 0,
                pending_volunteers: 0,
                inactive_volunteers: 0
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {}
        } as AxiosResponse<any>;
    }
}

// Enhanced Housing Stats API Function with fallback
export async function getHousingStats(orgId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📊 Fetching housing stats for org:", orgId);
        
        // Try the stats endpoint first
        try {
            const response = await client.request({
                url: `${PREFIX}/${orgId}/housings/stats`,
                method: "GET",
            });
            console.log("✅ Housing stats fetched successfully:", response.data);
            return response;
        } catch (statsError: any) {
            console.warn("📊 Housing stats endpoint failed, calculating from data:", statsError.message);
            
            // Fallback: Get actual housing data and calculate stats
            const housingResponse = await findHousingsByOrganizationId(orgId, 0, 9999, "");
            const housings = housingResponse.data.data || [];
            
            const stats = {
                total_housing: housings.length,
                available_housing: housings.filter(h => h.status === 'available').length,
                occupied_housing: housings.filter(h => h.status === 'occupied').length,
                maintenance_housing: housings.filter(h => h.status === 'maintenance').length,
            };
            
            console.log("✅ Calculated housing stats from data:", stats);
            return {
                data: stats,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as AxiosResponse<any>;
        }
    } catch (error: any) {
        console.warn("📊 All housing stats methods failed, using fallback data:", {
            error: error.message,
            status: error?.response?.status,
            orgId
        });
        return {
            data: {
                total_housing: 0,
                available_housing: 0,
                occupied_housing: 0,
                maintenance_housing: 0
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {}
        } as AxiosResponse<any>;
    }
}

// Enhanced Inventory Stats API Function with fallback
export async function getInventoryStats(orgId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📊 Fetching inventory stats for org:", orgId);
        
        // Try the stats endpoint first
        try {
            const response = await client.request({
                url: `${PREFIX}/${orgId}/inventory/stats`,
                method: "GET",
            });
            console.log("✅ Inventory stats fetched successfully:", response.data);
            return response;
        } catch (statsError: any) {
            console.warn("📊 Inventory stats endpoint failed, calculating from data:", statsError.message);
            
            // Fallback: Get actual products data and calculate stats
            const productsResponse = await getProductsByOrganizationID(orgId, 0, 9999, "");
            const products = productsResponse.data.data || [];
            
            const stats = {
                total_products: products.length,
                in_stock_products: products.filter((p: any) => p.total_in_storage > 10).length,
                low_stock_products: products.filter((p: any) => p.total_in_storage > 0 && p.total_in_storage <= 10).length,
                out_of_stock_products: products.filter((p: any) => p.total_in_storage === 0).length,
            };
            
            console.log("✅ Calculated inventory stats from data:", stats);
            return {
                data: stats,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as AxiosResponse<any>;
        }
    } catch (error: any) {
        console.warn("📊 All inventory stats methods failed, using fallback data:", {
            error: error.message,
            status: error?.response?.status,
            orgId
        });
        return {
            data: {
                total_products: 0,
                in_stock_products: 0,
                low_stock_products: 0,
                out_of_stock_products: 0
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {}
        } as AxiosResponse<any>;
    }
}

// Case Documents API Functions with better error handling
export async function getCaseDocuments(caseId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📄 Fetching documents for case:", caseId);
        const response = await client.request({
            url: `cases/${caseId}/documents`,
            method: "GET",
        });
        console.log("✅ Documents API response:", {
            status: response.status,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            length: Array.isArray(response.data) ? response.data.length : 'N/A',
            data: response.data
        });
        return response;
    } catch (error: any) {
        console.error("❌ Case documents endpoint failed:", {
            error: error.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            caseId,
            url: `cases/${caseId}/documents`
        });
        
        // Only return fallback for 404 (not found) - other errors should bubble up
        if (error?.response?.status === 404) {
            console.warn("📄 Documents not found for case, returning empty array");
            return {
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config || {}
            } as AxiosResponse<any>;
        }
        
        // For other errors, throw them so they can be properly handled
        throw error;
    }
}

// Step 1: Generate presigned upload URL
export async function generateCaseDocumentUploadLink(
    caseId: string,
    fileType: string
): Promise<AxiosResponse<{ link: string }>> {
    return client.request({
        url: `cases/${caseId}/documents/generate-upload-link`,
        method: "POST",
        data: {
            file_type: fileType,
        },
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// Step 3: Save document metadata after S3 upload
export async function createCaseDocument(
    caseId: string,
    data: {
        document_name: string;
        document_type: string;
        description: string;
        tags: string[];
        file_name: string;
        file_size: number;
        mime_type: string;
        file_key: string;
    }
): Promise<AxiosResponse<any>> {
    try {
        console.log("📤 Creating case document:", { caseId, data });
        const response = await client.request({
            url: `cases/${caseId}/documents`,
            method: "POST",
            data,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Case document created successfully:", response.data);
        return response;
    } catch (error: any) {
        console.error("❌ Error creating case document:", {
            error: error.message,
            status: error?.response?.status,
            data: error?.response?.data,
            caseId,
            documentData: data
        });
        throw error;
    }
}

// Update document metadata
export async function updateCaseDocument(
    caseId: string,
    documentId: string,
    data: {
        document_name?: string;
        document_type?: string;
        description?: string;
        tags?: string[];
        is_finalized?: boolean;
    }
): Promise<AxiosResponse<any>> {
    return client.request({
        url: `cases/${caseId}/documents/${documentId}`,
        method: "PUT",
        data,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// Delete document
export async function deleteCaseDocument(
    caseId: string,
    documentId: string
): Promise<AxiosResponse> {
    return client.request({
        url: `cases/${caseId}/documents/${documentId}`,
        method: "DELETE",
    });
}

// Helper function to extract file key from S3 URL
export function extractFileKeyFromS3Url(presignedUrl: string): string {
    const url = new URL(presignedUrl);
    return url.pathname.substring(1); // Remove leading slash
}

// Case Notes API Functions with better error handling
export async function getCaseNotes(caseId: string): Promise<AxiosResponse<any>> {
    try {
        console.log("📝 Fetching notes for case:", caseId);
        const response = await client.request({
            url: `cases/${caseId}/notes`,
            method: "GET",
        });
        console.log("✅ Notes API response:", {
            status: response.status,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            length: Array.isArray(response.data) ? response.data.length : 'N/A',
            data: response.data
        });
        return response;
    } catch (error: any) {
        console.error("❌ Case notes endpoint failed:", {
            error: error.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            caseId,
            url: `cases/${caseId}/notes`
        });
        
        // Only return fallback for 404 (not found) - other errors should bubble up
        if (error?.response?.status === 404) {
            console.warn("📝 Notes not found for case, returning empty array");
            return {
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config || {}
            } as AxiosResponse<any>;
        }
        
        // For other errors, throw them so they can be properly handled
        throw error;
    }
}

export async function createCaseNote(caseId: string, data: any): Promise<AxiosResponse<any>> {
    try {
        console.log("📝 Creating case note:", { caseId, data });
        const response = await client.request({
            url: `cases/${caseId}/notes`,
            method: "POST",
            data,
        });
        console.log("✅ Case note created successfully:", response.data);
        return response;
    } catch (error: any) {
        console.error("❌ Error creating case note:", {
            error: error.message,
            status: error?.response?.status,
            data: error?.response?.data,
            caseId,
            noteData: data
        });
        throw error;
    }
}

export async function updateCaseNote(
    caseId: string,
    noteId: string,
    data: any
): Promise<AxiosResponse<any>> {
    return client.request({
        url: `cases/${caseId}/notes/${noteId}`,
        method: "PUT",
        data,
    });
}

export async function deleteCaseNote(caseId: string, noteId: string): Promise<AxiosResponse> {
    return client.request({
        url: `cases/${caseId}/notes/${noteId}`,
        method: "DELETE",
    });
}
