export interface ProductMedia {
  id: string;
  url: string;
  originalUrl?: string;
  type: "image" | "video";
  isMain: boolean;
  isThumbnail: boolean;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  type: string;
  name: string;
  price: number;
  stock: number;
}

export interface FeatureItem {
  id: string;
  label: string;
  value?: string;
}

export interface FeatureSection {
  id: string;
  title: string;
  items: FeatureItem[];
}

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string;
}

export interface ProductShipping {
  weight: string;
  length: string;
  width: string;
  height: string;
  estimatedDelivery: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subCategory: string;
  model: string;
  tags: string[];
  shortDescription: string;
  detailedDescription: string;
  highlights: string[];
  usage: string;
  media: ProductMedia[];
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  gstPercent: number;
  stockQuantity: number;
  stockStatus: "in_stock" | "out_of_stock";
  lowStockWarning: number;
  variants: ProductVariant[];
  featureSections: FeatureSection[];
  specifications: ProductSpecification[];
  relatedProductIds: string[];
  comparisonFields: string[];
  shipping: ProductShipping;
  seo: ProductSEO;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  createdAt: string;
  updatedAt: string;
}

export const emptyProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  sku: "",
  name: "",
  slug: "",
  brand: "",
  category: "",
  subCategory: "",
  model: "",
  tags: [],
  shortDescription: "",
  detailedDescription: "",
  highlights: [],
  usage: "",
  media: [],
  mrp: 0,
  sellingPrice: 0,
  discountPercent: 0,
  gstPercent: 0,
  stockQuantity: 0,
  stockStatus: "in_stock",
  lowStockWarning: 5,
  variants: [],
  featureSections: [],
  specifications: [],
  relatedProductIds: [],
  comparisonFields: [],
  shipping: { weight: "", length: "", width: "", height: "", estimatedDelivery: "" },
  seo: { title: "", description: "", keywords: "" },
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};
