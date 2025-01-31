import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-spotify-dark flex">
      <div className="fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};