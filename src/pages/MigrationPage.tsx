
import React from "react";
import { MigrationGuide } from "@/components/migration/MigrationGuide";
import { PageHeader } from "@/components/shared/PageHeader";
import { Layout } from "@/components/layout/Layout";

export default function MigrationPage() {
  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title="MYWATER to X-WATER Migration"
          description="Follow this guide to migrate your app from MYWATER to X-WATER"
        />
        <div className="mt-6">
          <MigrationGuide />
        </div>
      </div>
    </Layout>
  );
}
