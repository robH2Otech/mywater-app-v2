
// Simplify this file to avoid circular dependencies
import { useToast as useHookToast, toast as hookToast } from "@/hooks/use-toast";

export const useToast = useHookToast;
export const toast = hookToast;
