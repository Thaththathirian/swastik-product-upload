import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit, Package, Eye, ChevronDown, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProductThumbnail = ({ url }: { url?: string }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="w-9 h-9 rounded-md object-cover shrink-0"
      onError={() => setError(true)}
    />
  );
};

const ProductList = () => {
  const { products, deleteProduct, updateProduct, fetchProducts } = useProductStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: boolean) => {
    await updateProduct(id, { isActive: !currentStatus });
    toast.success(`Product marked as ${!currentStatus ? "Active" : "Inactive"}`);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{products.length} products in catalog</p>
          </div>
          <Link to="/products/new">
            <Button className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <div className="form-section text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{search ? "No products match your search" : "No products yet"}</p>
          </div>
        ) : (
          <div className="form-section !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-center p-3 font-medium text-muted-foreground w-12">SI</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden lg:table-cell">Code</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden md:table-cell">SKU</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, index) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-center text-muted-foreground font-medium">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <ProductThumbnail url={p.media[0]?.url} />
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase lg:hidden text-center">{p.productCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell font-mono text-[11px] font-bold text-center">{p.productCode}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell text-center">{p.sku}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell text-center">{p.category}</td>
                      <td className="p-3 text-center font-medium">₹{p.sellingPrice.toLocaleString()}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.stockQuantity <= p.lowStockWarning ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 transition-all outline-none ${p.isActive ? "bg-success/10 text-success hover:bg-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}>
                              {p.isActive ? "Active" : "Inactive"}
                              <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-32">
                            <DropdownMenuItem
                              disabled={p.isActive === true}
                              onClick={() => handleStatusUpdate(p.id, false)}
                              className="flex items-center justify-between focus:bg-success/10 focus:text-success font-medium"
                            >
                              Active
                              {p.isActive && <Check className="w-3 h-3 text-success" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={p.isActive === false}
                              onClick={() => handleStatusUpdate(p.id, true)}
                              className="flex items-center justify-between text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
                            >
                              Inactive
                              {!p.isActive && <Check className="w-3 h-3" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/products/view/${p.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Link to={`/products/edit/${p.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              setDeleteId(p.id);
                              setDeleteName(p.name);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-bold text-foreground">"{deleteName}"</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default ProductList;
