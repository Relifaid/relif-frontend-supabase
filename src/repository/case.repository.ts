import { supabase } from "@/config/supabase";
import { CaseSchema, CreateCasePayload, UpdateCasePayload, CaseStatsSchema, CaseNoteSchema, CaseDocumentSchema, CreateCaseNotePayload } from "@/types/case.types";
import type { AxiosResponse } from "axios";

// Helper function to transform database case to CaseSchema
function transformCase(dbCase: any): CaseSchema {
    return {
        id: dbCase.id,
        case_number: dbCase.case_number,
        title: dbCase.title,
        description: dbCase.description || "",
        status: dbCase.status,
        priority: dbCase.priority,
        urgency_level: dbCase.urgency_level,
        service_types: dbCase.service_types || [],
        beneficiary_id: dbCase.beneficiary_id,
        beneficiary: dbCase.beneficiaries ? {
            id: dbCase.beneficiaries.id,
            first_name: dbCase.beneficiaries.full_name?.split(' ')[0] || '',
            last_name: dbCase.beneficiaries.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: dbCase.beneficiaries.full_name || '',
            phone: dbCase.beneficiaries.phones?.[0],
            email: dbCase.beneficiaries.email,
            current_address: dbCase.beneficiaries.address?.street || '',
            image_url: dbCase.beneficiaries.image_url
        } : {
            id: dbCase.beneficiary_id,
            first_name: '',
            last_name: '',
            full_name: '',
        },
        assigned_to_id: dbCase.assigned_to_id,
        assigned_to: dbCase.assigned_to ? {
            id: dbCase.assigned_to.id,
            first_name: dbCase.assigned_to.first_name,
            last_name: dbCase.assigned_to.last_name,
            email: dbCase.assigned_to.email
        } : {
            id: dbCase.assigned_to_id || '',
            first_name: '',
            last_name: '',
            email: ''
        },
        due_date: dbCase.due_date,
        estimated_duration: dbCase.estimated_duration,
        budget_allocated: dbCase.budget_allocated?.toString(),
        tags: dbCase.tags || [],
        notes_count: dbCase.notes_count || 0,
        documents_count: dbCase.documents_count || 0,
        last_activity: dbCase.last_activity || dbCase.updated_at,
        created_at: dbCase.created_at,
        updated_at: dbCase.updated_at
    };
}

// Helper function to transform database case note to CaseNoteSchema
function transformCaseNote(dbNote: any): CaseNoteSchema {
    return {
        id: dbNote.id,
        case_id: dbNote.case_id,
        title: dbNote.title || 'Note',
        content: dbNote.content,
        tags: dbNote.tags || [],
        note_type: dbNote.note_type || 'UPDATE',
        is_important: dbNote.is_important || false,
        created_by: dbNote.users ? {
            id: dbNote.users.id,
            name: `${dbNote.users.first_name} ${dbNote.users.last_name}`.trim()
        } : {
            id: dbNote.author_id,
            name: 'Unknown User'
        },
        created_at: dbNote.created_at,
        updated_at: dbNote.updated_at
    };
}

// Helper function to transform database case document to CaseDocumentSchema
function transformCaseDocument(dbDoc: any): CaseDocumentSchema {
    return {
        id: dbDoc.id,
        case_id: dbDoc.case_id,
        document_name: dbDoc.document_name || dbDoc.file_name,
        file_name: dbDoc.file_name,
        document_type: dbDoc.document_type || 'OTHER',
        file_size: dbDoc.file_size || 0,
        mime_type: dbDoc.file_type || 'application/octet-stream',
        description: dbDoc.description || '',
        tags: dbDoc.tags || [],
        uploaded_by: dbDoc.users ? {
            id: dbDoc.users.id,
            name: `${dbDoc.users.first_name} ${dbDoc.users.last_name}`.trim()
        } : {
            id: dbDoc.uploaded_by_id,
            name: 'Unknown User'
        },
        created_at: dbDoc.created_at,
        download_url: dbDoc.file_url
    };
}

// Helper function to generate case number
function generateCaseNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `CASE-${year}${month}${day}-${time}`;
}

// Main case functions
export async function getCasesByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: CaseSchema[] }>> {
    try {
        console.log("📋 Fetching cases for organization:", orgId, { offset, limit, search });
        
        let query = supabase
            .from('cases')
            .select(`
                *,
                beneficiaries:beneficiary_id(
                    id,
                    full_name,
                    email,
                    phones,
                    image_url,
                    address
                ),
                assigned_to:assigned_to_id(
                    id,
                    first_name,
                    last_name,
                    email
                )
            `, { count: 'exact' })
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformCase) || [];
        
        console.log("✅ Cases fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: CaseSchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching cases:", {
            error: error.message,
            orgId,
            offset,
            limit,
            search
        });
        throw error;
    }
}

export async function getCaseById(caseId: string): Promise<AxiosResponse<CaseSchema>> {
    try {
        console.log("📋 Fetching case by ID:", caseId);
        
        const { data, error } = await supabase
            .from('cases')
            .select(`
                *,
                beneficiaries:beneficiary_id(
                    id,
                    full_name,
                    email,
                    phones,
                    image_url,
                    address
                ),
                assigned_to:assigned_to_id(
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('id', caseId)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedCase = transformCase(data);
        
        console.log("✅ Case fetched successfully:", transformedCase);
        return {
            data: transformedCase,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<CaseSchema>;
        
    } catch (error: any) {
        console.error("❌ Error fetching case:", {
            error: error.message,
            caseId
        });
        throw error;
    }
}

export async function createCase(data: CreateCasePayload): Promise<AxiosResponse<CaseSchema>> {
    try {
        console.log("🏗️ Creating case with data:", data);
        
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("User not authenticated");
        }
        
        // Get user's organization
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();
        
        if (!userData?.organization_id) {
            throw new Error("User organization not found");
        }
        
        const caseData = {
            case_number: generateCaseNumber(),
            title: data.title,
            description: data.description,
            status: 'PENDING' as const,
            priority: data.priority,
            urgency_level: data.urgency_level,
            service_types: data.service_types,
            beneficiary_id: data.beneficiary_id,
            assigned_to_id: data.assigned_to_id,
            due_date: data.due_date,
            estimated_duration: data.estimated_duration,
            budget_allocated: data.budget_allocated ? parseFloat(data.budget_allocated) : null,
            tags: data.tags,
            organization_id: userData.organization_id,
            last_activity: new Date().toISOString()
        };
        
        const { data: createdCase, error } = await supabase
            .from('cases')
            .insert(caseData)
            .select(`
                *,
                beneficiaries:beneficiary_id(
                    id,
                    full_name,
                    email,
                    phones,
                    image_url,
                    address
                ),
                assigned_to:assigned_to_id(
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        // Create initial note if provided
        if (data.initial_note) {
            await createCaseNote(createdCase.id, data.initial_note);
        }
        
        const transformedCase = transformCase(createdCase);
        
        console.log("✅ Case created successfully:", transformedCase);
        return {
            data: transformedCase,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse<CaseSchema>;
        
    } catch (error: any) {
        console.error("❌ Error creating case:", {
            error: error.message,
            caseData: data
        });
        throw error;
    }
}

export async function updateCase(
    caseId: string,
    data: UpdateCasePayload
): Promise<AxiosResponse<CaseSchema>> {
    try {
        console.log("📝 Updating case:", caseId, "with data:", data);
        
        const updateData: any = {
            ...data,
            budget_allocated: data.budget_allocated ? parseFloat(data.budget_allocated) : undefined,
            last_activity: new Date().toISOString()
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        
        const { data: updatedCase, error } = await supabase
            .from('cases')
            .update(updateData)
            .eq('id', caseId)
            .select(`
                *,
                beneficiaries:beneficiary_id(
                    id,
                    full_name,
                    email,
                    phones,
                    image_url,
                    address
                ),
                assigned_to:assigned_to_id(
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedCase = transformCase(updatedCase);
        
        console.log("✅ Case updated successfully:", transformedCase);
        return {
            data: transformedCase,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<CaseSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating case:", {
            error: error.message,
            caseId,
            updateData: data
        });
        throw error;
    }
}

export async function deleteCase(caseId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting case:", caseId);
        
        const { error } = await supabase
            .from('cases')
            .delete()
            .eq('id', caseId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Case deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting case:", {
            error: error.message,
            caseId
        });
        throw error;
    }
}

export async function getCaseStats(orgId: string): Promise<CaseStatsSchema> {
    try {
        console.log("📊 Fetching case stats for org:", orgId);
        
        const { data: cases, error } = await supabase
            .from('cases')
            .select('id, status, created_at, updated_at, due_date')
            .eq('organization_id', orgId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const stats = {
            total_cases: cases.length,
            open_cases: cases.filter(c => c.status !== 'CLOSED' && c.status !== 'CANCELLED').length,
            in_progress_cases: cases.filter(c => c.status === 'IN_PROGRESS').length,
            overdue_cases: cases.filter(c => {
                if (!c.due_date) return false;
                const dueDate = new Date(c.due_date);
                return dueDate < now && c.status !== 'CLOSED' && c.status !== 'CANCELLED';
            }).length,
            closed_this_month: cases.filter(c => {
                if (c.status !== 'CLOSED') return false;
                const updatedDate = new Date(c.updated_at);
                return updatedDate >= startOfMonth;
            }).length,
            avg_resolution_days: 0 // TODO: Calculate based on case resolution history
        };
        
        console.log("✅ Case stats calculated:", stats);
        return stats;
        
    } catch (error: any) {
        console.error("❌ Error calculating case stats:", {
            error: error.message,
            orgId
        });
        return {
            total_cases: 0,
            open_cases: 0,
            in_progress_cases: 0,
            overdue_cases: 0,
            closed_this_month: 0,
            avg_resolution_days: 0
        };
    }
}

// Case Notes Functions
export async function getCaseNotes(caseId: string): Promise<AxiosResponse<{ data: CaseNoteSchema[] }>> {
    try {
        console.log("📝 Fetching case notes for caseId:", caseId);
        
        const { data, error } = await supabase
            .from('case_notes')
            .select(`
                *,
                users:author_id(
                    id,
                    first_name,
                    last_name
                )
            `)
            .eq('case_id', caseId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedNotes = data?.map(transformCaseNote) || [];
        
        console.log("✅ Case notes fetched successfully:", transformedNotes.length);
        return {
            data: { data: transformedNotes },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ data: CaseNoteSchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching case notes:", {
            error: error.message,
            caseId
        });
        throw error;
    }
}

export async function createCaseNote(caseId: string, data: CreateCaseNotePayload): Promise<AxiosResponse<CaseNoteSchema>> {
    try {
        console.log("📝 Creating case note:", { caseId, data });
        
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("User not authenticated");
        }
        
        const noteData = {
            case_id: caseId,
            author_id: user.id,
            content: data.content,
            title: data.title,
            tags: data.tags,
            note_type: data.note_type,
            is_important: data.is_important,
            is_private: false
        };
        
        const { data: createdNote, error } = await supabase
            .from('case_notes')
            .insert(noteData)
            .select(`
                *,
                users:author_id(
                    id,
                    first_name,
                    last_name
                )
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        // Update case last_activity
        await supabase
            .from('cases')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', caseId);
        
        const transformedNote = transformCaseNote(createdNote);
        
        console.log("✅ Case note created successfully:", transformedNote);
        return {
            data: transformedNote,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse<CaseNoteSchema>;
        
    } catch (error: any) {
        console.error("❌ Error creating case note:", {
            error: error.message,
            caseId,
            noteData: data
        });
        throw error;
    }
}

export async function updateCaseNote(
    caseId: string,
    noteId: string,
    data: Partial<CreateCaseNotePayload>
): Promise<AxiosResponse<CaseNoteSchema>> {
    try {
        console.log("📝 Updating case note:", noteId, "for case:", caseId, "with data:", data);
        
        const { data: updatedNote, error } = await supabase
            .from('case_notes')
            .update(data)
            .eq('id', noteId)
            .eq('case_id', caseId)
            .select(`
                *,
                users:author_id(
                    id,
                    first_name,
                    last_name
                )
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedNote = transformCaseNote(updatedNote);
        
        console.log("✅ Case note updated successfully:", transformedNote);
        return {
            data: transformedNote,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<CaseNoteSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating case note:", {
            error: error.message,
            caseId,
            noteId,
            updateData: data
        });
        throw error;
    }
}

export async function deleteCaseNote(caseId: string, noteId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting case note:", noteId, "from case:", caseId);
        
        const { error } = await supabase
            .from('case_notes')
            .delete()
            .eq('id', noteId)
            .eq('case_id', caseId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Case note deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting case note:", {
            error: error.message,
            caseId,
            noteId
        });
        throw error;
    }
}

// Case Documents Functions (Placeholder - requires Supabase Storage setup)
export async function getCaseDocuments(caseId: string): Promise<AxiosResponse<CaseDocumentSchema[]>> {
    try {
        console.log("📄 Fetching documents for case:", caseId);
        
        const { data, error } = await supabase
            .from('case_documents')
            .select(`
                *,
                users:uploaded_by_id(
                    id,
                    first_name,
                    last_name
                )
            `)
            .eq('case_id', caseId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedDocs = data?.map(transformCaseDocument) || [];
        
        console.log("✅ Case documents fetched successfully:", transformedDocs.length);
        return {
            data: transformedDocs,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<CaseDocumentSchema[]>;
        
    } catch (error: any) {
        console.error("❌ Error fetching case documents:", {
            error: error.message,
            caseId
        });
        throw error;
    }
}

// Document upload/download functions - TODO: Implement with Supabase Storage
export async function generateCaseDocumentUploadLink(
    caseId: string,
    fileType: string
): Promise<AxiosResponse<{ link: string }>> {
    // TODO: Implement with Supabase Storage
    throw new Error("Document upload not yet implemented with Supabase Storage");
}

export async function generateCaseDocumentDownloadLink(
    caseId: string,
    documentId: string
): Promise<AxiosResponse<{ link: string }>> {
    // TODO: Implement with Supabase Storage
    throw new Error("Document download not yet implemented with Supabase Storage");
}

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
): Promise<AxiosResponse<CaseDocumentSchema>> {
    // TODO: Implement with Supabase Storage
    throw new Error("Document creation not yet implemented with Supabase Storage");
}

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
): Promise<AxiosResponse<CaseDocumentSchema>> {
    // TODO: Implement with Supabase Storage
    throw new Error("Document update not yet implemented with Supabase Storage");
}

export async function deleteCaseDocument(
    caseId: string,
    documentId: string
): Promise<AxiosResponse> {
    // TODO: Implement with Supabase Storage
    throw new Error("Document deletion not yet implemented with Supabase Storage");
}

// Helper function to extract file key from S3 URL (kept for compatibility)
export function extractFileKeyFromS3Url(presignedUrl: string): string {
    const url = new URL(presignedUrl);
    return url.pathname.substring(1); // Remove leading slash
} 