
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function StoredLocationNote() {
  return (
    <Card className="bg-spotify-darker">
      <CardContent className="p-4 text-sm text-gray-400 flex items-center">
        <Clock className="h-4 w-4 mr-2 text-spotify-accent" />
        Location data is stored for 24 hours and then automatically refreshed.
      </CardContent>
    </Card>
  );
}
