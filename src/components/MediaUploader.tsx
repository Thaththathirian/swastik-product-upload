import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { ProductMedia } from "@/types/product";
import { Progress } from "@/components/ui/progress";

interface MediaUploaderProps {
  media: ProductMedia[];
  onChange: (media: ProductMedia[]) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  url: string;
  status: "uploading" | "ready" | "cancelled";
}

export function MediaUploader({ media, onChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File, id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 95) {
        progress = 95; // Hold at 95% until submit
        clearInterval(interval);
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 95, status: "ready" } : u))
        );
      } else {
        setUploading((prev) =>
          prev.map((u) => (u.id === id && u.status === "uploading" ? { ...u, progress } : u))
        );
      }
    }, 200);
    return interval;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const validFiles = Array.from(files).filter((f) => f.size <= 50 * 1024 * 1024); // 50MB limit

      if (validFiles.length < files.length) {
        alert("Some files exceeded the 50MB limit and were skipped.");
      }

      const newUploads: UploadingFile[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        url: URL.createObjectURL(file),
        status: "uploading" as const,
      }));

      setUploading((prev) => [...prev, ...newUploads]);

      // Start background uploads
      newUploads.forEach((u) => simulateUpload(u.file, u.id));

      // Add to media immediately with preview URLs
      const newMedia: ProductMedia[] = newUploads.map((u, i) => ({
        id: u.id,
        url: u.url,
        type: u.file.type.startsWith("video") ? "video" : "image",
        isMain: media.length === 0 && i === 0,
        isThumbnail: false,
      }));
      onChange([...media, ...newMedia]);
    },
    [media, onChange]
  );

  const remove = (id: string) => {
    // Cancel upload if in progress
    setUploading((prev) => prev.filter((u) => u.id !== id));
    onChange(media.filter((m) => m.id !== id));
  };

  const setMain = (id: string) =>
    onChange(media.map((m) => ({ ...m, isMain: m.id === id })));

  const getUploadStatus = (id: string) => uploading.find((u) => u.id === id);

  // Finalize all uploads (called externally or on submit)
  const finalizeUploads = () => {
    setUploading((prev) =>
      prev.map((u) => (u.status === "ready" ? { ...u, progress: 100, status: "ready" } : u))
    );
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
        <span className="text-sm text-muted-foreground">Click or drop files (max 50MB each)</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {media.map((m) => {
            const uploadStatus = getUploadStatus(m.id);
            const isUploading = uploadStatus && uploadStatus.status === "uploading";

            return (
              <div
                key={m.id}
                className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${m.isMain ? "border-primary" : "border-border"}`}
              >
                {m.type === "image" ? (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-foreground/60 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                    <div className="w-3/4">
                      <Progress value={uploadStatus.progress} className="h-1.5" />
                    </div>
                    <span className="text-[10px] text-primary-foreground font-medium">
                      {Math.round(uploadStatus.progress)}%
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setMain(m.id)} className="p-1 bg-card rounded text-xs font-medium">
                    Main
                  </button>
                  <button onClick={() => remove(m.id)} className="p-1 bg-destructive text-destructive-foreground rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {m.isMain && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Main
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
