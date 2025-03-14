
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-black flex">
      <div className="fixed">
        <Sidebar />
      </div>
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-4 md:p-6 max-w-[2000px] mx-auto">{children}</main>
      </div>
    </div>
  );
};
