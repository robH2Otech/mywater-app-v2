
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";

export function ShopPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">MYWATER Shop</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Replacement Filter</CardTitle>
            <CardDescription>12-month water filter cartridge</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <img 
              src="/lovable-uploads/f2f80940-5fa8-45b6-a3dd-78b6282cf10e.png" 
              alt="Filter Cartridge" 
              className="h-40 object-contain"
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full flex justify-between items-center">
              <span className="text-lg font-bold">$59.99</span>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            <p className="text-xs text-gray-400">Free shipping • In stock</p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Filter Maintenance Kit</CardTitle>
            <CardDescription>Complete cleaning and maintenance set</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Package className="h-40 w-40 text-gray-400" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full flex justify-between items-center">
              <span className="text-lg font-bold">$24.99</span>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            <p className="text-xs text-gray-400">Free shipping • In stock</p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Premium Filter Bundle</CardTitle>
            <CardDescription>2 filters + maintenance kit</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Package className="h-40 w-40 text-gray-400" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full flex justify-between items-center">
              <span className="text-lg font-bold">$129.99</span>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            <p className="text-xs text-gray-400">Free shipping • In stock</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
