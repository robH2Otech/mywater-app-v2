
import { useEffect, useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormSliderProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function FormSlider({ containerRef }: FormSliderProps) {
  const [sliderValue, setSliderValue] = useState([0]);
  const [maxScroll, setMaxScroll] = useState(0);
  const isUpdatingRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScrollValues = () => {
      if (container) {
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const newMaxScroll = Math.max(0, scrollHeight - clientHeight);
        setMaxScroll(newMaxScroll);
      }
    };

    // Initial calculation
    calculateScrollValues();

    // Setup scroll event listener
    const handleScroll = () => {
      if (isUpdatingRef.current || !container) return;

      const scrollTop = container.scrollTop;
      const scrollPercentage = (scrollTop / maxScroll) * 100;
      setSliderValue([scrollPercentage]);
    };

    container.addEventListener("scroll", handleScroll);

    // Recalculate when window resizes
    const resizeObserver = new ResizeObserver(calculateScrollValues);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, maxScroll]);

  // Show slider only when content exceeds viewport
  if (maxScroll <= 0) return null;

  const handleSliderChange = (newValue: number[]) => {
    const container = containerRef.current;
    if (!container) return;

    isUpdatingRef.current = true;
    const scrollPosition = (newValue[0] / 100) * maxScroll;
    container.scrollTop = scrollPosition;

    // Prevent scroll events from updating slider while dragging
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };

  return (
    <div className="form-slider-container">
      <div className="form-slider-label">
        <span>Scroll Form</span>
        <span>{Math.round(sliderValue[0])}%</span>
      </div>
      <Slider 
        value={sliderValue} 
        onValueChange={handleSliderChange} 
        max={100} 
        step={1}
        className={isMobile ? "h-8" : ""}
      />
    </div>
  );
}
