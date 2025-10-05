import PointsInitializer from '@/components/auth/PointsInitializer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PointsInitializer />
      <main>{children}</main>
    </>
  );
}