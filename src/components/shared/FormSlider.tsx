
import React, { useState, useEffect, RefObject } from "react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormSliderProps {
  containerRef: RefObject<HTMLDivElement>;
}

export function FormSlider({ containerRef }: FormSliderProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      
      // Only show the slider if content is scrollable
      if (scrollHeight > clientHeight) {
        setIsVisible(true);
        
        // Calculate scroll percentage
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setSliderValue(scrollPercentage);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check
    checkScroll();
    
    // Add scroll event listener
    container.addEventListener("scroll", checkScroll);
    
    // Add resize listener to handle container size changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const newValue = value[0];
    setSliderValue(newValue);
    
    // Calculate new scroll position
    const scrollableDistance = container.scrollHeight - container.clientHeight;
    const newScrollTop = (scrollableDistance * newValue) / 100;
    
    // Apply new scroll position
    container.scrollTop = newScrollTop;
  };

  if (!isVisible) return null;

  return (
    <div className="form-slider-container pt-4">
      <div className="form-slider-label mb-3">
        <span>{t("form.scroll")}</span>
        <span>{Math.round(sliderValue)}%</span>
      </div>
      <Slider
        value={[sliderValue]}
        min={0}
        max={100}
        step={1}
        onValueChange={handleSliderChange}
        className="slider-track-spotify"
      />
    </div>
  );
}
