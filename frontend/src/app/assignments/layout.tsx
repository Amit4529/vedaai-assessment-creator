import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="no-print">
        <Sidebar />
      </div>
      <div className="content-container md:ml-[260px] min-h-screen pb-20 md:pb-0">
        {children}
      </div>
      <div className="no-print">
        <MobileNav />
      </div>
    </div>
  );
}
