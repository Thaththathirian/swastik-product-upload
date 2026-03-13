import { AppLayout } from "@/components/AppLayout";
import { useProductStore } from "@/store/productStore";
import { Package, TrendingUp, AlertTriangle, Star } from "lucide-react";

const Dashboard = () => {
  const products = useProductStore((s) => s.products);
  const active = products.filter((p) => p.isActive).length;
  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockWarning && p.stockQuantity > 0).length;
  const featured = products.filter((p) => p.isFeatured).length;

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Active Products", value: active, icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "bg-warning/10 text-warning" },
    { label: "Featured", value: featured, icon: Star, color: "bg-accent/10 text-accent" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your product catalog</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="form-section flex items-center gap-3 !p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="form-section text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No products yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Start by adding your first product to the catalog.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="form-section">
            <h2 className="section-title">Recent Products</h2>
            <div className="grid gap-3 mt-3">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {p.media[0] ? (
                      <img src={p.media[0].url} alt="" className="w-10 h-10 rounded-md object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
