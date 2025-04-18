
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CartridgeDonutChart } from "./CartridgeDonutChart";
import { Edit } from "lucide-react";
import { PrivateUser } from "@/types/privateUser";
import { format } from "date-fns";
import { useOrderHistory } from "@/hooks/dashboard/useOrderHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PrivateUserProfileDisplayProps {
  userData: PrivateUser | null;
  onEdit: () => void;
  cartridgeUsagePercent: number;
}

export function PrivateUserProfileDisplay({ 
  userData, 
  onEdit,
  cartridgeUsagePercent 
}: PrivateUserProfileDisplayProps) {
  const { orders, loading: ordersLoading } = useOrderHistory(userData?.uid);
  
  if (!userData) return <p>No user data available</p>;
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Your personal details</p>
              </div>
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{userData.first_name} {userData.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{userData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{userData.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{userData.address || "Not provided"}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">Device Information</h3>
                <p className="text-sm text-muted-foreground">Your MYWATER device details</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purifier Model</p>
                    <p>{userData.purifier_model || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                    <p>{userData.purchase_date ? format(userData.purchase_date, "PPP") : "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Cartridge Replacement</p>
                    <p>{userData.cartridge_replacement_date ? format(userData.cartridge_replacement_date, "PPP") : "Not available"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <CartridgeDonutChart percentUsed={cartridgeUsagePercent} />
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Order History</h3>
            
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">Loading order history...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.order_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.created_at ? format(order.created_at, "PPP") : "Date not available"}
                        </p>
                      </div>
                      <p className="font-medium">{order.total} {order.currency}</p>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {order.products?.map((product, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <p>{product.name} x{product.quantity}</p>
                          <p>{product.price * product.quantity} {order.currency}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <p className="font-medium">Shipping Address:</p>
                      <p>{order.shipping_address?.address}, {order.shipping_address?.city}</p>
                      <p>{order.shipping_address?.postal_code}, {order.shipping_address?.country}</p>
                    </div>
                    
                    {order.discount_code && (
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Discount Code: </span> 
                        {order.discount_code}
                      </p>
                    )}
                    
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No order history found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
