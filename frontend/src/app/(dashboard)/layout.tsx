import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { AuthProvider } from '@/components/layout/AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-64">
          <Header />
          <main className="p-4 pb-24 lg:p-8 lg:pb-12">{children}</main>
        </div>
        <MobileNav />
      </div>
    </AuthProvider>
  );
}
