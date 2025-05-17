
import { Instagram, Facebook, Linkedin } from "lucide-react";

export const SocialLinks = () => {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-sm text-gray-400 mb-2">Visit X-WATER</p>
      <div className="flex justify-center space-x-4">
        <a 
          href="http://www.x-water.eu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-400"
        >
          <Instagram className="h-5 w-5" />
        </a>
        <a 
          href="http://www.x-water.eu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-500"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <a 
          href="http://www.x-water.eu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-600"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
