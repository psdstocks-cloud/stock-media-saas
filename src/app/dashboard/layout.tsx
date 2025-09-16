import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-gray-100/40 p-4 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
}
