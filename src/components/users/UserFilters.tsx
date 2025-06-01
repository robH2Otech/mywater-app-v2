
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (company: string) => void;
  companies: string[];
  canAccessAllCompanies: boolean;
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  companyFilter,
  onCompanyFilterChange,
  companies,
  canAccessAllCompanies
}: UserFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-6`}>
      <div className="flex-1">
        <Input 
          placeholder="Search users by name or email..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-spotify-accent border-spotify-accent-hover text-white"
        />
      </div>
      
      {canAccessAllCompanies && companies.length > 0 && (
        <div className={isMobile ? 'w-full' : 'w-[200px]'}>
          <Select value={companyFilter} onValueChange={onCompanyFilterChange}>
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company} value={company || ""}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
