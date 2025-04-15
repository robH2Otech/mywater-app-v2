
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';

interface UnitWithLocation {
  id: string;
  name: string;
  iccid: string | null;
  site_name?: string;
  customer_name?: string;
}

export function useLocationsData() {
  const [units, setUnits] = useState<UnitWithLocation[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitWithLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const unitsCollection = collection(db, "units");
      const snapshot = await getDocs(unitsCollection);
      
      const allUnits = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed Unit",
          iccid: data.iccid || null,
          site_name: data.site_name,
          customer_name: data.customer_name
        };
      });
      
      const unitsWithLocation = allUnits.filter(unit => !!unit.iccid);
      
      setUnits(unitsWithLocation);
      setFilteredUnits(unitsWithLocation);

      if (unitsWithLocation.length > 0) {
        toast.success(`Found ${unitsWithLocation.length} units with location data`);
      } else {
        toast.info("No units with location data found");
      }
    } catch (err) {
      console.error("Error fetching units:", err);
      setError("Failed to load units. Please try again later.");
      toast.error("Failed to load units data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const normalizedQuery = query.replace(/\s+/g, "");
    
    const filtered = units.filter(unit => {
      const nameMatch = unit.name?.toLowerCase().includes(query);
      const normalizedName = unit.name?.toLowerCase().replace(/\s+/g, "");
      const nameMatchNormalized = normalizedName?.includes(normalizedQuery);
      const siteMatch = unit.site_name?.toLowerCase().includes(query);
      const customerMatch = unit.customer_name?.toLowerCase().includes(query);
      const iccidMatch = unit.iccid?.toLowerCase().includes(query);
      
      return nameMatch || nameMatchNormalized || siteMatch || customerMatch || iccidMatch;
    });
    
    setFilteredUnits(filtered);
  }, [searchQuery, units]);

  return {
    units,
    filteredUnits,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refreshUnits: fetchUnits
  };
}
