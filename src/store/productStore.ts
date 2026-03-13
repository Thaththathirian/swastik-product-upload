import { create } from "zustand";
import { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const STORAGE_KEY = "pms_products";
const IS_PROD = import.meta.env.VITE_APP_MODE === "production";
const API_URL = import.meta.env.VITE_API_BASE_URL;

function loadLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: IS_PROD ? [] : loadLocalProducts(),

  fetchProducts: async () => {
    if (IS_PROD) {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        set({ products });
      } catch (error) {
        console.error('API Error:', error);
      }
    }
    // Local products are already loaded on initialization for dev
  },

  addProduct: async (product) => {
    if (IS_PROD) {
      try {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to add product');
        const savedProduct = await response.json();
        set((state) => ({ products: [...state.products, savedProduct] }));
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      set((state) => {
        const next = [...state.products, product];
        saveLocalProducts(next);
        return { products: next };
      });
    }
  },

  updateProduct: async (id, updates) => {
    if (IS_PROD) {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update product');
        const updatedProduct = await response.json();
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        }));
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      set((state) => {
        const next = state.products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
        saveLocalProducts(next);
        return { products: next };
      });
    }
  },

  deleteProduct: async (id) => {
    if (IS_PROD) {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      set((state) => {
        const next = state.products.filter((p) => p.id !== id);
        saveLocalProducts(next);
        return { products: next };
      });
    }
  },

  getProduct: (id) => get().products.find((p) => p.id === id),
}));
