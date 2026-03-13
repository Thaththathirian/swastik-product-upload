import { AppLayout } from "@/components/AppLayout";

const SettingsPage = () => (
  <AppLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Application configuration</p>
      </div>
      <div className="form-section text-center py-16">
        <p className="text-muted-foreground">Settings page — coming soon.</p>
      </div>
    </div>
  </AppLayout>
);

export default SettingsPage;
