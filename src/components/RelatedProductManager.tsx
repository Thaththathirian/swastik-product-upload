import { useState } from "react";
import { Check, ChevronsUpDown, X, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useProductStore } from "@/store/productStore";
import { Badge } from "@/components/ui/badge";

interface RelatedProductManagerProps {
    selectedIds: string[];
    currentProductId?: string;
    onChange: (ids: string[]) => void;
    readOnly?: boolean;
}

export function RelatedProductManager({
    selectedIds,
    currentProductId,
    onChange,
    readOnly,
}: RelatedProductManagerProps) {
    const [open, setOpen] = useState(false);
    const products = useProductStore((state) => state.products);

    // Filter out the current product and already selected ones from the dropdown content if needed,
    // but usually it's better to show them as "checked" or disabled.
    const availableProducts = products.filter((p) => p.id !== currentProductId);

    const toggleProduct = (id: string) => {
        if (readOnly) return;
        const next = selectedIds.includes(id)
            ? selectedIds.filter((sid) => sid !== id)
            : [...selectedIds, id];
        onChange(next);
    };

    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

    return (
        <div className="space-y-4">
            {!readOnly && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-11 px-4 border-2 border-dashed border-muted-hover hover:border-primary/50 hover:bg-muted/30 transition-all rounded-xl"
                        >
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Search className="w-4 h-4" />
                                <span>Search products to link...</span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command className="rounded-lg border shadow-md">
                            <CommandInput placeholder="Search by name or SKU..." className="h-11" />
                            <CommandList className="max-h-[300px]">
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup>
                                    {availableProducts.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            value={`${product.name} ${product.sku}`}
                                            onSelect={() => {
                                                toggleProduct(product.id);
                                            }}
                                            className="flex items-center gap-3 p-3 cursor-pointer"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted overflow-hidden">
                                                {product.media?.[0]?.url ? (
                                                    <img src={product.media[0].url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-medium truncate">{product.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{product.sku || "No SKU"}</span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "ml-auto flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    selectedIds.includes(product.id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className="h-3 w-3" />
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {selectedProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedProducts.map((p) => (
                        <div
                            key={p.id}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-xl border-2 border-border bg-card transition-all group",
                                !readOnly && "hover:border-primary/30"
                            )}
                        >
                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden border border-border shrink-0">
                                {p.media?.[0]?.url ? (
                                    <img src={p.media[0].url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-bold truncate tracking-tight">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{p.sku || "No SKU"}</span>
                            </div>
                            {!readOnly && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => toggleProduct(p.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
