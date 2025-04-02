
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { createAlertMessage } from "@/utils/unitStatusUtils";
import { createUVCAlertMessage } from "@/utils/uvcStatusUtils";

export const createUnitAlert = async (
  unitId: string,
  unitName: string,
  numericVolume: number,
  status: string
) => {
  if (status !== 'warning' && status !== 'urgent') return;
  
  const alertMessage = createAlertMessage(unitName, numericVolume, status);
  
  // Add a new alert to the alerts collection
  const alertsCollection = collection(db, "alerts");
  await addDoc(alertsCollection, {
    unit_id: unitId,
    message: alertMessage,
    status: status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};

export const createUVCAlert = async (
  unitId: string,
  unitName: string,
  uvcHours: number,
  uvcStatus: string
) => {
  if (uvcStatus !== 'warning' && uvcStatus !== 'urgent') return;
  
  const uvcAlertMessage = createUVCAlertMessage(unitName, uvcHours, uvcStatus);
  
  const alertsCollection = collection(db, "alerts");
  await addDoc(alertsCollection, {
    unit_id: unitId,
    message: uvcAlertMessage,
    status: uvcStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};
