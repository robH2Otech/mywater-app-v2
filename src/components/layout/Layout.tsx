
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-spotify-dark flex">
      <div className={isMobile ? "hidden" : "fixed"}>
        <Sidebar />
      </div>
      <div className={`flex-1 ${isMobile ? "pl-0" : "pl-64"}`}>
        <Header />
        <main className="p-3 md:p-4 lg:p-6 max-w-[2000px] mx-auto">{children}</main>
      </div>
    </div>
  );
};
