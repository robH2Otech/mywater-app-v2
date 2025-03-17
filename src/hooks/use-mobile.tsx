
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobileSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobileSize()
    
    // Add event listener
    window.addEventListener("resize", checkMobileSize)
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobileSize)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkTabletSize = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    // Initial check
    checkTabletSize()
    
    // Add event listener
    window.addEventListener("resize", checkTabletSize)
    
    // Cleanup
    return () => window.removeEventListener("resize", checkTabletSize)
  }, [])

  return !!isTablet
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
