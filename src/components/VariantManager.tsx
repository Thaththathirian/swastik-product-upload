import { Plus, Trash2, PlusCircle, X } from "lucide-react";
import { ProductVariant } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  readOnly?: boolean;
}

export function VariantManager({ variants, onChange, readOnly }: VariantManagerProps) {
  const add = () => {
    if (readOnly) return;
    onChange([...variants, { id: crypto.randomUUID(), type: "", name: "", price: null, stock: null, customAttributes: [] }]);
  };

  const update = (id: string, field: keyof ProductVariant, value: any) => {
    if (readOnly) return;
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const remove = (id: string) => {
    if (readOnly) return;
    onChange(variants.filter((v) => v.id !== id));
  };

  const addAttribute = (variantId: string) => {
    if (readOnly) return;
    onChange(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            customAttributes: [...(v.customAttributes || []), { id: crypto.randomUUID(), key: "", value: "" }],
          };
        }
        return v;
      })
    );
  };

  const updateAttribute = (variantId: string, attrId: string, field: "key" | "value", value: string) => {
    if (readOnly) return;
    onChange(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            customAttributes: (v.customAttributes || []).map((a) => (a.id === attrId ? { ...a, [field]: value } : a)),
          };
        }
        return v;
      })
    );
  };

  const removeAttribute = (variantId: string, attrId: string) => {
    if (readOnly) return;
    onChange(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            customAttributes: (v.customAttributes || []).filter((a) => a.id !== attrId),
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v.id} className="p-3 border rounded-lg bg-card/30 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Type</label>
              <Input value={v.type} onChange={(e) => update(v.id, "type", e.target.value)} placeholder="e.g. Color" disabled={readOnly} className="h-9" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Name</label>
              <Input value={v.name} onChange={(e) => update(v.id, "name", e.target.value)} placeholder="e.g. Red" disabled={readOnly} className="h-9" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Price</label>
              <Input type="number" value={v.price ?? ""} onChange={(e) => update(v.id, "price", e.target.value === "" ? null : +e.target.value)} disabled={readOnly} className="h-9" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Stock</label>
              <Input type="number" value={v.stock ?? ""} onChange={(e) => update(v.id, "stock", e.target.value === "" ? null : +e.target.value)} disabled={readOnly} className="h-9" />
            </div>
            {!readOnly && (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => addAttribute(v.id)} className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10" title="Add Custom Attribute">
                  <PlusCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(v.id)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {readOnly && <div />}
          </div>

          {/* Custom Attributes */}
          {v.customAttributes && v.customAttributes.length > 0 && (
            <div className="pl-4 space-y-2 border-l-2 border-primary/20 ml-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {v.customAttributes.map((attr) => (
                  <div key={attr.id} className="flex gap-2 items-center">
                    <Input
                      value={attr.key}
                      onChange={(e) => updateAttribute(v.id, attr.id, "key", e.target.value)}
                      placeholder="Variant Name"
                      disabled={readOnly}
                      className="h-8 text-xs bg-background/50"
                    />
                    <Input
                      value={attr.value}
                      onChange={(e) => updateAttribute(v.id, attr.id, "value", e.target.value)}
                      placeholder="Variant Value"
                      disabled={readOnly}
                      className="h-8 text-xs bg-background/50"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttribute(v.id, attr.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Variant
        </Button>
      )}
    </div>
  );
}
