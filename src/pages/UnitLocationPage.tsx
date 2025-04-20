
import { useParams } from 'react-router-dom';
import { useUnitLocation } from '@/hooks/locations/useUnitLocation';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { UnitLocationMap } from '@/components/locations/UnitLocationMap';
import { UnitLocationDetails } from '@/components/locations/UnitLocationDetails';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { UnitData } from '@/types/analytics';

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  
  // Fetch unit details based on ICCID
  const { data: unit, isLoading: isLoadingUnit } = useQuery({
    queryKey: ['unit-by-iccid', iccid],
    queryFn: async () => {
      if (!iccid) return null;
      console.log(`Fetching unit details for ICCID: ${iccid}`);
      
      // Query for unit with matching ICCID
      try {
        // Try to get the unit directly if we know the ID format
        const unitsCollection = await getDocs(query(
          collection(db, "units"), 
          where("iccid", "==", iccid)
        ));
        
        if (!unitsCollection.empty) {
          const unitDoc = unitsCollection.docs[0];
          console.log(`Found unit with ID: ${unitDoc.id}`);
          const unitData = unitDoc.data();
          return {
            id: unitDoc.id,
            name: unitData.name || 'Unknown Unit',
            ...unitData
          } as UnitData;
        }
        
        console.log("No unit found with this ICCID");
        return null;
      } catch (error) {
        console.error("Error fetching unit:", error);
        return null;
      }
    },
    enabled: !!iccid
  });

  // Use the location hook to get and update location data
  const { locationData, isLoading: isLoadingLocation, error, refreshLocation } = 
    useUnitLocation(unit?.id, iccid);

  const isLoading = isLoadingUnit || isLoadingLocation;
  
  const handleRefresh = () => {
    refreshLocation();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={unit?.name || 'Unit Location'}
          description={`Location data for ICCID: ${iccid || '---'}`}
        />
        
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Location
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UnitLocationMap 
            locationData={locationData} 
            isLoading={isLoading} 
          />
        </div>
        
        <div>
          <UnitLocationDetails 
            locationData={locationData}
            unitName={unit?.name || 'Unknown Unit'}
            iccid={iccid || '---'}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
