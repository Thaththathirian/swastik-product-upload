import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ProductList = () => {
  const { products, deleteProduct } = useProductStore();
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
      toast.success("Product deleted");
    }
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
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {p.media[0] ? (
                            <img src={p.media[0].url} alt="" className="w-9 h-9 rounded-md object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{p.sku}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                      <td className="p-3 text-right font-medium">₹{p.sellingPrice.toLocaleString()}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.stockQuantity <= p.lowStockWarning ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/products/edit/${p.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id, p.name)}>
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
      </div>
    </AppLayout>
  );
};

export default ProductList;
