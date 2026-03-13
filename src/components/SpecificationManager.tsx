import { Plus, Trash2 } from "lucide-react";
import { ProductSpecification } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SpecificationManagerProps {
  specs: ProductSpecification[];
  onChange: (specs: ProductSpecification[]) => void;
}

export function SpecificationManager({ specs, onChange }: SpecificationManagerProps) {
  const add = () => {
    onChange([...specs, { id: crypto.randomUUID(), key: "", value: "" }]);
  };

  const update = (id: string, field: "key" | "value", value: string) => {
    onChange(specs.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const remove = (id: string) => onChange(specs.filter((s) => s.id !== id));

  return (
    <div className="space-y-2">
      {specs.map((s) => (
        <div key={s.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 animate-fade-in">
          <Input value={s.key} onChange={(e) => update(s.id, "key", e.target.value)} placeholder="Spec Name" />
          <Input value={s.value} onChange={(e) => update(s.id, "value", e.target.value)} placeholder="Value" />
          <Button variant="ghost" size="icon" onClick={() => remove(s.id)} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add Specification
      </Button>
    </div>
  );
}
