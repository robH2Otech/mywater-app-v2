
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

export function MigrationGuide() {
  const [migrationStatus, setMigrationStatus] = React.useState<{
    [key: string]: "pending" | "completed" | "error"
  }>({
    firebaseConfig: "completed",
    collections: "pending",
    cloudFunctions: "pending",
    emailIntegration: "completed",
    authentication: "pending",
    storage: "pending",
    testing: "pending"
  });

  const updateStatus = (key: string, status: "pending" | "completed" | "error") => {
    setMigrationStatus(prev => ({
      ...prev,
      [key]: status
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">X-WATER Migration Guide</CardTitle>
        <CardDescription>
          Track your progress as you migrate from MYWATER to X-WATER
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MigrationStep
            title="1. Update Firebase Configuration"
            description="Replace Firebase config with X-WATER project details"
            status={migrationStatus.firebaseConfig}
            onComplete={() => updateStatus("firebaseConfig", "completed")}
          />
          
          <MigrationStep
            title="2. Create Firestore Collections"
            description="Set up all required collections in the new Firestore database"
            status={migrationStatus.collections}
            onComplete={() => updateStatus("collections", "completed")}
          />
          
          <MigrationStep
            title="3. Deploy Cloud Functions"
            description="Update and deploy Cloud Functions for X-WATER"
            status={migrationStatus.cloudFunctions}
            onComplete={() => updateStatus("cloudFunctions", "completed")}
          />
          
          <MigrationStep
            title="4. Update Email Integration"
            description="Configure EmailJS for X-WATER"
            status={migrationStatus.emailIntegration}
            onComplete={() => updateStatus("emailIntegration", "completed")}
          />
          
          <MigrationStep
            title="5. Set Up Authentication"
            description="Enable required authentication providers"
            status={migrationStatus.authentication}
            onComplete={() => updateStatus("authentication", "completed")}
          />
          
          <MigrationStep
            title="6. Configure Storage"
            description="Set up Firebase Storage for X-WATER"
            status={migrationStatus.storage}
            onComplete={() => updateStatus("storage", "completed")}
          />
          
          <MigrationStep
            title="7. Test Functionality"
            description="Verify all features work with the new X-WATER backend"
            status={migrationStatus.testing}
            onComplete={() => updateStatus("testing", "completed")}
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Once all steps are completed, your app will be fully migrated to X-WATER.
        </div>
      </CardFooter>
    </Card>
  );
}

interface MigrationStepProps {
  title: string;
  description: string;
  status: "pending" | "completed" | "error";
  onComplete: () => void;
}

function MigrationStep({ title, description, status, onComplete }: MigrationStepProps) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-md bg-card">
      <div className="mt-1">
        {status === "completed" ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : status === "error" ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-muted" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={status === "completed" ? "outline" : "default"}
        size="sm"
        onClick={onComplete}
        disabled={status === "completed"}
      >
        {status === "completed" ? "Completed" : "Mark Complete"}
      </Button>
    </div>
  );
}
