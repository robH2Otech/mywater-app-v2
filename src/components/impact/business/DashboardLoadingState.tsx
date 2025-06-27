
import React from "react";

export function DashboardLoadingState() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-32 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-teal-900/20 border border-blue-500/40 rounded-lg"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-96 bg-spotify-darker border border-spotify-accent/30 rounded-lg"></div>
      </div>
    </div>
  );
}
