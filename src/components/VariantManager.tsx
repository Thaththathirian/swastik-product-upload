import { Plus, Trash2 } from "lucide-react";
import { ProductVariant } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const add = () => {
    onChange([...variants, { id: crypto.randomUUID(), type: "", name: "", price: 0, stock: 0 }]);
  };

  const update = (id: string, field: keyof ProductVariant, value: string | number) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const remove = (id: string) => onChange(variants.filter((v) => v.id !== id));

  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v.id} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end animate-fade-in">
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <Input value={v.type} onChange={(e) => update(v.id, "type", e.target.value)} placeholder="e.g. Color" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <Input value={v.name} onChange={(e) => update(v.id, "name", e.target.value)} placeholder="e.g. Red" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Price</label>
            <Input type="number" value={v.price} onChange={(e) => update(v.id, "price", +e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Stock</label>
            <Input type="number" value={v.stock} onChange={(e) => update(v.id, "stock", +e.target.value)} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(v.id)} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add Variant
      </Button>
    </div>
  );
}
