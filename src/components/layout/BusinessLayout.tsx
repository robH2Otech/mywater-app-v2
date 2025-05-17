
import { ReactNode } from "react";
import { Layout } from "./Layout";

interface BusinessLayoutProps {
  children: ReactNode;
}

export const BusinessLayout = ({ children }: BusinessLayoutProps) => {
  return (
    <Layout>
      {children}
    </Layout>
  );
};
