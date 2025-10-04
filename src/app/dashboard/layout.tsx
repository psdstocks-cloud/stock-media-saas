import Header from '@/components/layout/header';
import PointsInitializer from '@/components/auth/PointsInitializer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PointsInitializer />
      <Header />
      <main>{children}</main>
    </>
  );
}