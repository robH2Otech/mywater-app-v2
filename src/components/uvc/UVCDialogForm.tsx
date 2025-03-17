
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Slider } from "@/components/ui/slider";
import { useRef, useState, useEffect } from "react";

interface UVCDialogFormProps {
  formData: {
    uvc_hours: string;
    uvc_installation_date: Date | null;
  };
  setFormData: (data: any) => void;
}

export function UVCDialogForm({ formData, setFormData }: UVCDialogFormProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      const currentPosition = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      setScrollPosition(currentPosition * 100);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      contentRef.current.scrollTop = (maxScrollTop * value[0]) / 100;
    }
  };

  // Set initial scroll position to 0 when component mounts
  useEffect(() => {
    setScrollPosition(0);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative pb-12">
      <div 
        ref={contentRef} 
        className="max-h-[60vh] overflow-y-auto pr-2"
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Enter the total accumulated UVC hours for this unit.
            </p>
            <FormInput
              label="UVC Hours"
              type="number"
              value={formData.uvc_hours}
              onChange={(value) => setFormData({ ...formData, uvc_hours: value })}
            />
          </div>

          <FormDatePicker
            label="Installation Date"
            value={formData.uvc_installation_date}
            onChange={(date) => setFormData({ ...formData, uvc_installation_date: date })}
          />
        </div>
      </div>
      
      {/* Form Navigation Slider */}
      <div className="form-slider-container absolute bottom-0 left-0 right-0 bg-spotify-darker">
        <Slider
          value={[scrollPosition]} 
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
