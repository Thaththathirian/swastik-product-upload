import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProductStore } from "@/store/productStore";
import { Product, emptyProduct } from "@/types/product";
import { MediaUploader } from "@/components/MediaUploader";
import { VariantManager } from "@/components/VariantManager";
import { FeatureSectionManager } from "@/components/FeatureSectionManager";
import { SpecificationManager } from "@/components/SpecificationManager";
import { RequiredLabel } from "@/components/RequiredLabel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Required fields config
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Product Name" },
  { key: "sellingPrice", label: "Selling Price" },
  { key: "category", label: "Category" },
];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProduct, updateProduct, getProduct } = useProductStore();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const [form, setForm] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({ ...emptyProduct });

  useEffect(() => {
    if (id) {
      const existing = getProduct(id);
      if (existing) {
        const { id: _, createdAt, updatedAt, ...rest } = existing;
        setForm(rest);
      }
    }
  }, [id, getProduct]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const setShipping = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }));

  const setSeo = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

  const registerRef = useCallback((key: string) => (el: HTMLElement | null) => {
    fieldRefs.current[key] = el;
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    let firstErrorKey: string | null = null;

    for (const field of REQUIRED_FIELDS) {
      const value = form[field.key as keyof typeof form];
      const isEmpty = value === "" || value === 0 || value === undefined || value === null;
      if (isEmpty) {
        newErrors[field.key] = true;
        if (!firstErrorKey) firstErrorKey = field.key;
      }
    }

    setErrors(newErrors);

    if (firstErrorKey && fieldRefs.current[firstErrorKey]) {
      const el = fieldRefs.current[firstErrorKey];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the input inside
      setTimeout(() => {
        const input = el?.querySelector("input, textarea, select") as HTMLElement;
        input?.focus();
      }, 400);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    // Simulate upload finalization delay
    await new Promise((r) => setTimeout(r, 1200));

    const now = new Date().toISOString();
    if (isEdit && id) {
      updateProduct(id, { ...form, updatedAt: now });
      toast.success("Product updated");
    } else {
      addProduct({ ...form, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
      toast.success("Product created");
    }
    setSaving(false);
    navigate("/products");
  };

  const generateSlug = () => {
    set("slug", form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-3 sticky top-0 z-10 bg-background py-3 -mt-3 border-b border-border mb-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Product" : "Add Product"}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5" ref={registerRef("name")}>
              <RequiredLabel required error={errors.name}>Product Name</RequiredLabel>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter product name"
                className={cn(errors.name && "border-destructive ring-destructive")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <div className="flex gap-2">
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="product-url-slug" />
                <Button variant="outline" size="sm" onClick={generateSlug} type="button">Generate</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="space-y-1.5" ref={registerRef("category")}>
              <RequiredLabel required error={errors.category}>Category</RequiredLabel>
              <Input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={cn(errors.category && "border-destructive ring-destructive")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sub Category</Label>
              <Input value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h2 className="section-title">Description</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Detailed Description</Label>
              <Textarea value={form.detailedDescription} onChange={(e) => set("detailedDescription", e.target.value)} rows={5} />
            </div>
            <div className="space-y-1.5">
              <Label>Highlights (one per line)</Label>
              <Textarea value={form.highlights.join("\n")} onChange={(e) => set("highlights", e.target.value.split("\n").filter(Boolean))} rows={4} placeholder="Heavy duty metal body&#10;High speed stitching" />
            </div>
            <div className="space-y-1.5">
              <Label>Usage / Application</Label>
              <Textarea value={form.usage} onChange={(e) => set("usage", e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="form-section">
          <h2 className="section-title">Media</h2>
          <MediaUploader media={form.media} onChange={(m) => set("media", m)} />
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h2 className="section-title">Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>MRP (₹)</Label>
              <Input type="number" value={form.mrp} onChange={(e) => set("mrp", +e.target.value)} />
            </div>
            <div className="space-y-1.5" ref={registerRef("sellingPrice")}>
              <RequiredLabel required error={errors.sellingPrice}>Selling Price (₹)</RequiredLabel>
              <Input
                type="number"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", +e.target.value)}
                className={cn(errors.sellingPrice && "border-destructive ring-destructive")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount %</Label>
              <Input type="number" value={form.discountPercent} onChange={(e) => set("discountPercent", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>GST %</Label>
              <Input type="number" value={form.gstPercent} onChange={(e) => set("gstPercent", +e.target.value)} />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="form-section">
          <h2 className="section-title">Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Stock Quantity</Label>
              <Input type="number" value={form.stockQuantity} onChange={(e) => set("stockQuantity", +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Status</Label>
              <select
                value={form.stockStatus}
                onChange={(e) => set("stockStatus", e.target.value as "in_stock" | "out_of_stock")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Low Stock Warning</Label>
              <Input type="number" value={form.lowStockWarning} onChange={(e) => set("lowStockWarning", +e.target.value)} />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="form-section">
          <h2 className="section-title">Variants</h2>
          <VariantManager variants={form.variants} onChange={(v) => set("variants", v)} />
        </div>

        {/* Feature Sections */}
        <div className="form-section">
          <h2 className="section-title">Feature Sections</h2>
          <FeatureSectionManager sections={form.featureSections} onChange={(s) => set("featureSections", s)} />
        </div>

        {/* Specifications */}
        <div className="form-section">
          <h2 className="section-title">Technical Specifications</h2>
          <SpecificationManager specs={form.specifications} onChange={(s) => set("specifications", s)} />
        </div>

        {/* Shipping */}
        <div className="form-section">
          <h2 className="section-title">Shipping</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input value={form.shipping.weight} onChange={(e) => setShipping("weight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Length (cm)</Label>
              <Input value={form.shipping.length} onChange={(e) => setShipping("length", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Width (cm)</Label>
              <Input value={form.shipping.width} onChange={(e) => setShipping("width", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input value={form.shipping.height} onChange={(e) => setShipping("height", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <Label>Estimated Delivery Time</Label>
            <Input value={form.shipping.estimatedDelivery} onChange={(e) => setShipping("estimatedDelivery", e.target.value)} placeholder="e.g. 5-7 business days" />
          </div>
        </div>

        {/* SEO */}
        <div className="form-section">
          <h2 className="section-title">SEO</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>SEO Title</Label>
              <Input value={form.seo.title} onChange={(e) => setSeo("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO Description</Label>
              <Textarea value={form.seo.description} onChange={(e) => setSeo("description", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO Keywords</Label>
              <Input value={form.seo.keywords} onChange={(e) => setSeo("keywords", e.target.value)} placeholder="keyword1, keyword2" />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="form-section">
          <h2 className="section-title">Product Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "isActive" as const, label: "Active" },
              { key: "isFeatured" as const, label: "Featured" },
              { key: "isBestSeller" as const, label: "Best Seller" },
              { key: "isNewArrival" as const, label: "New Arrival" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">{label}</Label>
                <Switch checked={form[key]} onCheckedChange={(v) => set(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Fields */}
        <div className="form-section">
          <h2 className="section-title">Comparison Fields</h2>
          <p className="text-sm text-muted-foreground mb-2">Enter field names used for product comparison (comma separated)</p>
          <Input
            value={form.comparisonFields.join(", ")}
            onChange={(e) => set("comparisonFields", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            placeholder="Power, Speed, Weight, Machine Type"
          />
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductForm;
