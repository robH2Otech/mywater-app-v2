
import { useState } from "react";
import { UserCard } from "./UserCard";
import { User } from "@/types/users";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  const isMobile = useIsMobile();
  const { canAccessAllCompanies, company: userCompany } = usePermissions();
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique companies from users
  const companies = [...new Set(users.map(user => user.company).filter(Boolean))];

  // Filter users based on search query and company filter
  const filteredUsers = users.filter(user => {
    // Filter by company if not viewing all and user has permission to view all companies
    if (canAccessAllCompanies && companyFilter !== "all" && user.company !== companyFilter) {
      return false;
    }
    
    // Filter by user's company if they can't access all companies
    if (!canAccessAllCompanies && user.company !== userCompany) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query);
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-6`}>
        <div className="flex-1">
          <Input 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-spotify-accent border-spotify-accent-hover text-white"
          />
        </div>
        
        {canAccessAllCompanies && companies.length > 0 && (
          <div className={isMobile ? 'w-full' : 'w-[200px]'}>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
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

      {/* Users Grid */}
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => onUserClick(user)}
            />
          ))
        ) : (
          <Card className="col-span-full p-6 text-center bg-spotify-darker border-spotify-accent">
            <p className="text-gray-400">
              {searchQuery || companyFilter !== "all" 
                ? "No users match your filters" 
                : "No users found"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
