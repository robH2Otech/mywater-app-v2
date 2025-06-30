
import * as React from "react"

const MOBILE_BREAKPOINT = 475
const TABLET_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024
const LARGE_DESKTOP_BREAKPOINT = 1280

export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<{
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeDesktop: boolean;
    orientation: 'portrait' | 'landscape';
  }>(() => {
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
        orientation: 'landscape' as const
      }
    }
    
    const width = window.innerWidth
    const height = window.innerHeight
    
    return {
      width,
      height,
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < DESKTOP_BREAKPOINT,
      isDesktop: width >= DESKTOP_BREAKPOINT && width < LARGE_DESKTOP_BREAKPOINT,
      isLargeDesktop: width >= LARGE_DESKTOP_BREAKPOINT,
      orientation: width > height ? 'landscape' : 'portrait'
    }
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < DESKTOP_BREAKPOINT,
        isDesktop: width >= DESKTOP_BREAKPOINT && width < LARGE_DESKTOP_BREAKPOINT,
        isLargeDesktop: width >= LARGE_DESKTOP_BREAKPOINT,
        orientation: width > height ? 'landscape' : 'portrait'
      })
    }

    // Debounce resize events for better performance
    let timeoutId: number
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(handleResize, 100)
    }

    window.addEventListener("resize", debouncedResize)
    
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return screenSize
}

// Utility hooks for specific breakpoints
export function useIsMobile() {
  const { isMobile } = useResponsive()
  return isMobile
}

export function useIsTablet() {
  const { isTablet } = useResponsive()
  return isTablet
}

export function useIsDesktop() {
  const { isDesktop, isLargeDesktop } = useResponsive()
  return isDesktop || isLargeDesktop
}

// Touch device detection
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }
    
    checkTouch()
    window.addEventListener('touchstart', checkTouch, { once: true })
    
    return () => {
      window.removeEventListener('touchstart', checkTouch)
    }
  }, [])

  return isTouchDevice
}
