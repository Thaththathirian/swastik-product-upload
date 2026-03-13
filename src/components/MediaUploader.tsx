import { useCallback, useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2, GripVertical, Play } from "lucide-react";
import { ProductMedia } from "@/types/product";
import { Progress } from "@/components/ui/progress";
import { ImageCropperModal } from "./ImageCropperModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MediaUploaderProps {
  media: ProductMedia[];
  onChange: (media: ProductMedia[]) => void;
  readOnly?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  url: string;
  status: "uploading" | "ready" | "cancelled";
}

interface SortableMediaItemProps {
  m: ProductMedia;
  isMain: boolean;
  onSetMain: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (m: ProductMedia) => void;
  uploadStatus?: UploadingFile;
  readOnly?: boolean;
}

function SortableMediaItem({ m, onSetMain, onRemove, onEdit, uploadStatus, readOnly }: SortableMediaItemProps) {
  const [imgError, setImgError] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isUploading = uploadStatus && uploadStatus.status === "uploading";

  const handleEditClick = (e: React.MouseEvent) => {
    if (readOnly || isUploading) return;
    onEdit(m);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 aspect-square bg-background transition-all ${!readOnly ? "cursor-pointer" : ""} ${m.isMain ? "border-primary shadow-sm" : "border-border hover:border-primary/50 hover:shadow-md"} ${isDragging ? "opacity-50 z-50 shadow-xl" : ""}`}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      onClick={handleEditClick}
    >
      {m.type === "image" ? (
        !imgError ? (
          <img
            src={m.url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground/30">
            <ImageIcon className="w-8 h-8 opacity-20" />
            <span className="text-[10px] mt-2 font-medium">Broken Image</span>
          </div>
        )
      ) : (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video src={m.url} className="w-full h-full object-cover opacity-60" muted />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <span className="absolute bottom-2 left-2 bg-black/50 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
            Video
          </span>
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

      {!readOnly && (
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-2">
          <div className="flex gap-1.5" onPointerDown={e => e.stopPropagation()}>
            {!m.isMain && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetMain(m.id);
                }}
                className="p-1.5 px-3 bg-white text-black rounded-md text-[10px] font-bold uppercase shadow-sm transition-all hover:bg-primary hover:text-white"
              >
                Main
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(m.id);
              }}
              className="p-1.5 bg-destructive text-destructive-foreground rounded-md shadow-sm transition-all hover:scale-105"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute bottom-2 right-2 p-1 bg-white/20 rounded backdrop-blur-sm pointer-events-none">
            <GripVertical className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {m.isMain && (
        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm z-10">
          MAIN
        </span>
      )}
    </div>
  );
}

export function MediaUploader({ media, onChange, readOnly }: MediaUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [cropQueue, setCropQueue] = useState<{ id: string; url: string; type: string; originalUrl: string }[]>([]);
  const [currentCropping, setCurrentCropping] = useState<{ id: string; url: string; type: string; originalUrl: string } | null>(null);
  const [editingMedia, setEditingMedia] = useState<ProductMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 95) {
        progress = 95;
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
      const validFiles = Array.from(files);

      const newQueue = validFiles.map((file) => {
        const url = URL.createObjectURL(file);
        return {
          id: crypto.randomUUID(),
          url: url,
          originalUrl: url,
          type: file.type.startsWith("video") ? "video" : "image",
          file,
        };
      });

      const imagesToCrop = newQueue.filter((q) => q.type === "image");
      const videosToAdd = newQueue.filter((q) => q.type === "video");

      if (videosToAdd.length > 0) {
        const videoMedia: ProductMedia[] = videosToAdd.map((v) => ({
          id: v.id,
          url: v.url,
          originalUrl: v.url,
          type: "video",
          isMain: false,
          isThumbnail: false,
        }));

        const videoUploads = videosToAdd.map((v) => ({
          id: v.id,
          file: v.file,
          progress: 0,
          url: v.url,
          status: "uploading" as const,
        }));

        setUploading((prev) => [...prev, ...videoUploads]);
        videoUploads.forEach((u) => simulateUpload(u.id));
        onChange([...media, ...videoMedia]);
      }

      if (imagesToCrop.length > 0) {
        setCropQueue((prev) => [...prev, ...imagesToCrop.map(i => ({ id: i.id, url: i.url, type: i.type, originalUrl: i.url, file: i.file }))]);
      }
    },
    [media, onChange]
  );

  useEffect(() => {
    if (!currentCropping && cropQueue.length > 0) {
      setCurrentCropping(cropQueue[0]);
    }
  }, [cropQueue, currentCropping]);

  const onCropComplete = (croppedUrl: string) => {
    // Handling newly uploaded image
    if (currentCropping) {
      const newMedia: ProductMedia = {
        id: currentCropping.id,
        url: croppedUrl,
        originalUrl: currentCropping.originalUrl,
        type: "image",
        isMain: media.length === 0,
        isThumbnail: false,
      };

      const newUpload: UploadingFile = {
        id: currentCropping.id,
        file: (currentCropping as any).file,
        progress: 0,
        url: croppedUrl,
        status: "uploading",
      };

      setUploading((prev) => [...prev, newUpload]);
      simulateUpload(currentCropping.id);
      onChange([...media, newMedia]);

      setCropQueue((prev) => prev.slice(1));
      setCurrentCropping(null);
    }
    // Handling re-crop of existing image
    else if (editingMedia) {
      onChange(media.map(m => m.id === editingMedia.id ? { ...m, url: croppedUrl } : m));
      setEditingMedia(null);
    }
  };

  const onCropCancel = () => {
    if (currentCropping) {
      setCropQueue((prev) => prev.slice(1));
      setCurrentCropping(null);
    } else {
      setEditingMedia(null);
    }
  };

  const remove = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
    onChange(media.filter((m) => m.id !== id));
  };

  const setMain = (id: string) => {
    const item = media.find((m) => m.id === id);
    if (!item) return;

    const otherItems = media.filter((m) => m.id !== id).map((m) => ({ ...m, isMain: false }));
    const newMain = { ...item, isMain: true };

    onChange([newMain, ...otherItems]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((m) => m.id === active.id);
      const newIndex = media.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(media, oldIndex, newIndex);
      if (!readOnly) onChange(newOrder);
    }
  };

  const getUploadStatus = (id: string) => uploading.find((u) => u.id === id);

  return (
    <div className="space-y-4">
      {/* Cropper for new uploads */}
      {currentCropping && (
        <ImageCropperModal
          image={currentCropping.originalUrl}
          open={true}
          onCropComplete={onCropComplete}
          onCancel={onCropCancel}
        />
      )}

      {/* Cropper for re-editing existing media */}
      {editingMedia && (
        <ImageCropperModal
          image={editingMedia.originalUrl || editingMedia.url}
          open={true}
          onCropComplete={onCropComplete}
          onCancel={onCropCancel}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Media</h3>
            <span className="text-[11px] text-muted-foreground">({media.length} files)</span>
          </div>
          {media.length > 0 && !readOnly && (
            <span className="text-[11px] text-muted-foreground font-medium italic">Hint: Drag to reorder</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {/* Compact Upload Area as First Item */}
          {!readOnly && (
            <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden bg-muted/20">
              <div className="flex flex-col items-center justify-center text-center p-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">Upload</p>
                <p className="text-[9px] text-muted-foreground hidden sm:block">Click or Drop</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}

          {/* Media Items */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={media.map((m) => m.id)}
              strategy={horizontalListSortingStrategy}
            >
              {media.map((m) => (
                <SortableMediaItem
                  key={m.id}
                  m={m}
                  isMain={m.isMain}
                  onSetMain={setMain}
                  onRemove={remove}
                  onEdit={(item) => setEditingMedia(item)}
                  uploadStatus={getUploadStatus(m.id)}
                  readOnly={readOnly}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
