import { supabase } from "@/config/supabase";
import {
    AddProductRequest,
    MoveProductRequest,
    ProductEntry,
    UpdateProductRequest,
    ProductSchema,
    AllocationSchema,
} from "@/types/product.types";
import { AxiosResponse } from "axios";
import { OrganizationSchema } from "@/types/organization.types";

// Helper function to transform database product to ProductSchema
function transformProduct(dbProduct: any): ProductSchema {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description || '',
        brand: dbProduct.brand || '',
        category: dbProduct.category || '',
        organization_id: dbProduct.organization_id,
        organization: dbProduct.organizations || {} as OrganizationSchema,
        unit_type: dbProduct.unit_type || 'pcs',
        total_in_storage: dbProduct.total_in_storage || 0,
        created_at: dbProduct.created_at,
        updated_at: dbProduct.updated_at
    };
}

// Helper function to transform database donation to ProductEntry
function transformProductEntry(dbEntry: any): ProductEntry {
    return {
        id: dbEntry.id,
        product_type_id: dbEntry.product_type_id,
        product_type: transformProduct(dbEntry.product_types || {}),
        brand: dbEntry.product_types?.brand || '',
        category: dbEntry.product_types?.category || '',
        description: dbEntry.product_types?.description || '',
        created_at: dbEntry.created_at,
        updated_at: dbEntry.created_at, // Donations don't have updated_at
        quantity: dbEntry.quantity,
        from: {
            id: dbEntry.from_id || '',
            type: dbEntry.from_type || 'ORGANIZATION'
        },
        to: {
            id: dbEntry.beneficiary_id || '', // Donations go to beneficiaries
            type: 'BENEFICIARY'
        },
        type: 'DONATION',
        organization_id: dbEntry.organization_id,
        organization: dbEntry.organizations || {} as OrganizationSchema
    };
}

// Organization-level inventory functions (moved from organization.repository.ts)
export async function getProductsByOrganizationID(
    orgId: string,
    offset: number,
    limit: number,
    search: string
): Promise<AxiosResponse<{ count: number; data: ProductSchema[] }>> {
    try {
        console.log("📦 Fetching products for organization:", orgId, { offset, limit, search });
        
        let query = supabase
            .from('product_types')
            .select(`
                *,
                organizations:organization_id(*)
            `, { count: 'exact' })
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformProduct) || [];
        
        console.log("✅ Products fetched successfully via Supabase:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: ProductSchema[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching products:", {
            error: error.message,
            orgId,
            offset,
            limit,
            search
        });
        throw error;
    }
}

export async function getInventoryStats(orgId: string): Promise<any> {
    try {
        console.log("📊 Fetching inventory stats for org:", orgId);
        
        const { data: products, error } = await supabase
            .from('product_types')
            .select('id, total_in_storage')
            .eq('organization_id', orgId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const stats = {
            total_products: products.length,
            in_stock_products: products.filter(p => (p.total_in_storage || 0) > 10).length,
            low_stock_products: products.filter(p => (p.total_in_storage || 0) > 0 && (p.total_in_storage || 0) <= 10).length,
            out_of_stock_products: products.filter(p => (p.total_in_storage || 0) === 0).length,
            total_quantity: products.reduce((sum, p) => sum + (p.total_in_storage || 0), 0)
        };
        
        console.log("✅ Inventory stats calculated:", stats);
        return stats;
        
    } catch (error: any) {
        console.error("❌ Error calculating inventory stats:", {
            error: error.message,
            orgId
        });
        return {
            total_products: 0,
            in_stock_products: 0,
            low_stock_products: 0,
            out_of_stock_products: 0,
            total_quantity: 0
        };
    }
}

export async function createProduct(orgId: string, data: any): Promise<AxiosResponse<ProductSchema>> {
    try {
        console.log("🏗️ Creating product for organization:", orgId, "with data:", data);
        
        const productData = {
            organization_id: orgId,
            name: data.name,
            description: data.description,
            brand: data.brand,
            category: data.category,
            unit_type: data.unit_type,
            total_in_storage: 0
        };
        
        const { data: createdProduct, error } = await supabase
            .from('product_types')
            .insert(productData)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedProduct = transformProduct(createdProduct);
        
        console.log("✅ Product created successfully:", transformedProduct);
        return {
            data: transformedProduct,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: {}
        } as AxiosResponse<ProductSchema>;
        
    } catch (error: any) {
        console.error("❌ Error creating product:", {
            error: error.message,
            orgId,
            productData: data
        });
        throw error;
    }
}

// Individual product CRUD functions
export async function getProductById(productId: string): Promise<AxiosResponse<ProductSchema>> {
    try {
        console.log("📦 Fetching product by ID:", productId);
        
        const { data, error } = await supabase
            .from('product_types')
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedProduct = transformProduct(data);
        
        console.log("✅ Product fetched successfully:", transformedProduct);
        return {
            data: transformedProduct,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<ProductSchema>;
        
    } catch (error: any) {
        console.error("❌ Error fetching product:", {
            error: error.message,
            productId
        });
        throw error;
    }
}

export async function updateProduct(productId: string, data: UpdateProductRequest): Promise<AxiosResponse<ProductSchema>> {
    try {
        console.log("📝 Updating product:", productId, "with data:", data);
        
        const { data: updatedProduct, error } = await supabase
            .from('product_types')
            .update({
                name: data.name,
                description: data.description,
                brand: data.brand,
                category: data.category,
                unit_type: data.unit_type
            })
            .eq('id', productId)
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .single();
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedProduct = transformProduct(updatedProduct);
        
        console.log("✅ Product updated successfully:", transformedProduct);
        return {
            data: transformedProduct,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<ProductSchema>;
        
    } catch (error: any) {
        console.error("❌ Error updating product:", {
            error: error.message,
            productId,
            updateData: data
        });
        throw error;
    }
}

export async function deleteProduct(productId: string): Promise<AxiosResponse> {
    try {
        console.log("🗑️ Deleting product:", productId);
        
        const { error } = await supabase
            .from('product_types')
            .delete()
            .eq('id', productId);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        console.log("✅ Product deleted successfully");
        return {
            data: null,
            status: 204,
            statusText: 'No Content',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error deleting product:", {
            error: error.message,
            productId
        });
        throw error;
    }
}

// Product allocation/movement functions
export async function allocateProduct(
    productId: string,
    data: AddProductRequest
): Promise<AxiosResponse> {
    try {
        console.log("📦 Allocating product:", productId, "with data:", data);
        
        // Update product stock (increase total_in_storage)
        const { data: currentProduct, error: fetchError } = await supabase
            .from('product_types')
            .select('total_in_storage')
            .eq('id', productId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const newTotal = (currentProduct.total_in_storage || 0) + data.quantity;
        
        const { error: updateError } = await supabase
            .from('product_types')
            .update({ total_in_storage: newTotal })
            .eq('id', productId);
        
        if (updateError) {
            console.error("❌ Supabase update error:", updateError);
            throw updateError;
        }
        
        // TODO: Create allocation history record when allocations table is available
        
        console.log("✅ Product allocated successfully:", {
            productId,
            quantity: data.quantity,
            newTotal
        });
        
        return {
            data: { success: true, newTotal },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error allocating product:", {
            error: error.message,
            productId,
            allocationData: data
        });
        throw error;
    }
}

export async function reallocateProduct(
    productId: string,
    data: MoveProductRequest
): Promise<AxiosResponse> {
    try {
        console.log("🔄 Reallocating product:", productId, "with data:", data);
        
        // For now, just log the reallocation (no physical movement of stock)
        // TODO: Implement proper allocation tracking when allocations table is available
        
        console.log("✅ Product reallocation logged:", {
            productId,
            from: data.from,
            to: data.to,
            quantity: data.quantity
        });
        
        return {
            data: { success: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse;
        
    } catch (error: any) {
        console.error("❌ Error reallocating product:", {
            error: error.message,
            productId,
            reallocationData: data
        });
        throw error;
    }
}

// Product history and tracking functions
export async function getAllocations(
    productId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: ProductEntry[] }>> {
    try {
        console.log("📋 Fetching allocations for product:", productId, { offset, limit });
        
        // For now, return allocation info based on current state
        // TODO: Implement proper allocation history when allocations table is available
        
        const { data: product, error } = await supabase
            .from('product_types')
            .select(`
                *,
                organizations:organization_id(*)
            `)
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        // Create a mock allocation entry based on current product state
        const allocationData: ProductEntry[] = [];
        
        if (product.total_in_storage > 0) {
            allocationData.push({
                id: `${productId}-current-stock`,
                product_type_id: productId,
                product_type: transformProduct(product),
                brand: product.brand || '',
                category: product.category || '',
                description: product.description || '',
                created_at: product.created_at,
                updated_at: product.updated_at,
                quantity: product.total_in_storage,
                from: {
                    id: product.organization_id,
                    type: 'ORGANIZATION'
                },
                to: {
                    id: product.organization_id,
                    type: 'ORGANIZATION'
                },
                type: 'ENTRANCE',
                organization_id: product.organization_id,
                organization: product.organizations || {} as OrganizationSchema
            });
        }
        
        console.log("✅ Product allocations fetched:", {
            count: allocationData.length,
            productId
        });
        
        return {
            data: { 
                count: allocationData.length, 
                data: allocationData 
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: ProductEntry[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching allocations:", {
            error: error.message,
            productId,
            offset,
            limit
        });
        throw error;
    }
}

export async function getDonations(
    productId: string,
    offset: number,
    limit: number
): Promise<AxiosResponse<{ count: number; data: ProductEntry[] }>> {
    try {
        console.log("🎁 Fetching donations for product:", productId, { offset, limit });
        
        const { data, error, count } = await supabase
            .from('donations')
            .select(`
                *,
                product_types:product_type_id(*),
                organizations:organization_id(*),
                beneficiaries:beneficiary_id(id, full_name)
            `, { count: 'exact' })
            .eq('product_type_id', productId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("❌ Supabase error:", error);
            throw error;
        }
        
        const transformedData = data?.map(transformProductEntry) || [];
        
        console.log("✅ Product donations fetched successfully:", {
            count: count || 0,
            dataLength: transformedData.length
        });
        
        return {
            data: { count: count || 0, data: transformedData },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<{ count: number; data: ProductEntry[] }>;
        
    } catch (error: any) {
        console.error("❌ Error fetching donations:", {
            error: error.message,
            productId,
            offset,
            limit
        });
        throw error;
    }
}

export async function getStorageRecords(productId: string): Promise<AxiosResponse<AllocationSchema[]>> {
    try {
        console.log("🏪 Fetching storage records for product:", productId);
        
        // Get current product with organization info
        const { data: product, error } = await supabase
            .from('product_types')
            .select(`
                *,
                organizations:organization_id(id, name)
            `)
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        // Create storage allocation based on current stock
        const storageRecords: AllocationSchema[] = [];
        
        if (product.total_in_storage > 0) {
            storageRecords.push({
                id: `${productId}-org-storage`,
                location: {
                    id: product.organization_id,
                    name: product.organizations?.name || 'Organization Storage',
                    type: 'ORGANIZATION'
                },
                quantity: product.total_in_storage
            });
        }
        
        console.log("✅ Storage records fetched:", {
            productId,
            recordsCount: storageRecords.length,
            totalStored: product.total_in_storage
        });
        
        return {
            data: storageRecords,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        } as AxiosResponse<AllocationSchema[]>;
        
    } catch (error: any) {
        console.error("❌ Error fetching storage records:", {
            error: error.message,
            productId
        });
        throw error;
    }
}
