import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { ProductMedia } from "@/types/product";

interface MediaUploaderProps {
  media: ProductMedia[];
  onChange: (media: ProductMedia[]) => void;
}

export function MediaUploader({ media, onChange }: MediaUploaderProps) {
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newMedia: ProductMedia[] = Array.from(files).map((file, i) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        isMain: media.length === 0 && i === 0,
        isThumbnail: false,
      }));
      onChange([...media, ...newMedia]);
    },
    [media, onChange]
  );

  const remove = (id: string) => onChange(media.filter((m) => m.id !== id));

  const setMain = (id: string) =>
    onChange(media.map((m) => ({ ...m, isMain: m.id === id })));

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
        <span className="text-sm text-muted-foreground">Click or drop files</span>
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>

      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {media.map((m) => (
            <div key={m.id} className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${m.isMain ? "border-primary" : "border-border"}`}>
              {m.type === "image" ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={() => setMain(m.id)} className="p-1 bg-card rounded text-xs font-medium">Main</button>
                <button onClick={() => remove(m.id)} className="p-1 bg-destructive text-destructive-foreground rounded"><X className="w-3 h-3" /></button>
              </div>
              {m.isMain && <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">Main</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
