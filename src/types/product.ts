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
  price: number | null;
  stock: number | null;
  customAttributes?: { id: string; key: string; value: string }[];
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
  productCode: string;
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
  machineType?: string;
  powerCapacity?: string;
  speed?: string;
  warrantyPeriod?: string;
  hsnCode?: string;
  media: ProductMedia[];
  mrp: number | null;
  sellingPrice: number | null;
  discountPercent: number | null;
  gstPercent: number | null;
  stockQuantity: number | null;
  stockStatus: "in_stock" | "out_of_stock";
  lowStockWarning: number | null;
  variants: ProductVariant[];
  featureSections: FeatureSection[];
  specifications: ProductSpecification[];
  relatedProductIds: string[];
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
  productCode: "",
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
  machineType: "",
  powerCapacity: "",
  speed: "",
  warrantyPeriod: "",
  hsnCode: "",
  media: [],
  mrp: null,
  sellingPrice: null,
  discountPercent: null,
  gstPercent: null,
  stockQuantity: null,
  stockStatus: "in_stock",
  lowStockWarning: null,
  variants: [],
  featureSections: [],
  specifications: [],
  relatedProductIds: [],
  shipping: { weight: "", length: "", width: "", height: "", estimatedDelivery: "" },
  seo: { title: "", description: "", keywords: "" },
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};
