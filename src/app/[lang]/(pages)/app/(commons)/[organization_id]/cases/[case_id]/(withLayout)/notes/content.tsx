"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CaseNoteSchema } from "@/types/case.types";
import { formatDate } from "@/utils/formatDate";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaCheck, FaEdit, FaFlag, FaPlus, FaStickyNote, FaTrash } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MdError } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import {
    getCaseNotes,
    createCaseNote,
    updateCaseNote,
    deleteCaseNote,
} from "@/repository/organization.repository";
import { CreateCaseNotePayload } from "@/types/case.types";
import { DebugInfo } from "@/components/debug-info";

const NotesContent = (): ReactNode => {
    const pathname = usePathname();
    const dict = useDictionary();
    const { toast } = useToast();
    const [notes, setNotes] = useState<CaseNoteSchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState<CaseNoteSchema | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags: "",
        note_type: "UPDATE" as const,
        is_important: false,
    });

    const [editFormData, setEditFormData] = useState({
        title: "",
        content: "",
        tags: "",
        note_type: "UPDATE" as "CALL" | "MEETING" | "UPDATE" | "APPOINTMENT" | "OTHER",
        is_important: false,
    });

    const caseId = pathname.split("/")[5];
    const locale = pathname.split("/")[1] as "en" | "pt" | "es";

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                if (caseId) {
                    console.log("📝 Fetching case notes for caseId:", caseId);
                    const response = await getCaseNotes(caseId);
                    
                    // Enhanced notes debugging
                    console.log("📝 Notes API response:", {
                        status: response?.status,
                        data: response?.data,
                        dataType: typeof response?.data,
                        isArray: Array.isArray(response?.data),
                        length: Array.isArray(response?.data) ? response.data.length : 'N/A'
                    });
                    
                    // Ensure we always set an array, even if response.data is undefined/null
                    const notesData = response?.data;
                    if (Array.isArray(notesData)) {
                        console.log("✅ Setting notes array with", notesData.length, "items");
                        setNotes(notesData);
                    } else if (notesData && typeof notesData === 'object' && notesData.data && Array.isArray(notesData.data)) {
                        // Handle case where notes are nested in a data property
                        console.log("✅ Setting notes from nested data property with", notesData.data.length, "items");
                        setNotes(notesData.data);
                    } else {
                        console.warn("⚠️ Notes data is not an array:", notesData);
                        setNotes([]);
                    }
                }
            } catch (err: any) {
                console.error("❌ Error fetching case notes:", {
                    error: err,
                    message: err?.message,
                    response: err?.response?.data,
                    status: err?.response?.status,
                    caseId
                });
                setError(true);
                // Ensure notes is always an array even on error
                setNotes([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [caseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare the payload
            const payload: CreateCaseNotePayload = {
                title: formData.title,
                content: formData.content,
                tags: formData.tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag),
                note_type: formData.note_type,
                is_important: formData.is_important,
            };

            // Call the API to create the note
            console.log("📝 Creating case note:", payload);
            const response = await createCaseNote(caseId, payload);
            console.log("✅ Case note created:", response);

            // Add the new note to the local state
            if (response.data) {
                setNotes(prev => [response.data, ...prev]);
                console.log("✅ Note added to local state");
            } else if (response.status >= 200 && response.status < 300) {
                // Even if no data returned, but status is successful, consider it a success
                console.log("✅ Note creation successful (no data returned but status OK)");
                // Refresh notes list to get updated data
                try {
                    const notesResponse = await getCaseNotes(caseId);
                    const notesData = notesResponse?.data;
                    if (Array.isArray(notesData)) {
                        setNotes(notesData);
                    } else if (notesData && typeof notesData === 'object' && notesData.data && Array.isArray(notesData.data)) {
                        setNotes(notesData.data);
                    }
                } catch (refreshError) {
                    console.warn("⚠️ Could not refresh notes after creation:", refreshError);
                }
            } else {
                console.warn("⚠️ No data returned from createCaseNote:", response);
            }

            setShowAddForm(false);
            setFormData({
                title: "",
                content: "",
                tags: "",
                note_type: "UPDATE",
                is_important: false,
            });

            toast({
                title: "Update added successfully",
                description: "The case update has been added.",
                variant: "success",
            });
        } catch (error: any) {
            console.error("❌ Error creating case note:", {
                error,
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            
            let errorMessage = "Something went wrong. Please try again.";
            if (error?.response?.status === 400) {
                errorMessage = "Invalid note data. Please check your inputs.";
            } else if (error?.response?.status === 403) {
                errorMessage = "You don't have permission to add notes to this case.";
            } else if (error?.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            toast({
                title: "Error adding update",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (note: CaseNoteSchema) => {
        setSelectedNote(note);
        setEditFormData({
            title: note.title,
            content: note.content,
            tags: note.tags.join(", "),
            note_type: note.note_type,
            is_important: note.is_important,
        });
        setShowEditDialog(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!selectedNote) return;

            // Prepare the payload
            const payload: CreateCaseNotePayload = {
                title: editFormData.title,
                content: editFormData.content,
                tags: editFormData.tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag),
                note_type: editFormData.note_type,
                is_important: editFormData.is_important,
            };

            // Call the API to update the note
            console.log("✏️ Updating case note:", selectedNote.id, payload);
            const response = await updateCaseNote(caseId, selectedNote.id, payload);
            console.log("✅ Case note updated:", response);

            // Update local state
            setNotes(prev =>
                prev.map(note =>
                    note.id === selectedNote?.id
                        ? {
                              ...note,
                              title: editFormData.title,
                              content: editFormData.content,
                              tags: editFormData.tags
                                  .split(",")
                                  .map(tag => tag.trim())
                                  .filter(tag => tag),
                              note_type: editFormData.note_type,
                              is_important: editFormData.is_important,
                              updated_at: new Date().toISOString(),
                          }
                        : note
                )
            );

            setShowEditDialog(false);
            setSelectedNote(null);

            toast({
                title: "Update edited successfully",
                description: "The case update has been updated.",
                variant: "success",
            });
        } catch (error: any) {
            console.error("❌ Error updating case note:", {
                error,
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                noteId: selectedNote?.id,
                updateData: editFormData
            });
            
            let errorMessage = "Something went wrong. Please try again.";
            if (error?.response?.status === 400) {
                errorMessage = "Invalid note data. Please check your inputs.";
            } else if (error?.response?.status === 403) {
                errorMessage = "You don't have permission to update this note.";
            } else if (error?.response?.status === 404) {
                errorMessage = "Note not found. It may have been deleted.";
            } else if (error?.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            toast({
                title: "Error updating note",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (note: CaseNoteSchema) => {
        setSelectedNote(note);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setIsSubmitting(true);

        try {
            if (!selectedNote) return;

            // Call the API to delete the note
            console.log("🗑️ Deleting case note:", selectedNote.id);
            await deleteCaseNote(caseId, selectedNote.id);
            console.log("✅ Case note deleted from backend");

            // Update local state
            setNotes(prev => prev.filter(note => note.id !== selectedNote?.id));

            setShowDeleteDialog(false);
            setSelectedNote(null);

            toast({
                title: "Update deleted successfully",
                description: "The case update has been removed.",
                variant: "success",
            });
        } catch (error: any) {
            console.error("❌ Error deleting case note:", {
                error,
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            
            let errorMessage = "Something went wrong. Please try again.";
            if (error?.response?.status === 403) {
                errorMessage = "You don't have permission to delete this note.";
            } else if (error?.response?.status === 404) {
                errorMessage = "Note not found. It may have already been deleted.";
            } else if (error?.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            toast({
                title: "Error deleting note",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const NOTE_TYPE_COLORS = {
        CALL: "bg-blue-100 text-blue-800",
        MEETING: "bg-green-100 text-green-800",
        UPDATE: "bg-purple-100 text-purple-800",
        APPOINTMENT: "bg-orange-100 text-orange-800",
        OTHER: "bg-gray-100 text-gray-800",
    };

    if (isLoading) {
        return <div className="text-relif-orange-400 font-medium text-sm">Loading updates...</div>;
    }

    if (error) {
        return <div className="text-red-600 font-medium text-sm">Error loading updates</div>;
    }

    return (
        <div className="w-full h-max flex flex-col gap-2">
            {/* Debug Info - Only shows in development */}
            <DebugInfo 
                title="Case Notes"
                data={{ notes, caseId, formData, editFormData }}
                error={error}
                isLoading={isLoading}
            />
            
            {/* Header */}
            <div className="w-full h-max border-[1px] border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-relif-orange-200 font-bold text-base flex items-center gap-2">
                        <FaStickyNote />
                        Case Updates
                    </h3>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <FaPlus className="w-4 h-4 mr-2" />
                        Add Update
                    </Button>
                </div>
            </div>

            {/* Add Update Form */}
            {showAddForm && (
                <div className="w-full border-[1px] border-slate-200 rounded-lg p-4">
                    <h3 className="text-relif-orange-200 font-bold text-base pb-3 flex items-center gap-2">
                        <FaPlus />
                        Add New Update
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter update title"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={e =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="Enter update content"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="note_type">Update Type</Label>
                                <Select
                                    value={formData.note_type}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, note_type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CALL">📞 Call</SelectItem>
                                        <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                                        <SelectItem value="UPDATE">📝 Update</SelectItem>
                                        <SelectItem value="APPOINTMENT">📅 Appointment</SelectItem>
                                        <SelectItem value="OTHER">📋 Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={e =>
                                        setFormData({ ...formData, tags: e.target.value })
                                    }
                                    placeholder="follow-up, phone-call, housing"
                                />
                                {/* Tag Preview */}
                                {formData.tags && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {formData.tags.split(",").map((tag, index) => {
                                            const trimmedTag = tag.trim();
                                            return trimmedTag ? (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs bg-slate-100 text-slate-700"
                                                >
                                                    #{trimmedTag}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_important"
                                checked={formData.is_important}
                                onChange={e =>
                                    setFormData({ ...formData, is_important: e.target.checked })
                                }
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="is_important" className="flex items-center gap-1">
                                <FaFlag className="w-3 h-3 text-red-500" />
                                Mark as important
                            </Label>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Update"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Updates List */}
            {!Array.isArray(notes) || notes.length === 0 ? (
                <div className="w-full border-[1px] border-slate-200 rounded-lg p-4">
                    <div className="text-center py-8 text-slate-500">
                        <FaStickyNote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p>No updates found for this case.</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Add your first update to get started.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className={`w-full border-[1px] border-slate-200 rounded-lg p-4 ${note.is_important ? "border-orange-200 bg-orange-50/30" : ""}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-base text-slate-900">
                                            {note.title}
                                        </h4>
                                        {note.is_important && (
                                            <FaFlag className="w-3 h-3 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span>{note.created_by?.name || 'Unknown User'}</span>
                                        <span>•</span>
                                        <span>{formatDate(note.created_at, locale)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={NOTE_TYPE_COLORS[note.note_type]}>
                                        {note.note_type}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(note)}
                                    >
                                        <FaEdit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(note)}
                                    >
                                        <FaTrash className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                {note.content}
                            </p>

                            {Array.isArray(note.tags) && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {note.tags.map((tag, index) => (
                                        <Badge key={index} className="bg-relif-orange-500 text-xs">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <EditNoteDialog
                note={selectedNote}
                isOpen={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                onSave={updatedNote => {
                    setNotes(prev =>
                        prev.map(note => (note.id === updatedNote.id ? updatedNote : note))
                    );
                    setShowEditDialog(false);
                    setSelectedNote(null);
                }}
            />

            {/* Delete Dialog */}
            <DeleteNoteDialog
                note={selectedNote}
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onDelete={noteId => {
                    setNotes(prev => prev.filter(note => note.id !== noteId));
                    setShowDeleteDialog(false);
                    setSelectedNote(null);
                }}
                locale={locale}
            />
        </div>
    );
};

// Edit Dialog Component
const EditNoteDialog = ({
    note,
    isOpen,
    onClose,
    onSave,
}: {
    note: CaseNoteSchema | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedNote: CaseNoteSchema) => void;
}) => {
    const { toast } = useToast();

    // Initialize state with default values first, before any conditional returns
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        note_type: "UPDATE" as "CALL" | "MEETING" | "UPDATE" | "APPOINTMENT" | "OTHER",
        tags: "",
        is_important: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [tagPreviews, setTagPreviews] = useState<string[]>([]);

    // Update form data when note changes
    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title,
                content: note.content,
                note_type: note.note_type,
                tags: note.tags.join(", "),
                is_important: note.is_important,
            });
            setTagPreviews(note.tags);
        }
    }, [note]);

    const handleTagsChange = (value: string) => {
        setFormData(prev => ({ ...prev, tags: value }));
        const tags = value
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag);
        setTagPreviews(tags);
    };

    const handleSave = async () => {
        if (!note) return;

        try {
            setIsLoading(true);

            const updatedNote: CaseNoteSchema = {
                ...note,
                title: formData.title,
                content: formData.content,
                note_type: formData.note_type,
                tags: tagPreviews,
                is_important: formData.is_important,
                updated_at: new Date().toISOString(),
            };

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));

            onSave(updatedNote);
            onClose();

            toast({
                title: "Update saved",
                description: "The case update has been successfully modified.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error saving update",
                description: "There was a problem saving your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Return null only after all hooks have been called
    if (!note) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Update</DialogTitle>
                    <DialogDescription>Make changes to the case update below.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="edit-title">Title *</Label>
                        <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={e =>
                                setFormData(prev => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Enter update title"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="edit-content">Content *</Label>
                        <Textarea
                            id="edit-content"
                            value={formData.content}
                            onChange={e =>
                                setFormData(prev => ({ ...prev, content: e.target.value }))
                            }
                            placeholder="Enter update content"
                            rows={4}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="edit-type">Update Type</Label>
                        <Select
                            value={formData.note_type}
                            onValueChange={(
                                value: "CALL" | "MEETING" | "UPDATE" | "APPOINTMENT" | "OTHER"
                            ) => setFormData(prev => ({ ...prev, note_type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CALL">📞 Call</SelectItem>
                                <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                                <SelectItem value="UPDATE">📝 Update</SelectItem>
                                <SelectItem value="APPOINTMENT">📅 Appointment</SelectItem>
                                <SelectItem value="OTHER">📋 Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                        <Input
                            id="edit-tags"
                            value={formData.tags}
                            onChange={e => handleTagsChange(e.target.value)}
                            placeholder="follow-up, phone-call, housing"
                        />
                        {tagPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tagPreviews.map((tag, index) => (
                                    <Badge variant="outline" key={index} className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="edit-important"
                            checked={formData.is_important}
                            onCheckedChange={checked =>
                                setFormData(prev => ({ ...prev, is_important: checked as boolean }))
                            }
                        />
                        <Label htmlFor="edit-important" className="flex items-center gap-1">
                            🚩 Mark as important
                        </Label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.title || !formData.content || isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Helper function to get note type icon
const getNoteTypeIcon = (noteType: "CALL" | "MEETING" | "UPDATE" | "APPOINTMENT" | "OTHER") => {
    switch (noteType) {
        case "CALL":
            return "📞";
        case "MEETING":
            return "🤝";
        case "UPDATE":
            return "📝";
        case "APPOINTMENT":
            return "📅";
        case "OTHER":
            return "📋";
        default:
            return "📝";
    }
};

// Delete Dialog Component
const DeleteNoteDialog = ({
    note,
    isOpen,
    onClose,
    onDelete,
    locale,
}: {
    note: CaseNoteSchema | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (noteId: string) => void;
    locale: "en" | "pt" | "es";
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!note) return;

        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));

            onDelete(note.id);
            onClose();

            toast({
                title: "Update deleted",
                description: "The case update has been successfully removed.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error deleting update",
                description: "There was a problem deleting the update. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Return null only after all hooks have been called
    if (!note) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="pb-3">Delete Update</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this case update? This action cannot be
                        undone.
                    </DialogDescription>
                    <div className="flex flex-col pt-4">
                        <span className="text-sm text-slate-900 font-bold text-left">
                            {note.title}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 text-left">
                            {getNoteTypeIcon(note.note_type)} {note.note_type} •{" "}
                            {formatDate(note.created_at, locale)}
                        </span>
                    </div>
                    <div className="flex gap-4 pt-5">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export { NotesContent };
