
import { useParams } from 'react-router-dom';
import { useUnitLocation } from '@/hooks/locations/useUnitLocation';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { UnitLocationMap } from '@/components/locations/UnitLocationMap';
import { UnitLocationDetails } from '@/components/locations/UnitLocationDetails';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { UnitData } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';

const UnitLocationPage = () => {
  const { iccid } = useParams<{ iccid: string }>();
  
  console.log('UnitLocationPage - ICCID from params:', iccid);
  
  // Fetch unit details based on ICCID
  const { data: unit, isLoading: isLoadingUnit, error: unitError } = useQuery({
    queryKey: ['unit-by-iccid', iccid],
    queryFn: async () => {
      if (!iccid) {
        console.error('UnitLocationPage - No ICCID provided');
        return null;
      }
      
      console.log(`UnitLocationPage - Fetching unit details for ICCID: ${iccid}`);
      
      try {
        // Clean the ICCID for querying
        const cleanIccid = iccid.replace(/\s+/g, '').trim();
        console.log(`UnitLocationPage - Using clean ICCID: ${cleanIccid}`);
        
        // Query for unit with matching ICCID
        const unitsCollection = await getDocs(query(
          collection(db, "units"), 
          where("iccid", "==", cleanIccid)
        ));
        
        if (!unitsCollection.empty) {
          const unitDoc = unitsCollection.docs[0];
          console.log(`UnitLocationPage - Found unit with ID: ${unitDoc.id}`);
          const unitData = unitDoc.data();
          return {
            id: unitDoc.id,
            name: unitData.name || 'Unknown Unit',
            iccid: unitData.iccid,
            ...unitData
          } as UnitData;
        }
        
        // Try partial match as fallback
        console.log("UnitLocationPage - No exact match, trying partial match");
        const allUnits = await getDocs(collection(db, "units"));
        const matchingUnits = allUnits.docs.filter(doc => {
          const unitData = doc.data();
          return unitData.iccid && (
            unitData.iccid.includes(cleanIccid) || cleanIccid.includes(unitData.iccid)
          );
        });
        
        if (matchingUnits.length > 0) {
          const unitDoc = matchingUnits[0];
          console.log(`UnitLocationPage - Found partial match with ID: ${unitDoc.id}`);
          const unitData = unitDoc.data();
          return {
            id: unitDoc.id,
            name: unitData.name || 'Unknown Unit',
            iccid: unitData.iccid,
            ...unitData
          } as UnitData;
        }
        
        console.log("UnitLocationPage - No unit found with this ICCID");
        return null;
      } catch (error) {
        console.error("UnitLocationPage - Error fetching unit:", error);
        throw error;
      }
    },
    enabled: !!iccid
  });

  // Use the location hook to get and update location data
  const { locationData, isLoading: isLoadingLocation, error, refreshLocation } = 
    useUnitLocation(unit?.id, unit?.iccid || iccid);

  const isLoading = isLoadingUnit || isLoadingLocation;
  
  const handleRefresh = () => {
    console.log('UnitLocationPage - Refreshing location data');
    refreshLocation();
  };

  // Handle case where no ICCID is provided
  if (!iccid) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Unit Location"
          description="No ICCID specified"
        />
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <p>No ICCID provided in the URL. Please select a unit from the locations page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle unit not found
  if (!isLoadingUnit && !unit && !unitError) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Unit Location"
          description={`No unit found with ICCID: ${iccid}`}
        />
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              <p>No unit found with ICCID: {iccid}. Please check the ICCID and try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {unitError && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <p>Error loading unit data: {unitError instanceof Error ? unitError.message : 'Unknown error'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnitLocationPage;
