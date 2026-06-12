import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#000814]">
      <AdminSidebar onCollapseChange={setSidebarCollapsed} />
      <AdminTopBar sidebarCollapsed={sidebarCollapsed} />
      <main
        className="pt-[72px] pb-8 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '68px' : '240px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
