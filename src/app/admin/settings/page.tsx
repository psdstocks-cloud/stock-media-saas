import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockSitesManager } from "@/components/admin/settings/StockSitesManager";

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      </div>
      <Tabs defaultValue="stock-sites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock-sites">Stock Sites</TabsTrigger>
          <TabsTrigger value="plans" disabled>Plans & Pricing (Coming Soon)</TabsTrigger>
          <TabsTrigger value="webhooks" disabled>Webhooks (Coming Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="stock-sites" className="space-y-4">
          <StockSitesManager />
        </TabsContent>
        {/* Placeholder for future tabs */}
        <TabsContent value="plans">
          <div>Manage your subscription plans and point packs here.</div>
        </TabsContent>
         <TabsContent value="webhooks">
          <div>Manage your webhook configurations here.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}