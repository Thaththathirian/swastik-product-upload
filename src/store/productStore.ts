import { create } from "zustand";
import { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const STORAGE_KEY = "pms_products";

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: loadProducts(),
  addProduct: (product) =>
    set((state) => {
      const next = [...state.products, product];
      saveProducts(next);
      return { products: next };
    }),
  updateProduct: (id, updates) =>
    set((state) => {
      const next = state.products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      saveProducts(next);
      return { products: next };
    }),
  deleteProduct: (id) =>
    set((state) => {
      const next = state.products.filter((p) => p.id !== id);
      saveProducts(next);
      return { products: next };
    }),
  getProduct: (id) => get().products.find((p) => p.id === id),
}));
