"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteProductByAdmin,
  fetchCategories,
  fetchProducts,
  updateProductByAdmin,
  type Category,
  type CreateProductPayload,
} from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

type AdminProduct = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  discount_price: number | null;
  stock: number;
  flash_sale: boolean;
  category_id: number;
  category_name?: string;
  brand?: string | null;
  description?: string | null;
};

type EditableProductState = {
  name: string;
  image_url: string;
  brand: string;
  description: string;
  price: string;
  discount_price: string;
  stock: string;
  category_id: string;
  flash_sale: boolean;
};

const emptyEditableState: EditableProductState = {
  name: "",
  image_url: "",
  brand: "",
  description: "",
  price: "",
  discount_price: "",
  stock: "0",
  category_id: "",
  flash_sale: false,
};

function toEditableProductState(product: AdminProduct): EditableProductState {
  return {
    name: product.name,
    image_url: product.image_url,
    brand: product.brand ?? "",
    description: product.description ?? "",
    price: String(product.price),
    discount_price: product.discount_price === null ? "" : String(product.discount_price),
    stock: String(product.stock),
    category_id: String(product.category_id),
    flash_sale: Boolean(product.flash_sale),
  };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditableProductState>(emptyEditableState);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  useEffect(() => {
    if (!hasInitialized) return;

    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsJson, categoriesList] = await Promise.all([
          fetchProducts({ page: "1", limit: "200" }),
          fetchCategories(),
        ]);

        setProducts((productsJson.data ?? []) as AdminProduct[]);
        setCategories(categoriesList);
      } catch {
        toast.error("Failed to load admin products");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [hasInitialized, isLoggedIn, router, user?.is_admin]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        categoryFilter === "all" || String(product.category_id) === categoryFilter;

      if (!categoryMatch) return false;

      if (!normalizedSearch) return true;

      const name = product.name?.toLowerCase() ?? "";
      const brand = product.brand?.toLowerCase() ?? "";
      const description = product.description?.toLowerCase() ?? "";

      return (
        name.includes(normalizedSearch) ||
        brand.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [products, searchText, categoryFilter]);

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setEditingData(toEditableProductState(product));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(emptyEditableState);
  };

  const handleEditFieldChange =
    (field: keyof EditableProductState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        field === "flash_sale" && e.target instanceof HTMLInputElement
          ? e.target.checked
          : e.target.value;

      setEditingData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const saveEdit = async (productId: string) => {
    try {
      setSavingId(productId);

      const payload: CreateProductPayload = {
        name: editingData.name.trim(),
        image_url: editingData.image_url.trim(),
        brand: editingData.brand.trim() || null,
        description: editingData.description.trim() || null,
        price: Number(editingData.price),
        discount_price: editingData.discount_price ? Number(editingData.discount_price) : null,
        stock: Number(editingData.stock),
        flash_sale: editingData.flash_sale,
        category_id: Number(editingData.category_id),
      };

      const response = await updateProductByAdmin(productId, payload);
      const updated = response.data as AdminProduct;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...updated,
                category_name:
                  updated.category_name || categoryNameMap.get(Number(updated.category_id)) || "",
              }
            : product,
        ),
      );

      toast.success("Product updated");
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setSavingId(null);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    const confirmed = window.confirm(
      `Delete product \"${productName}\"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(productId);
      await deleteProductByAdmin(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      if (editingId === productId) {
        cancelEdit();
      }
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Product Management</h1>
            <p className="mt-1 text-gray-600">Edit or remove products visible to users</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, brand, or description"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-100 text-left">
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Brand</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Price</th>
                    <th className="p-3 font-semibold">Discount</th>
                    <th className="p-3 font-semibold">Stock</th>
                    <th className="p-3 font-semibold">Flash Sale</th>
                    <th className="p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isEditing = editingId === product.id;
                    const isSaving = savingId === product.id;
                    const isDeleting = deletingId === product.id;

                    return (
                      <tr key={product.id} className="border-b align-top">
                        <td className="p-3">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editingData.name}
                                onChange={handleEditFieldChange("name")}
                                placeholder="Name"
                              />
                              <Input
                                value={editingData.image_url}
                                onChange={handleEditFieldChange("image_url")}
                                placeholder="Image URL"
                              />
                              <textarea
                                value={editingData.description}
                                onChange={handleEditFieldChange("description")}
                                rows={2}
                                placeholder="Description"
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {product.description || "No description"}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={editingData.brand}
                              onChange={handleEditFieldChange("brand")}
                              placeholder="Brand"
                            />
                          ) : (
                            <span>{product.brand || "-"}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editingData.category_id}
                              onChange={handleEditFieldChange("category_id")}
                              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                            >
                              <option value="">Select category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>{product.category_name || categoryNameMap.get(product.category_id) || "-"}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingData.price}
                              onChange={handleEditFieldChange("price")}
                            />
                          ) : (
                            <span>{Number(product.price).toFixed(2)}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingData.discount_price}
                              onChange={handleEditFieldChange("discount_price")}
                              placeholder="Optional"
                            />
                          ) : (
                            <span>{product.discount_price === null ? "-" : Number(product.discount_price).toFixed(2)}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={editingData.stock}
                              onChange={handleEditFieldChange("stock")}
                            />
                          ) : (
                            <span>{product.stock}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingData.flash_sale}
                                onChange={handleEditFieldChange("flash_sale")}
                              />
                              <span>Flash Sale</span>
                            </label>
                          ) : (
                            <span>{product.flash_sale ? "Yes" : "No"}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(product.id)}
                                disabled={isSaving}
                              >
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(product)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteProduct(product.id, product.name)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-500">
                        No products match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
