import { Plus, Trash2 } from "lucide-react";
import { FeatureSection, FeatureItem } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FeatureSectionManagerProps {
  sections: FeatureSection[];
  onChange: (sections: FeatureSection[]) => void;
  readOnly?: boolean;
}

export function FeatureSectionManager({ sections, onChange, readOnly }: FeatureSectionManagerProps) {
  const addSection = () => {
    if (readOnly) return;
    onChange([...sections, { id: crypto.randomUUID(), title: "", items: [] }]);
  };

  const updateSection = (id: string, title: string) => {
    if (readOnly) return;
    onChange(sections.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const removeSection = (id: string) => {
    if (readOnly) return;
    onChange(sections.filter((s) => s.id !== id));
  };

  const addItem = (sectionId: string) => {
    if (readOnly) return;
    onChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, { id: crypto.randomUUID(), label: "", value: "" }] } : s
      )
    );
  };

  const updateItem = (sectionId: string, itemId: string, field: keyof FeatureItem, value: string) => {
    if (readOnly) return;
    onChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) } : s
      )
    );
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (readOnly) return;
    onChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      )
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-lg border border-border p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Input
              value={section.title}
              onChange={(e) => updateSection(section.id, e.target.value)}
              placeholder="Section Title (e.g. Key Features)"
              className="font-medium"
              disabled={readOnly}
            />
            {!readOnly && (
              <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)} className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {section.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 pl-4">
              <Input
                value={item.label}
                onChange={(e) => updateItem(section.id, item.id, "label", e.target.value)}
                placeholder="Label"
                disabled={readOnly}
              />
              <Input
                value={item.value || ""}
                onChange={(e) => updateItem(section.id, item.id, "value", e.target.value)}
                placeholder="Value (optional)"
                disabled={readOnly}
              />
              {!readOnly && (
                <Button variant="ghost" size="icon" onClick={() => removeItem(section.id, item.id)} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}

          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={() => addItem(section.id)} className="ml-4 gap-1.5 text-muted-foreground">
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button variant="outline" size="sm" onClick={addSection} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Feature Section
        </Button>
      )}
    </div>
  );
}
