import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageCropperModalProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    open: boolean;
}

export function ImageCropperModal({ image, onCropComplete, onCancel, open }: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onCropCompleteLocal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="sm:max-w-[700px] h-[750px] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Adjust Image</DialogTitle>
                </DialogHeader>

                <div className="flex-1 relative mt-4 bg-muted">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteLocal}
                        onZoomChange={setZoom}
                    />
                </div>

                <DialogFooter className="p-6 bg-background border-t border-border">
                    <div className="w-full space-y-5">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aspect Ratio</span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "Free", value: undefined },
                                    { label: "1:1", value: 1 },
                                    { label: "4:3", value: 4 / 3 },
                                    { label: "16:9", value: 16 / 9 },
                                    { label: "2:3", value: 2 / 3 },
                                ].map((item) => (
                                    <Button
                                        key={item.label}
                                        variant={aspect === item.value ? "default" : "outline"}
                                        size="sm"
                                        className="h-8 text-xs px-3"
                                        onClick={() => setAspect(item.value)}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[40px]">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleCrop}>Save Changes</Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
