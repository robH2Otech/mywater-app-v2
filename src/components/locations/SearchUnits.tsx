
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchUnitsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchUnits({ searchQuery, setSearchQuery }: SearchUnitsProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search units by name, site, customer or ICCID..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="pl-10 bg-spotify-darker text-white border-spotify-accent focus-visible:ring-spotify-accent"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          onClick={handleClearSearch}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
