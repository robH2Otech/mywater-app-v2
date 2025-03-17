
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkMobileSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on mount
    checkMobileSize()
    
    // Add event listener with debounce for performance
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(checkMobileSize, 100);
    };
    
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId);
    }
  }, [])

  return isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(
    typeof window !== "undefined" 
      ? window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT 
      : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkTabletSize = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    // Check on mount
    checkTabletSize()
    
    // Add event listener with debounce for performance
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(checkTabletSize, 100);
    };
    
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId);
    }
  }, [])

  return isTablet
}

export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  }
}
