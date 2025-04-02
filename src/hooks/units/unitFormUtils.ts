
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { UnitFormData } from "./unitFormTypes";

export const getNextUnitNumber = async (): Promise<number> => {
  try {
    const unitsCollection = collection(db, "units");
    const unitsSnapshot = await getDocs(unitsCollection);
    
    let highestNumber = 0;
    
    unitsSnapshot.forEach(docSnapshot => {
      const unitName = docSnapshot.data().name || "";
      if (unitName.startsWith("MYWATER ")) {
        const numberPart = unitName.replace("MYWATER ", "");
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > highestNumber) {
          highestNumber = number;
        }
      }
    });
    
    return highestNumber + 1;
  } catch (error) {
    console.error("Error fetching next unit number:", error);
    return 1; // Default to 1 if error
  }
};

export const prepareUnitData = (formData: UnitFormData, nextUnitNumber: number) => {
  // Parse volume to numeric value
  const numericVolume = parseFloat(formData.total_volume);
  
  // Determine the status based on the volume
  const status = determineUnitStatus(numericVolume);
  
  // Create a custom ID in the format MYWATER_XXX
  const formattedNumber = String(nextUnitNumber).padStart(3, '0');
  const customId = `MYWATER_${formattedNumber}`;
  
  // Prepare base unit data
  const unitData: any = {
    name: formData.name,
    location: formData.location || null,
    total_volume: numericVolume,
    status: status,
    contact_name: formData.contact_name || null,
    contact_email: formData.contact_email || null,
    contact_phone: formData.contact_phone || null,
    next_maintenance: formData.next_maintenance?.toISOString() || null,
    setup_date: formData.setup_date?.toISOString() || null,
    eid: formData.eid || null,
    iccid: formData.iccid || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unit_type: formData.unit_type,
  };

  // Add UVC-specific data if UVC unit type
  if (formData.unit_type === 'uvc') {
    const uvcHours = formData.uvc_hours ? parseFloat(formData.uvc_hours) : 0;
    unitData.uvc_hours = uvcHours;
    unitData.uvc_status = determineUVCStatus(uvcHours);
    unitData.uvc_installation_date = formData.setup_date?.toISOString() || null;
  }

  return { unitData, customId, status };
};

export const getDefaultFormData = (unitNumber: number): UnitFormData => ({
  name: `MYWATER ${String(unitNumber).padStart(3, '0')}`,
  location: "",
  total_volume: "",
  status: "active",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  next_maintenance: null,
  setup_date: null,
  uvc_hours: "",
  eid: "",
  iccid: "",
  unit_type: "uvc", // Default to UVC unit
});
