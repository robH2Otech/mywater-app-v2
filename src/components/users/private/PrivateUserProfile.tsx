import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, Mail, Phone, MapPin } from "lucide-react";
import { PrivateUser } from "@/types/privateUser";
import { format } from "date-fns";
import { useOrderHistory } from "@/hooks/dashboard/useOrderHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PrivateUserProfileProps {
  userData: PrivateUser | null;
  onEdit: () => void;
}

export function PrivateUserProfile({ userData, onEdit }: PrivateUserProfileProps) {
  const { orders, loading: ordersLoading } = useOrderHistory(userData?.uid);
  
  if (!userData) return <p>No user data available</p>;
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-gradient-to-r from-blue-900/50 to-cyan-900/50">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="device">Device Details</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/30 border-slate-700/50 transition-all duration-300 hover:bg-slate-800/40">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">Personal Information</h3>
                <p className="text-sm text-blue-300/80">Your personal details</p>
              </div>
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <p className="text-sm font-medium text-blue-300/80">Name</p>
                </div>
                <p className="text-white pl-6">{userData.first_name} {userData.last_name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <p className="text-sm font-medium text-blue-300/80">Email</p>
                </div>
                <p className="text-white pl-6">{userData.email}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <p className="text-sm font-medium text-blue-300/80">Phone</p>
                </div>
                <p className="text-white pl-6">{userData.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <p className="text-sm font-medium text-blue-300/80">Address</p>
                </div>
                <p className="text-white pl-6">{userData.address || "Not provided"}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="device">
          <Card className="p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/30 border-slate-700/50">
            <div>
              <h3 className="text-lg font-medium text-white">Device Information</h3>
              <p className="text-sm text-blue-300/80">Your MYWATER device details</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-300/80">Purifier Model</p>
                  <p className="text-white">{userData.purifier_model || "Not available"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-300/80">Purchase Date</p>
                  <p className="text-white">{userData.purchase_date ? format(userData.purchase_date, "PPP") : "Not available"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-300/80">Next Cartridge Replacement</p>
                  <p className="text-white">{userData.cartridge_replacement_date ? format(userData.cartridge_replacement_date, "PPP") : "Not available"}</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card className="p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/30 border-slate-700/50">
            <h3 className="text-lg font-medium text-white mb-4">Order History</h3>
            
            {ordersLoading ? (
              <p className="text-sm text-blue-300/80">Loading order history...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="border border-blue-800/30 rounded-lg p-4 bg-blue-950/30">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-white">Order #{order.order_id}</p>
                        <p className="text-sm text-blue-300/80">
                          {order.created_at ? format(order.created_at, "PPP") : "Date not available"}
                        </p>
                      </div>
                      <p className="font-medium text-white">{order.total} {order.currency}</p>
                    </div>
                    
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        order.status === 'completed' ? 'bg-green-900/50 text-green-300' : 
                        order.status === 'processing' ? 'bg-blue-900/50 text-blue-300' : 
                        'bg-gray-900/50 text-gray-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-300/80">No order history found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
