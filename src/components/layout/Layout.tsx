import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-spotify-dark">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="container mx-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
};